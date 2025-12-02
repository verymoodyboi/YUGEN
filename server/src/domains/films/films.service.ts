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
export async function uploadFilm(req: Request) {
  const { Title, Thesis, Country, Crew, Cast } = req.body;
  const uplouderUsername = req.body?.uplouderUsername;
  const uploaderId = req.user?.id;
  const filmFile = (req.files as any)?.Film?.[0];
  const posterFile = (req.files as any)?.Poster?.[0];
  const Genres = JSON.parse(req.body.Genres || "[]");

  if (!filmFile || !posterFile) throw new Error("Missing required files");

  const uuid = crypto.randomUUID();
  const filmFileName = `${uuid}.mp4`;
  const posterFileName = `${uuid}.jpg`;

  const duration = await getDuration(filmFile.path);

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
    moderation_status: "uploading",
  };

  const { error: insertErr } = await supabase.from("films").insert([film]);
  if (insertErr) logger.error("Error uploading film:", insertErr, "by:", uploaderId, "");

  await supabase.rpc("update_user_films_count", { p_user: uploaderId });

  const embedding = await concatenateInfo(
    Title,
    Genres,
    Thesis,
    Country,
    uplouderUsername
  );

  const { error: embedError } = await supabase
    .from("films")
    .update({ embedding: embedding })
    .eq("film_uuid", uuid);

  if (embedError) {
    logger.error("inserting embedding error:", embedError);
  }

  const tmp480 = path.join(os.tmpdir(), `${uuid}-480p.mp4`);
  const tmp720 = path.join(os.tmpdir(), `${uuid}-720p.mp4`);
  const tmp1080 = path.join(os.tmpdir(), `${uuid}-1080p.mp4`);
  const tmpClip = path.join(os.tmpdir(), `${uuid}-clip.mp4`);

  await transcodeToFile(filmFile.path, 480, tmp480);
  await transcodeToFile(filmFile.path, 720, tmp720);
  await transcodeToFile(filmFile.path, 1080, tmp1080);

  spawnSync("ffmpeg", ["-y", "-i", tmp480, "-t", "60", "-c", "copy", tmpClip]);

  // -----------------------------
  // ⬇️ Upload Block With Error Handling (minimal change)
  // -----------------------------
  const uploads = [
    supabase.storage.from("posters").upload(posterFileName, fs.readFileSync(posterFile.path), {
      contentType: "image/jpeg",
      upsert: true,
    }),
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
    supabase.storage.from("moderation").upload(filmFileName, fs.readFileSync(tmpClip), {
      contentType: "video/mp4",
      upsert: true,
    }),
  ];

  try {
    await Promise.all(uploads);
  } catch (uploadErr) {
    logger.error("❌ Upload error:", uploadErr);

    await supabase
      .from("films")
      .update({
        moderation_status: "upload_error",
        is_flagged: true,
        flag_reason: "Upload failed (non-moderation issue)",
      })
      .eq("film_uuid", uuid);

    await supabase.from("flagged_films").insert([
      {
        film_uuid: uuid,
        reason: "Upload failed (non-moderation issue)",
        status: "waiting for review",
      },
    ]);

    throw new Error("Upload failed — film marked as upload_error");
  }
 

  const { data: clipUrlData } = supabase.storage
    .from("moderation")
    .getPublicUrl(filmFileName);

  const clipUrl = clipUrlData?.publicUrl ?? null;

  if (!clipUrl) {
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

  const { data: posterUrlData } = supabase.storage
    .from("posters")
    .getPublicUrl(posterFileName);

  const posterPublicUrl = posterUrlData?.publicUrl ?? null;

  try {
    await moderationService.submitVideoForModeration(uuid, clipUrl);
    logger.info(`Submitted ${uuid} for async moderation via callback.`);
  } catch (err: any) {
    logger.error("Moderation submission failed:", err?.message || err);
    try {
      await supabase
        .from("films")
        .update({ moderation_status: "failed" })
        .eq("film_uuid", uuid);
    } catch (e) {
      logger.warn("Failed to mark film failed after submission error", e);
    }
  }

  if (posterPublicUrl) {
    try {
      await moderationService.checkPosterForModeration(uuid, posterPublicUrl);
    } catch (err: any) {
      logger.warn(
        "Poster moderation check raised an error (already handled):",
        err?.message || err
      );
    }
  } else {
    logger.warn(
      "⚠️ No public URL for poster — skipping poster moderation (will require manual review)"
    );
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

  for (const p of [
    filmFile.path,
    posterFile.path,
    tmp480,
    tmp720,
    tmp1080,
    tmpClip,
  ]) {
    try {
      fs.unlinkSync(p);
    } catch {}
  }

  const { error: doneError } = await supabase
    .from("films")
    .update({ moderation_status: "under_review" })
    .eq("film_uuid", uuid);

  if (doneError) {
    logger.error("mark done error:", doneError);
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
