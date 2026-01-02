import os from "os";
import fs from "fs";
import path from "path";
import supabase from "../lib/supabase.js";
import { transcodeToFile } from "../lib/ffmpeg.js";
import {
  submitVideoForModeration,
  checkPosterForModeration,
} from "../domains/moderation/moderation.services.js";
import { concatenateInfo } from "../lib/embedding.js";
import { spawn } from "child_process";

const WORKER_ID = `worker-${process.pid}`;

/* ------------------------------------------------------------------ */
/* JOB FETCH                                                          */
/* ------------------------------------------------------------------ */
async function fetchJob() {
  const { data, error } = await supabase.rpc("fetch_next_job", {
    p_worker: WORKER_ID,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* UPLOAD ORIGINALS                                                   */
/* ------------------------------------------------------------------ */
async function uploadOriginals(job: any) {
  const {
    filmUuid,
    filmBase64,
    posterBase64,
    filmMime,
    posterMime,
  } = job.payload;

  const filmBuffer = Buffer.from(filmBase64, "base64");
  const posterBuffer = Buffer.from(posterBase64, "base64");

  await supabase.storage
    .from("original_film_files")
    .upload(`${filmUuid}.mp4`, filmBuffer, {
      contentType: filmMime,
      upsert: true,
    });

  await supabase.storage
    .from("posters")
    .upload(`${filmUuid}.jpg`, posterBuffer, {
      contentType: posterMime,
      upsert: true,
    });

  // enqueue processing step
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
}

/* ------------------------------------------------------------------ */
/* PROCESS FILM                                                       */
/* ------------------------------------------------------------------ */
async function downloadToTmp(bucket: string, key: string, target: string) {
  const { data, error } = await supabase.storage.from(bucket).download(key);
  if (error || !data) throw error || new Error("Download failed");

  const buffer = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync(target, buffer);
}

async function processFilm(job: any) {
  const { filmUuid, filmKey, posterKey } = job.payload;

  const tmpFilm = path.join(os.tmpdir(), `${filmUuid}-orig.mp4`);
  const tmpPoster = path.join(os.tmpdir(), `${filmUuid}-poster.jpg`);

  const tmp480 = path.join(os.tmpdir(), `${filmUuid}-480.mp4`);
  const tmp720 = path.join(os.tmpdir(), `${filmUuid}-720.mp4`);
  const tmp1080 = path.join(os.tmpdir(), `${filmUuid}-1080.mp4`);
  const tmpClip = path.join(os.tmpdir(), `${filmUuid}-clip.mp4`);

  try {
    /* 1️⃣ Download originals */
    await downloadToTmp("original_film_files", filmKey, tmpFilm);
    await downloadToTmp("posters", posterKey, tmpPoster);

    /* 2️⃣ Transcode */
    await transcodeToFile(tmpFilm, 480, tmp480);
    await transcodeToFile(tmpFilm, 720, tmp720);
    await transcodeToFile(tmpFilm, 1080, tmp1080);

    /* 3️⃣ Upload renditions */
    await Promise.all([
      supabase.storage.from("films.480p").upload(`${filmUuid}.mp4`, fs.readFileSync(tmp480), { upsert: true }),
      supabase.storage.from("films.720p").upload(`${filmUuid}.mp4`, fs.readFileSync(tmp720), { upsert: true }),
      supabase.storage.from("films.1080p").upload(`${filmUuid}.mp4`, fs.readFileSync(tmp1080), { upsert: true }),
    ]);

    /* 4️⃣ Moderation clip */
    await new Promise((res, rej) =>
      spawn("ffmpeg", ["-y", "-i", tmp480, "-t", "60", "-c", "copy", tmpClip])
        .on("exit", code => (code === 0 ? res(null) : rej(new Error("ffmpeg clip failed"))))
        .on("error", rej)
    );

    await supabase.storage
      .from("moderation")
      .upload(`${filmUuid}.mp4`, fs.readFileSync(tmpClip), { upsert: true });

    /* 5️⃣ Moderation services */
    const clipUrl = supabase.storage
      .from("moderation")
      .getPublicUrl(`${filmUuid}.mp4`).data.publicUrl;

    const posterUrl = supabase.storage
      .from("posters")
      .getPublicUrl(`${filmUuid}.jpg`).data.publicUrl;

    await submitVideoForModeration(filmUuid, clipUrl);
    await checkPosterForModeration(filmUuid, posterUrl);

    /* 6️⃣ Fetch metadata for embedding */
    const { data: film, error } = await supabase
      .from("films")
      .select("film_title, film_genre, thesis, country, uploader:users(username)")
      .eq("film_uuid", filmUuid)
      .single();

    if (error) throw error;

    const uploaderUsername = film.uploader?.[0]?.username;

    const filmEmbedding = await concatenateInfo(
      film.film_title,
      film.film_genre,
      film.thesis,
      film.country,
      uploaderUsername
    );

    /* 7️⃣ Final DB update */
    await supabase.from("films").update({
      moderation_status: "under_review",
      ...(filmEmbedding && { embedding: filmEmbedding }),
    }).eq("film_uuid", filmUuid);

  } finally {
    /* 🔥 Cleanup */
    for (const f of [
      tmpFilm,
      tmpPoster,
      tmp480,
      tmp720,
      tmp1080,
      tmpClip,
    ]) {
      try { fs.unlinkSync(f); } catch {}
    }
  }
}

/* ------------------------------------------------------------------ */
/* MAIN LOOP                                                          */
/* ------------------------------------------------------------------ */
async function run() {
  while (true) {
    let job;
    try {
      job = await fetchJob();
      if (!job) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      if (job.type === "UPLOAD_ORIGINALS") {
        await uploadOriginals(job);
      }

      if (job.type === "PROCESS_FILM") {
        await processFilm(job);
      }

      await supabase.from("jobs")
        .update({ status: "done" })
        .eq("id", job.id);

    } catch (err: any) {
      console.error("Worker error:", err);

      if (job) {
        await supabase.from("jobs").update({
          status: job.attempts >= job.max_attempts ? "failed" : "pending",
          run_at: new Date(Date.now() + 60_000),
          error: err.message,
        }).eq("id", job.id);
      }

      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

run();
