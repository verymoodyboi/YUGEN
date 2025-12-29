import os from "os";
import fs from "fs";
import path from "path";
import supabase from "../lib/supabase.js";
import { transcodeToFile } from "../lib/ffmpeg.js";
import {
  submitVideoForModeration,
  checkPosterForModeration,
} from "../domains/moderation/moderation.services.js";
import { spawn } from "child_process";

const WORKER_ID = `worker-${process.pid}`;

async function fetchJob() {
  const { data, error } = await supabase.rpc("fetch_next_job", {
    p_worker: WORKER_ID,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

async function processFilm(job: any) {
  const { filmUuid, filmTmpPath, posterTmpPath } = job.payload;

  const tmp480 = path.join(os.tmpdir(), `${filmUuid}-480.mp4`);
  const tmp720 = path.join(os.tmpdir(), `${filmUuid}-720.mp4`);
  const tmp1080 = path.join(os.tmpdir(), `${filmUuid}-1080.mp4`);
  const tmpClip = path.join(os.tmpdir(), `${filmUuid}-clip.mp4`);

  try {
    await transcodeToFile(filmTmpPath, 480, tmp480);
    await transcodeToFile(filmTmpPath, 720, tmp720);
    await transcodeToFile(filmTmpPath, 1080, tmp1080);

    await Promise.all([
      supabase.storage.from("films.480p").upload(`${filmUuid}.mp4`, fs.readFileSync(tmp480), { upsert: true }),
      supabase.storage.from("films.720p").upload(`${filmUuid}.mp4`, fs.readFileSync(tmp720), { upsert: true }),
      supabase.storage.from("films.1080p").upload(`${filmUuid}.mp4`, fs.readFileSync(tmp1080), { upsert: true }),
      supabase.storage.from("posters").upload(`${filmUuid}.jpg`, fs.readFileSync(posterTmpPath), { upsert: true }),
    ]);

    await new Promise((res, rej) =>
      spawn("ffmpeg", ["-y", "-i", tmp480, "-t", "60", "-c", "copy", tmpClip])
        .on("exit", res)
        .on("error", rej)
    );

    await supabase.storage.from("moderation").upload(
      `${filmUuid}.mp4`,
      fs.readFileSync(tmpClip),
      { upsert: true }
    );

    const clipUrl = supabase.storage
      .from("moderation")
      .getPublicUrl(`${filmUuid}.mp4`).data.publicUrl;

    const posterUrl = supabase.storage
      .from("posters")
      .getPublicUrl(`${filmUuid}.jpg`).data.publicUrl;

    await submitVideoForModeration(filmUuid, clipUrl);
    await checkPosterForModeration(filmUuid, posterUrl);

    await supabase.from("films")
      .update({ moderation_status: "under_review" })
      .eq("film_uuid", filmUuid);

  } finally {
    // 🔥 ALWAYS CLEAN UP
    for (const f of [filmTmpPath, posterTmpPath, tmp480, tmp720, tmp1080, tmpClip]) {
      try { fs.unlinkSync(f); } catch {}
    }
  }
}

async function run() {
  while (true) {
    let job;
    try {
      job = await fetchJob();
      if (!job) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      if (job.type === "PROCESS_FILM") {
        await processFilm(job);
      }

      // ✅ mark done
      await supabase.from("jobs")
        .update({ status: "done" })
        .eq("id", job.id);

    } catch (err: any) {
      console.error("Worker error:", err);

      if (job) {
        if (job.attempts >= job.max_attempts) {
          await supabase.from("jobs").update({
            status: "failed",
            error: err.message,
          }).eq("id", job.id);
        } else {
          await supabase.from("jobs").update({
            status: "pending",
            run_at: new Date(Date.now() + 60_000),
            error: err.message,
          }).eq("id", job.id);
        }
      }

      // small backoff so we don't spin on fatal errors
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

run();
