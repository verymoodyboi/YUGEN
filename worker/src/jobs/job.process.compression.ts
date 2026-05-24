import supabase from "../lib/supabase.js";
import logger from "../lib/logger.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../lib/r2.js";

const TINIFY_API_KEY = process.env.TINIFY_API_KEY;
const R2_OUTPUT_BUCKET = process.env.R2_OUTPUT_BUCKET_POSTER!;
const CDN_BASE_URL = process.env.CDN_BASE_URL ?? "https://posters.try-yugen.com";

if (!TINIFY_API_KEY) throw new Error("Missing TINIFY_API_KEY");
if (!R2_OUTPUT_BUCKET) throw new Error("Missing R2_OUTPUT_BUCKET");

const TINIFY_AUTH = `Basic ${Buffer.from(`api:${TINIFY_API_KEY}`).toString("base64")}`;
const TINIFY_SHRINK_URL = "https://api.tinify.com/shrink";

type Job = { id: string; payload: { film_uuid: string } };

/**
 * Flow (no original image bytes on this server):
 *
 *   1. Tinify fetches the poster from your public CDN URL directly.
 *   2. We generate a presigned R2 PUT URL (no data, just a signed token).
 *   3. We stream the compressed result from Tinify → R2 via that PUT URL.
 *      Node pipes the response body without buffering the full image in memory.
 *
 * Tinify's `store` API cannot target R2 because it hard-codes AWS S3 URL
 * construction and ignores any custom endpoint field.
 */
export async function processPosterCompressionJob(job: Job): Promise<void> {
  const filmId = job.payload?.film_uuid;
  if (!filmId) throw new Error("Invalid job payload: missing film_uuid");

  // ── 1. Resolve poster path ──────────────────────────────────────────────────
  const { data: film, error: filmError } = await supabase
    .from("films")
    .select("poster_path")
    .eq("film_uuid", filmId)
    .single();

  if (filmError || !film?.poster_path) {
    throw new Error(`Film not found or missing poster_path: ${filmId}`);
  }

  // ── 2. Submit source URL to Tinify — Tinify fetches the image itself ────────
  const sourceUrl = `${CDN_BASE_URL}/${encodeURIComponent(film.poster_path)}`;
  logger.info("📸 Submitting poster to Tinify", { filmId, sourceUrl });

  const shrinkRes = await fetch(TINIFY_SHRINK_URL, {
    method: "POST",
    headers: {
      Authorization: TINIFY_AUTH,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ source: { url: sourceUrl } }),
  });

  if (!shrinkRes.ok) {
    const body = await shrinkRes.text().catch(() => "(unreadable)");
    throw new Error(`Tinify shrink failed [${shrinkRes.status}]: ${body}`);
  }

  const tinifyLocation = shrinkRes.headers.get("location");
  if (!tinifyLocation) throw new Error("Tinify response missing Location header");

  const shrinkJson = (await shrinkRes.json()) as {
    input: { size: number; type: string };
    output: { size: number; type: string; ratio: number; width: number; height: number };
  };

  logger.info("✅ Tinify compression done", {
    filmId,
    inputBytes: shrinkJson.input.size,
    outputBytes: shrinkJson.output.size,
    ratio: shrinkJson.output.ratio,
  });

  // ── 3. Build output key ─────────────────────────────────────────────────────
  const originalExt = film.poster_path.split(".").pop() ?? "jpg";
  const outputKey = film.poster_path;
  const contentType = shrinkJson.output.type ?? "image/jpeg";

  // ── 4. Presigned PUT URL for R2 (no data exchanged yet) ────────────────────
  // ── 5. Download compressed image from Tinify, upload to R2 via SDK ──────────
  //    The original poster (3–4 MB) never touches this server — Tinify fetched
  //    it directly from your CDN.  Only the already-compressed output (~300 KB)
  //    is buffered here before being pushed to R2 with the SDK, which handles
  //    signing correctly (presigned URLs require x-amz-content-sha256 which
  //    Node fetch doesn't send automatically, causing R2's misleading
  //    "ExpiredRequest" 403).
  const tinifyImageRes = await fetch(tinifyLocation, {
    headers: { Authorization: TINIFY_AUTH },
  });

  if (!tinifyImageRes.ok) {
    throw new Error(
      `Failed to fetch compressed image from Tinify [${tinifyImageRes.status}]`,
    );
  }

  const compressedBuffer = Buffer.from(await tinifyImageRes.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_OUTPUT_BUCKET,
      Key: outputKey,
      Body: compressedBuffer,
      ContentType: contentType,
      ContentLength: compressedBuffer.byteLength,
    }),
  );

  logger.info("✅ Compressed poster uploaded to R2", {
    filmId,
    outputKey,
    compressedBytes: compressedBuffer.byteLength,
  });

  // ── 6. Mark job complete ────────────────────────────────────────────────────
  const { data, error: updateError } = await supabase
    .from("jobs_poster_compression")
    .update({
      status: "completed",
      locked_at: null,
      locked_by: null,
      output_path: outputKey,
      compressed_at: new Date().toISOString(),
      original_bytes: shrinkJson.input.size,
      compressed_bytes: shrinkJson.output.size,
    })
    .eq("id", job.id)
    .select();

  if (updateError) {
    logger.error("❌ DB update failed", updateError);
    throw updateError;
  }

  if (!data || data.length === 0) {
    throw new Error("Update failed: no rows matched for job id " + job.id);
  }

  logger.info("✅ Poster compression job complete", {
    jobId: job.id,
    filmId,
    outputKey,
    savedBytes: shrinkJson.input.size - shrinkJson.output.size,
  });
}