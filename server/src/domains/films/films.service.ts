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
  const uploaderId = req.user!.id;

  const filmFile = (req.files as any)?.Film?.[0];
  const posterFile = (req.files as any)?.Poster?.[0];
  const Genres = JSON.parse(req.body.Genres || "[]");

  if (!filmFile || !posterFile) {
    throw new Error("Missing required files");
  }

  // 1) Generate UUID immediately (used for filenames / DB)
  const filmUuid = crypto.randomUUID();
  const filmKey = `${filmUuid}.mp4`;
  const posterKey = `${filmUuid}.jpg`;

  // 2) Upload originals first (request lifetime - make upload as quick as possible)
  // Read as streams/buffers. Using stream is fine; Supabase JS accepts Buffer or stream in Node env.
const filmBuffer = await fs.promises.readFile(filmFile.path);
const posterBuffer = await fs.promises.readFile(posterFile.path);

  const [filmUpload, posterUpload] = await Promise.all([
    supabase.storage
      .from("original_film_files")
      .upload(filmKey, filmBuffer, {
        contentType: filmFile.mimetype,
        upsert: true,
      }),
    supabase.storage
      .from("posters")
      .upload(posterKey, posterBuffer, {
        contentType: posterFile.mimetype,
        upsert: true,
      }),
  ]);

  if (filmUpload.error) throw filmUpload.error;
  if (posterUpload.error) throw posterUpload.error;

  // 3) Insert films row (initial minimal values; we will update more during processing)
  const { error: insertFilmErr } = await supabase.from("films").insert([
    {
      film_uuid: filmUuid,
      film_title: Title,
      thesis: Thesis,
      film_genre: Genres,
      uploader_id: uploaderId,
      country: Country,
      crew: Crew ? JSON.parse(Crew) : null,
      cast: Cast ? JSON.parse(Cast) : null,
      film_path: filmKey,
      poster_path: posterKey,
      // duration/embedding/transcode state will be filled by the worker
      film_duration: null,
      moderation_status: "queued",
      release_date: new Date().toISOString(),
    },
  ]);

  if (insertFilmErr) {
    // Attempt to remove uploaded files if DB insert failed (best-effort)
    try {
      await Promise.all([
        supabase.storage.from("original_film_files").remove([filmKey]),
        supabase.storage.from("posters").remove([posterKey]),
      ]);
    } catch (_) {}
    throw insertFilmErr;
  }

  // 4) Insert job row (queued). Keep job payload minimal and idempotent.
  const { data: jobInsertResp, error: jobInsertErr } = await supabase
    .from("jobs")
    .insert([
      {
        type: "PROCESS_FILM",
        status: "queued",
        payload: {
          filmUuid,
          filmKey,
          posterKey,
        },
        created_at: new Date().toISOString(),
      },
    ])
    .select("*")
    .single();

  if (jobInsertErr) {
    // Log but don't rollback film upload necessarily — you may decide to clean up
    console.error("Failed inserting job:", jobInsertErr);
    throw jobInsertErr;
  }

  // 5) Respond immediately (request returns quickly)
  return { success: true, film_uuid: filmUuid, job_id: jobInsertResp?.id ?? null };
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

const parsedGenres = Array.isArray(Genres)
  ? Genres
  : typeof Genres === "string"
  ? Genres.split(",").map((g) => g.trim())
  : [];

const filmEmbedding = await concatenateInfo(Title,Genres,Thesis,Country,uplouderUsername)

  const updateData = {
    film_title: Title,
    thesis: Thesis,
    film_genre: parsedGenres,
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
