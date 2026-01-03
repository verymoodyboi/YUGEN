// src/domains/jobs/process.services.ts
import fs from "fs";
import os from "os";
import path from "path";
import supabase from "../../lib/supabase.js";
import logger from "../../lib/logger.js";
import { getDuration, transcodeToFile } from "../../lib/ffmpeg.js";
import { concatenateInfo } from "../../lib/embedding.js";
import { submitVideoForModeration, checkPosterForModeration } from "../moderation/moderation.services.js";

/**
 * Worker entry: process a single job row (type=PROCESS_FILM).
 * This function is idempotent-ish: if job.status is 'completed' skip, if 'processing' continue.
 */
export async function processFilmJob(jobRow: any) {
  const jobId = jobRow.id;
  const payload = jobRow.payload ?? {};
  const filmUuid = payload.filmUuid;
  const filmKey = payload.filmKey;
  const posterKey = payload.posterKey;

  if (!filmUuid || !filmKey) {
    throw new Error("Invalid job payload: missing filmUuid/filmKey");
  }

  // mark job processing (optimistic)
  await supabase.from("jobs").update({
    status: "processing",
    started_at: new Date().toISOString(),
  }).eq("id", jobId);

  try {
    // 1) Download original film from storage to temp file
    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), `film-${filmUuid}-`));
    const localFilmPath = path.join(tmpDir, filmKey);
    const localPosterPath = path.join(tmpDir, posterKey);

    // download film
    const { data: filmDownload, error: filmDlErr } = await supabase.storage
      .from("original_film_files")
      .download(filmKey);

    if (filmDlErr || !filmDownload) throw filmDlErr ?? new Error("Failed to download film from storage");

    // data is a ReadableStream / Blob depending on runtime; convert to Buffer for Node
    const filmBuffer = Buffer.from(await filmDownload.arrayBuffer());
    await fs.promises.writeFile(localFilmPath, filmBuffer);

    // download poster (used for poster moderation check)
    const { data: posterDownload, error: posterDlErr } = await supabase.storage
      .from("posters")
      .download(posterKey);

    if (posterDlErr || !posterDownload) {
      // log but continue — poster moderation can be retried later
      logger.warn("Could not download poster for moderation:", posterDlErr);
    } else {
      const posterBuffer = Buffer.from(await posterDownload.arrayBuffer());
      await fs.promises.writeFile(localPosterPath, posterBuffer);
    }

    // 2) Compute duration
    const durationPretty = await getDuration(localFilmPath); // "Xm Ys"
    logger.info(`Film ${filmUuid} duration: ${durationPretty}`);

    // Save duration on film row (early so DB reflects this quickly)
    await supabase.from("films").update({
      film_duration: durationPretty,
    }).eq("film_uuid", filmUuid);

    // 3) Generate embedding (concatenate metadata)
    // Fetch film metadata from DB so we can enrich the embedding text (for title/uploader/genres)
    const { data: filmRows, error: filmSelectErr } = await supabase
      .from("films")
      .select("film_title, film_genre, thesis, country, uploader_id")
      .eq("film_uuid", filmUuid)
      .limit(1)
      .single();

    if (filmSelectErr) {
      logger.warn("Failed to fetch film metadata for embedding:", filmSelectErr);
    }

    const embeddingVector = await concatenateInfo(
      filmRows?.film_title,
      filmRows?.film_genre,
      filmRows?.thesis,
      filmRows?.country,
      filmRows?.uploader_id?.toString?.() ?? null
    );

    if (embeddingVector && embeddingVector.length > 0) {
      // store embedding as JSON / Postgres float8[] depending on schema
      await supabase.from("films").update({
        embedding: embeddingVector,
      }).eq("film_uuid", filmUuid);
    }

    // 4) Submit for moderation (asynchronous job, Sightengine will callback later)
    // Build public URL for the original file if you have a public CDN link.
    // If you use presigned URLs: generate a temporary public url to pass to Sightengine.
    const { data: publicUrlResp } = supabase.storage.from("original_film_files").getPublicUrl(filmKey);
    const publicFilmUrl = publicUrlResp?.publicUrl ?? null;

    if (publicFilmUrl) {
      try {
        await submitVideoForModeration(filmUuid, publicFilmUrl);
      } catch (modErr) {
        // submitVideoForModeration already flags film on failure.
        logger.error("submitVideoForModeration failed:", modErr);
      }
    } else {
      logger.warn("No public URL available for moderation; marking film under manual review");
      await supabase.from("films").update({
        moderation_status: "failed",
        is_flagged: true,
        flag_reason: "No public URL available for automated moderation",
      }).eq("film_uuid", filmUuid);
    }

    // Poster synchronous check (image)
   try {
  const { data: posterPublic } =
    supabase.storage.from("posters").getPublicUrl(posterKey);

  const posterUrl = posterPublic?.publicUrl;

  if (!posterUrl) {
    throw new Error("Failed to get public poster URL");
  }

  await checkPosterForModeration(filmUuid, posterUrl);
} catch (posterErr) {
  logger.warn("Poster moderation failed/flagged:", posterErr);

  await supabase.from("films").update({
    is_flagged: true,
    moderation_status: "failed",
    flag_reason: "Poster moderation unavailable — requires manual review",
  }).eq("film_uuid", filmUuid);

  await supabase.from("flagged_films").insert([{
    film_uuid: filmUuid,
    reason: "Poster moderation unavailable — requires manual review",
    status: "waiting for review",
  }]);
}


    // 5) Transcode to target resolutions and upload results
    const targetResolutions = [1080, 720, 480]; // you can change / extend
    const transcodedPaths: string[] = [];

    for (const res of targetResolutions) {
      const outName = `${filmUuid}.mp4`;
  const outLocal = path.join(tmpDir, `${filmUuid}_${res}p.tmp.mp4`);

      try {
        await transcodeToFile(localFilmPath, res, outLocal);

        // upload transcoded file into storage (e.g. bucket 'transcoded_films')
        const buffer = await fs.promises.readFile(outLocal);
        const uploadResp = await supabase.storage.from(`films.${res}p`).upload(outName, buffer, {
          contentType: "video/mp4",
          upsert: true,
        });

        if (uploadResp.error) {
          logger.warn(`Failed upload transcoded ${res} for ${filmUuid}:`, uploadResp.error);
        } else {
          transcodedPaths.push(outName);
        }
      } catch (txErr) {
        logger.warn(`Transcode/resolution ${res} failed for ${filmUuid}:`, txErr);
      }
    }

    // 6) Update film row with transcode results + processing metadata
    await supabase.from("films").update({
      transcoded_paths: transcodedPaths,
      processing_completed_at: new Date().toISOString(),
      transcode_status: transcodedPaths.length ? "ok" : "partial_or_failed",
    }).eq("film_uuid", filmUuid);

    // 7) Mark job completed
    await supabase.from("jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      result: {
        transcoded: transcodedPaths,
        duration: durationPretty,
      },
    }).eq("id", jobId);

    // cleanup local tmp files (best-effort)
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {}

    logger.info(`Job ${jobId} for film ${filmUuid} completed`);
    return { ok: true };
  } catch (err: any) {
    logger.error("processFilmJob failed:", err?.message ?? err);

    // Mark job failed
    try {
      await supabase.from("jobs").update({
        status: "failed",
        error: err?.message ?? String(err),
        completed_at: new Date().toISOString(),
      }).eq("id", jobId);
    } catch (jobUpdateErr) {
      logger.error("Failed to mark job as failed:", jobUpdateErr);
    }

    // Optionally mark film as flagged / processing failed
    try {
      await supabase.from("films").update({
        processing_failed_at: new Date().toISOString(),
        processing_error: err?.message ?? String(err),
        moderation_status: "failed",
        is_flagged: true,
        flag_reason: "Processing pipeline failed — requires manual review",
      }).eq("film_uuid", filmUuid);
    } catch (filmUpdateErr) {
      logger.warn("Failed to mark film row after job failure:", filmUpdateErr);
    }

    // rethrow so caller/worker scheduler knows
    throw err;
  }
}
