import supabase from "../lib/supabase.js";
import logger from "../lib/logger.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "../lib/r2.js";

const QENCODE_API_KEY = process.env.QENCODE_API_KEY;
const QENCODE_R2_KEY = process.env.QENCODE_R2_KEY;
const QENCODE_R2_SECRET = process.env.QENCODE_R2_SECRET;
if (!QENCODE_API_KEY) throw new Error("Missing QENCODE_API_KEY");

const BITRATES = [
  { label: "480p", width: 640, height: 480, bitrate: 1200 },
  { label: "720p", width: 1280, height: 720, bitrate: 2500 },
  { label: "1080p", width: 1920, height: 1080, bitrate: 4500 },
];

type Job = { id: string; payload: { film_uuid: string } };

export async function getSignedR2Url(key: string): Promise<string> {
  const cmd = new GetObjectCommand({
    Bucket: process.env.R2_INPUT_BUCKET!,
    Key: key,
  });
  return await getSignedUrl(r2, cmd, { expiresIn: 60 * 10 });
}

export async function processTranscodeJob(job: Job): Promise<string> {
  const filmId = job.payload?.film_uuid;
  if (!filmId) throw new Error("Invalid job payload");

  // 1. Get film path
  const { data: film, error: filmError } = await supabase
    .from("films")
    .select("film_path")
    .eq("film_uuid", filmId)
    .single();
  if (filmError || !film?.film_path) throw new Error("Film not found");

  // 2. Signed URL
  const inputUrl = `https://cdn.try-yugen.com/${encodeURIComponent(film.film_path)}`;

  // 3. Get access token
  const tokenRes = await fetch("https://api.qencode.com/v1/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `api_key=${QENCODE_API_KEY}`,
  });
  const { token } = (await tokenRes.json()) as { token?: string };
  if (!token) throw new Error("Failed to get access token");
  logger.info("Token obtained");

  // 4. Create task draft
  const createFormBody = new URLSearchParams({ token });
  const createRes = await fetch("https://api.qencode.com/v1/create_task", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: createFormBody.toString(),
  });
  const createJson = (await createRes.json()) as any;
  if (createJson.error || !createJson.task_token) {
    throw new Error(
      `Qencode create_task failed: ${createJson.message || createJson.error}`,
    );
  }
  const taskToken = createJson.task_token;
  logger.info("Task draft created", { taskToken });

  // 5. Prepare transcoding parameters
  const transcodePayload = {
    query: {
      source: inputUrl,
      format: [
        {
          output: "advanced_hls",
          filename: "playlist.m3u8",
          stream: BITRATES.map((b) => ({
            size: `${b.width}x${b.height}`,
            bitrate: b.bitrate,
          })),
          destination: {
        url: `s3://e13551af18ef5e8075dd24e485d17f26.r2.cloudflarestorage.com/films-transcoded/${filmId}`,
        key: QENCODE_R2_KEY,
        secret: QENCODE_R2_SECRET,
      },
        },
      ],
      
    },
  };

  // 6. Start the transcoding job (include token AND task_token)
  const startFormBody = new URLSearchParams({
    token,
    task_token: taskToken,
    query: JSON.stringify(transcodePayload),
  });
  const startRes = await fetch("https://api.qencode.com/v1/start_encode2", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: startFormBody.toString(),
  });
  logger.info(
    "FINAL QENCODE PAYLOAD",
    JSON.stringify(transcodePayload, null, 2),
  );
  const startJson = (await startRes.json()) as any;
  if (startJson.error) {
    throw new Error(
      `Qencode start_encode2 failed: ${startJson.message || startJson.error}`,
    );
  }
  logger.info("Transcoding started", startJson);

  // 7. Update database
  const { data, error } = await supabase
    .from("jobs_transcode")
    .update({
      qencode_task_id: taskToken,
      status: "processing",
      started_at: new Date().toISOString(),
      locked_at: null,
      locked_by: null,
      last_polled_at: new Date().toISOString(),
      progress: 0,
      output_path: `hls/${filmId}/playlist.m3u8`,
    })
    .eq("id", job.id)
    .select();

  if (error) {
    logger.error("❌ DB update failed", error);
    throw error;
  }

  if (!data || data.length === 0) {
    logger.error("❌ No rows updated", { jobId: job.id });
    throw new Error("Update failed: no rows matched");
  }

  logger.info("✅ DB updated with taskToken", { taskToken });
  logger.info("Transcode job submitted and started", {
    jobId: job.id,
    filmId,
    taskToken,
  });
  return taskToken;
}
