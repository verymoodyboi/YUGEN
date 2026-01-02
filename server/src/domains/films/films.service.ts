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

  const filmUuid = crypto.randomUUID();

  // Read buffers immediately
  const filmStream = fs.createReadStream(filmFile.path);
  const posterStream = fs.createReadStream(posterFile.path);

  const duration = await getDuration(filmFile.path);

  // 1️⃣ Insert DB row
  const { error } = await supabase.from("films").insert([
    {
      film_uuid: filmUuid,
      film_title: Title,
      thesis: Thesis,
      film_genre: Genres,
      uploader_id: uploaderId,
      country: Country,
      crew: Crew ? JSON.parse(Crew) : null,
      cast: Cast ? JSON.parse(Cast) : null,
      film_path: `${filmUuid}.mp4`,
      poster_path: `${filmUuid}.jpg`,
      film_duration: duration,
      moderation_status: "queued",
    },
  ]);

  if (error) throw error;

  // 2️⃣ Upload originals (FAST, streaming, async I/O)
  await Promise.all([
    supabase.storage
      .from("original_film_files")
      .upload(`${filmUuid}.mp4`, filmStream, {
        contentType: filmFile.mimetype,
        upsert: true,
      }),

    supabase.storage
      .from("posters")
      .upload(`${filmUuid}.jpg`, posterStream, {
        contentType: posterFile.mimetype,
        upsert: true,
      }),
  ]);

  // 3️⃣ Enqueue processing job
  await supabase.from("jobs").insert([
    {
      type: "PROCESS_FILM",
      payload: {
        filmUuid,
        filmKey: `${filmUuid}.mp4`,
        posterKey: `${filmUuid}.jpg`,
      },
    },
  ]);

  // 4️⃣ Respond immediately
  return { success: true, film_uuid: filmUuid };
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
