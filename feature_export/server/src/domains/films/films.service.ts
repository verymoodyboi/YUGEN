import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import type { Request } from 'express';

import supabase from '../../lib/supabase.js';
import { generateEmbedding,concatenateInfo } from '../../lib/embedding.js';
import { transcodeToFile, getDuration } from '../../lib/ffmpeg.js';
import logger from '../../lib/logger.js';
import type { FilmInsert, FilmUpdate } from './films.types.js';
import * as moderationService from '../moderation/moderation.services.js';
import { spawnSync } from 'child_process';
import { title } from 'process';


// Upload film
export async function uploadFilm(req: Request, providedUuid?: string) {
  const { Title, Thesis, Country, Crew, Cast } = req.body;
  const uplouderUsername= req.body?.uplouderUsername;
  const uploaderId = req.user?.id;
  const filmFile = (req.files as any)?.Film?.[0];
  const posterFile = (req.files as any)?.Poster?.[0];
  const Genres = JSON.parse(req.body.Genres || "[]");

  if (!filmFile || !posterFile) throw new Error("Missing required files");

  const uuid = providedUuid ?? crypto.randomUUID();
  const filmFileName = `${uuid}.mp4`;
  const posterFileName = `${uuid}.jpg`;

  // const embedding = await generateEmbedding(Thesis);
const embedding = await concatenateInfo(Title,Genres,Thesis,Country,uplouderUsername)
  // Temp file paths
  const tmp480 = path.join(os.tmpdir(), `${uuid}-480p.mp4`);
  const tmp720 = path.join(os.tmpdir(), `${uuid}-720p.mp4`);
  const tmp1080 = path.join(os.tmpdir(), `${uuid}-1080p.mp4`);
  const tmpClip = path.join(os.tmpdir(), `${uuid}-clip.mp4`);

  // Transcode 3 resolutions
  await transcodeToFile(filmFile.path, 480, tmp480);
  await transcodeToFile(filmFile.path, 720, tmp720);
  await transcodeToFile(filmFile.path, 1080, tmp1080);

  // Extract first 60s from 480p for moderation
  spawnSync("ffmpeg", ["-y", "-i", tmp480, "-t", "60", "-c", "copy", tmpClip]);

  // Upload video files + poster + moderation clip
  const uploads = [
    supabase.storage.from("films.480p").upload(filmFileName, fs.readFileSync(tmp480), {
      contentType: "video/mp4",
      upsert: true,
    }),
    supabase.storage.from("films.720p").upload(filmFileName, fs.readFileSync(tmp720), {
      contentType: "video/mp4",
      upsert: true,
    }),
    supabase.storage.from("films.1080p").upload(filmFileName, fs.readFileSync(tmp1080), {
      contentType: "video/mp4",
      upsert: true,
    }),
    supabase.storage.from("posters").upload(posterFileName, fs.readFileSync(posterFile.path), {
      contentType: "image/jpeg",
      upsert: true,
    }),
    supabase.storage.from("moderation").upload(filmFileName, fs.readFileSync(tmpClip), {
      contentType: "video/mp4",
      upsert: true,
    }),
  ];

  await Promise.all(uploads);

  // Duration for metadata
  const duration = await getDuration(filmFile.path);

  // Insert into DB (under_review initially)
  const film: FilmInsert = {
    film_uuid: uuid,
    film_title: Title,
    thesis: Thesis,
    film_genre: Genres,
    uploader_id: uploaderId!,
    country: Country,
    crew: Crew ? JSON.parse(Crew) : null,
    cast: Cast ? JSON.parse(Cast) : null,
    film_path: filmFileName,
    poster_path: posterFileName,
    film_duration: duration,
    embedding,
    moderation_status: "under_review",
  };

  const { error: insertErr } = await supabase.from("films").insert([film]);
  if (insertErr) throw new Error(insertErr.message);

  await supabase.rpc("update_user_films_count", { p_user: uploaderId });

  // Get public URL for moderation clip
  const { data: clipUrlData } = supabase.storage.from("moderation").getPublicUrl(filmFileName);
  const clipUrl = clipUrlData?.publicUrl ?? clipUrlData?.publicUrl ?? null;
  if (!clipUrl) {
    // cleanup and flag
    await supabase
      .from("films")
      .update({
        moderation_status: "failed",
        is_flagged: true,
        flag_reason: "Failed to generate public URL for moderation clip",
      })
      .eq("film_uuid", uuid);

    await supabase.from("flagged_films").insert([
      {
        film_uuid: uuid,
        reason: "Failed to generate public URL for moderation clip",
        status: "waiting for review",
      },
    ]);
    throw new Error("Failed to get public URL for moderation clip");
  }

  // Get public URL for poster (for immediate check)
  const { data: posterUrlData } = supabase.storage.from("posters").getPublicUrl(posterFileName);
  const posterPublicUrl = posterUrlData?.publicUrl ?? posterUrlData?.publicUrl ?? null;

  // 🔹 Submit the clip to Sightengine for async moderation (callback handles result)
  try {
    await moderationService.submitVideoForModeration(uuid, clipUrl);
    logger.info(`Submitted ${uuid} for async moderation via callback.`);
  } catch (err: any) {
    logger.error("Moderation submission failed:", err?.message || err);
    // submission function already flags film & inserts flagged_films; optionally ensure DB shows failed
    try {
      await supabase
        .from("films")
        .update({ moderation_status: "failed" })
        .eq("film_uuid", uuid);
    } catch (e) {
      logger.warn("Failed to mark film failed after submission error", e);
    }
  }

  // 🔹 Also check poster immediately (sync). This must pass as well for approval.
  if (posterPublicUrl) {
    try {
      await moderationService.checkPosterForModeration(uuid, posterPublicUrl);
    } catch (err: any) {
      // checkPosterForModeration already flags the film on failure/rejection
      logger.warn("Poster moderation check raised an error (already handled):", err?.message || err);
    }
  } else {
    logger.warn("⚠️ No public URL for poster — skipping poster moderation (will require manual review)");
    // Flag it — poster must be reviewed
    try {
      await supabase
        .from("films")
        .update({
          is_flagged: true,
          moderation_status: "failed",
          flag_reason: "Poster not publicly accessible for moderation",
        })
        .eq("film_uuid", uuid);

      await supabase.from("flagged_films").insert([
        {
          film_uuid: uuid,
          reason: "Poster not publicly accessible for moderation",
          status: "waiting for review",
        },
      ]);
    } catch (e) {
      logger.error("Failed to flag due to missing poster public url:", e);
    }
  }

  // Cleanup tmp files
  for (const p of [filmFile.path, posterFile.path, tmp480, tmp720, tmp1080, tmpClip]) {
    try {
      fs.unlinkSync(p);
    } catch {}
  }

  return { success: true, film_uuid: uuid };
}


// Edit film
export async function editFilm(req: Request) {
  const { Film_id, Title, Thesis, Genres, Country, Crew, Cast } = req.body;
  const file = req.file;
  const uplouderUsername= req.body?.uplouderUsername;

  const { data: film, error } = await supabase
    .from('films')
    .select('uploader_id')
    .eq('film_uuid', Film_id)
    .single();

  if (error || !film) throw new Error('Film not found');
  if (film.uploader_id !== req.user?.id) throw new Error('Not authorized');

  if (file) {
    await supabase.storage.from('posters').remove([`${Film_id}.jpg`]);
    await supabase.storage.from('posters').upload(`${Film_id}.jpg`, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });
  }

const filmEmbedding = await concatenateInfo(Title,Genres,Thesis,Country,uplouderUsername)

  const updateData = {
    film_title: Title,
    thesis: Thesis,
    film_genre: Genres,
    country: Country,
    crew: Crew,
    cast: Cast,
    updated_at: new Date(),
    ...(filmEmbedding && { embedding: filmEmbedding }),
    ...(file && { poster_path: `${Film_id}.jpg` }),
  };

  const { error: updateError } = await supabase.from('films').update(updateData).eq('film_uuid', Film_id);
  if (updateError) throw new Error(updateError.message);

  return { success: true };
}

// Delete film
export async function deleteFilm(req: Request) {
  const { film_uuid } = req.body;

  const { data: film, error } = await supabase
    .from('films')
    .select('uploader_id')
    .eq('film_uuid', film_uuid)
    .single();

  if (error || !film) throw new Error('Film not found');
  if (film.uploader_id !== req.user?.id) throw new Error('Not authorized');

  const buckets = ['films.480p', 'films.720p', 'films.1080p'];
  for (const bucket of buckets) {
    await supabase.storage.from(bucket).remove([`${film_uuid}.mp4`]);
  }
  await supabase.storage.from('posters').remove([`${film_uuid}.jpg`]);

  const { error: deleteError } = await supabase.from('films').delete().eq('film_uuid', film_uuid);
  if (deleteError) throw new Error(deleteError.message);

  await supabase.rpc('update_user_films_count', { p_user: req.user?.id });

  return { success: true };
}

// Get film upload/processing status
// Status function removed in revert
