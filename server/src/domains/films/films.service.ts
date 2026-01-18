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


import { PutObjectCommand,DeleteObjectCommand  } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from '../../lib/r2.js';

export async function generateR2SignedPutUrl(params: {
  key: string;
  contentType: string;
  expiresIn?: number;
  bucket:string
}) {
  const command = new PutObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
    ContentType: params.contentType,
  });

  return getSignedUrl(r2, command, {
    expiresIn: params.expiresIn ?? 600, // seconds
  });
}

export async function deleteFromR2(bucket: string, key: string) {
  if (!key) return;

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (err) {
    console.warn(`R2 delete failed (${bucket}/${key})`, err);
  }
}
export async function initializeUpload(req: Request) {
  const {
    title,
    thesis,
    country,
    crew,
    cast,
    genres,
    filmMime,
    posterMime,
  } = req.body;

  const uploaderId = req.user!.id;

  const filmUuid = crypto.randomUUID();

  const filmExt = filmMime?.split("/")[1] ?? "mp4";
  const posterExt = posterMime?.split("/")[1] ?? "jpg";

  const filmKey = `${filmUuid}.${filmExt}`;
  const posterKey = `${filmUuid}.${posterExt}`;
  const moderationKey = `${filmUuid}.${filmExt}`; 

  const { error } = await supabase.from("films").insert([{
    film_uuid: filmUuid,
    film_title: title,
    thesis,
    film_genre: genres,
    uploader_id: uploaderId,
    country,
    crew: crew ?? null,
    cast: cast ?? null,
    film_path: filmKey,
    poster_path: posterKey,
    moderation_status: "uploading",
  }]);

  if (error) throw error;

  const filmUploadUrl = await generateR2SignedPutUrl({
    bucket: "films",
    key: filmKey,
    contentType: filmMime,
    expiresIn: 60 * 10,
  });

  const posterUploadUrl = await generateR2SignedPutUrl({
    bucket: "posters",
    key: posterKey,
    contentType: posterMime,
    expiresIn: 60 * 10,
  });

  const moderationUploadUrl = await generateR2SignedPutUrl({
    bucket: "moderation",
    key: moderationKey,
    contentType: filmMime,
    expiresIn: 60 * 10,
  });

  return {
    film_uuid: filmUuid,
    filmUploadUrl,
    posterUploadUrl,
    moderationUploadUrl,
    filmKey,
    posterKey,
  };
}





export async function deleteFilmService(
  film_uuid: string,
  userId: string
) {
  // 1️⃣ Fetch film (ownership enforced)
  const { data: film, error } = await supabase
    .from("films")
    .select("film_path, poster_path")
    .eq("film_uuid", film_uuid)
    .eq("uploader_id", userId)
    .single();

  if (error || !film) {
    throw new Error("Film not found or unauthorized");
  }

  const { film_path, poster_path } = film;

  const moderation_path = film_path
    ? film_path.replace(/\.(\w+)$/, "_moderation.$1")
    : null;

  const { error: deleteError } = await supabase
    .from("films")
    .delete()
    .eq("film_uuid", film_uuid)
    .eq("uploader_id", userId);

  if (deleteError) throw deleteError;

  await Promise.all([
    deleteFromR2("films", film_path),
    deleteFromR2("posters", poster_path),
    deleteFromR2("moderation", moderation_path),
  ]);

  return { success: true };
}






export async function processUpload(req: Request) {
  const { filmUuid } = req.body;

  //  Mark film uploaded
  await supabase.from("films").update({
    moderation_status: "queued",
  }).eq("film_uuid", filmUuid);

  //  Enqueue job
  const { data, error } = await supabase
    .from("jobs")
    .insert([{
      type: "PROCESS_FILM",
      status: "queued",
      payload: { filmUuid },
    }])
    .select()
    .single();

  if (error) throw error;

  return { jobId: data.id };
}







export async function retryUpload(req: Request) {
  const { filmUuid } = req.body;
  const userId = req.user!.id;

  if (!filmUuid) {
    throw new Error("filmUuid is required");
  }

  const { data: film, error } = await supabase
    .from("films")
    .select("film_path, poster_path, uploader_id")
    .eq("film_uuid", filmUuid)
    .single();

  if (error || !film) {
    throw new Error("Film not found");
  }

  if (film.uploader_id !== userId) {
    throw new Error("Unauthorized");
  }

  const filmExt = film.film_path.split(".").pop() ?? "mp4";
  const posterExt = film.poster_path?.split(".").pop() ?? "jpg";

  const filmMime = `video/${filmExt}`;
  const posterMime = `image/${posterExt}`;

  const uploadUrl = await generateR2SignedPutUrl({
    bucket: "films",
    key: film.film_path,
    contentType: filmMime,
    expiresIn: 60 * 10,
  });

  const poster_uploadUrl = film.poster_path
    ? await generateR2SignedPutUrl({
        bucket: "posters",
        key: film.poster_path,
        contentType: posterMime,
        expiresIn: 60 * 10,
      })
    : null;

  await supabase
    .from("films")
    .update({
      moderation_status: "uploading",
      processing_progress: 0,
      processing_step: null,
      updated_at: new Date().toISOString(),
    })
    .eq("film_uuid", filmUuid);

  return {
    uploadUrl,
    poster_uploadUrl,
  };
}

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
  const filmKey = `${filmUuid}.mp4`;
  const posterKey = `${filmUuid}.jpg`;

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
      film_duration: null,
      moderation_status: "queued",
      release_date: new Date().toISOString(),
    },
  ]);

  if (insertFilmErr) {
    try {
      await Promise.all([
        supabase.storage.from("original_film_files").remove([filmKey]),
        supabase.storage.from("posters").remove([posterKey]),
      ]);
    } catch (_) {}
    throw insertFilmErr;
  }

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
    console.error("Failed inserting job:", jobInsertErr);
    throw jobInsertErr;
  }

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
