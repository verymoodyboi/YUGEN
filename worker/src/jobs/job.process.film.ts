import fs from "fs";
import os from "os";
import path from "path";
import supabase from "../lib/supabase.js";
import logger from "../lib/logger.js";
import { getDuration } from "../lib/ffmpeg.js";
import { concatenateInfo } from "../lib/embedding.js";
import {
  submitVideoForModeration,
  checkPosterForModeration,
  submitFramesForModeration,
} from "./moderation/moderation.services.js";
import { r2 } from "../lib/r2.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

logger.info("R2 CONFIG CHECK", {
  endpoint: process.env.R2_ENDPOINT,
  hasKey: !!process.env.R2_ACCESS_KEY_ID,
  hasSecret: !!process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_INPUT_BUCKET,
});

export async function processFilmJob(jobRow: any) {
  const jobId = jobRow.id;
  const payload = jobRow.payload ?? {};
  const filmUuid = payload.filmUuid;

  if (!filmUuid) {
    throw new Error("Invalid job payload: missing filmUuid");
  }

  await supabase
    .from("jobs")
    .update({
      status: "processing",
      started_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  try {
    const { data: filmRow, error } = await supabase
      .from("films")
      .select(
        "film_path, poster_path, film_title, film_genre, thesis, country, uploader_id",
      )
      .eq("film_uuid", filmUuid)
      .single();

    if (error || !filmRow?.film_path) {
      throw new Error("Film record missing paths");
    }

    const filmKey = filmRow.film_path;
    const posterKey = filmRow.poster_path;

    const tmpDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), `film-${filmUuid}-`),
    );
    const localFilmPath = path.join(tmpDir, filmKey);

    const r2Resp = await r2.send(
      new GetObjectCommand({
        Bucket: "films",
        Key: filmKey,
      }),
    );

    if (!r2Resp.Body) {
      throw new Error("Failed to download film from R2");
    }

    const filmBuffer = Buffer.from(await r2Resp.Body.transformToByteArray());
    await fs.promises.writeFile(localFilmPath, filmBuffer);

    const durationPretty = await getDuration(localFilmPath);

    await supabase
      .from("films")
      .update({ film_duration: durationPretty })
      .eq("film_uuid", filmUuid);

    const embeddingVector = await concatenateInfo(
      filmRow.film_title,
      filmRow.film_genre,
      filmRow.thesis,
      filmRow.country,
      filmRow.uploader_id?.toString?.() ?? null,
    );

    if (embeddingVector?.length) {
      await supabase
        .from("films")
        .update({ embedding: embeddingVector })
        .eq("film_uuid", filmUuid);
    }
    if (posterKey) {
      try {
        const publicPosterUrl = `${process.env.R2_BUCKET_POSTERS}/${posterKey}`;
        await checkPosterForModeration(filmUuid, publicPosterUrl);
      } catch (posterErr) {
        logger.warn("Poster moderation failed:", posterErr);

        await supabase.from("flagged_films").insert([
          {
            film_uuid: filmUuid,
            reason: "Poster moderation failed — requires manual review",
            status: "waiting for review",
          },
        ]);

        await supabase
          .from("films")
          .update({
            is_flagged: true,
            moderation_status: "failed",
            flag_reason: "Poster moderation failed — requires manual review",
          })
          .eq("film_uuid", filmUuid);
      }
    }

    const publicFilmUrl = `https://mod.try-yugen.com/${filmKey}`;

    const MOD_FRAME_COUNT = 4;
    const moderationFrameUrls = Array.from({ length: MOD_FRAME_COUNT }).map(
      (_, i) => `https://mod.try-yugen.com/${filmUuid}/key_${i + 1}.jpeg`,
    );

    try {
      logger.info("Submitting frames for moderation:", moderationFrameUrls);
      const { passed, maxScore, results } = await submitFramesForModeration(
        filmUuid,
        moderationFrameUrls,
      );

      // optional: take action based on passed boolean is already done in function
      // if you want to do additional post-processing, do it here
    } catch (err) {
      logger.error("Frame moderation failed:", err);
      // Already handled inside function, but you may want to escalate or retry
    }

    await supabase
      .from("jobs")
      .update({
        status: "completed",
      })
      .eq("id", jobId);

    fs.rmSync(tmpDir, { recursive: true, force: true });

    logger.info(`Job ${jobId} for film ${filmUuid} completed`);
    return { ok: true };
  } catch (err: any) {
    logger.error("processFilmJob failed:", err);

    const attempts = (jobRow.attempts ?? 0) + 1;
    const maxAttempts = jobRow.max_attempts ?? 3;

    if (attempts < maxAttempts) {
      const delaySeconds = Math.min(300, attempts * attempts * 30);
      const retryAt = new Date(Date.now() + delaySeconds * 1000).toISOString();

      await supabase
        .from("jobs")
        .update({
          status: "queued",
          attempts,
          run_at: retryAt,
          error: err.message ?? "Job failed",
        })
        .eq("id", jobId);

      logger.warn(
        ` Job ${jobId} failed (attempt ${attempts}/${maxAttempts}), retrying in ${delaySeconds}s`,
      );
    } else {
      await supabase
        .from("jobs")
        .update({
          status: "failed",
          attempts,
          error: err.message ?? "Job permanently failed",
        })
        .eq("id", jobId);

      await supabase
        .from("films")
        .update({
          moderation_status: "failed",
          is_flagged: true,
          flag_reason:
            "Processing pipeline failed after max retries — requires manual review",
        })
        .eq("film_uuid", filmUuid);

      logger.error(` Job ${jobId} permanently failed`);
    }

    throw err;
  }
}
