// workers/transcode/qencode-poll-worker.ts
import { claimProcessingJob } from "../jobs/util/claim_next_job_HLS_status.js";
import { processQencodeStatusJob } from "../jobs/job.process.CheckTranscode.js";
import { ExponentialBackoff } from "./util/backoff.js";
import logger from "../lib/logger.js";

const API_KEY = process.env.QENCODE_API_KEY!;

const BASE_BACKOFF_MS = Number(process.env.BACKOFF_BASE_MS ?? 500);
const MAX_BACKOFF_MS = Number(process.env.BACKOFF_MAX_MS ?? 30_000);

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://api.qencode.com/v1/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `api_key=${API_KEY}`,
  });

  const json = (await res.json()) as any;
  if (!json.token) throw new Error("Failed to get Qencode token");

  return json.token;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function runQencodePollWorker() {
  const backoff = new ExponentialBackoff(5000, MAX_BACKOFF_MS);

  logger.info("📡 Qencode poll worker started", {
    baseBackoffMs: BASE_BACKOFF_MS,
    maxBackoffMs: MAX_BACKOFF_MS,
  });

  let token = await getAccessToken();
  let lastTokenRefresh = Date.now();

  while (true) {
    try {
      // refresh token every ~10 mins
      if (Date.now() - lastTokenRefresh > 9 * 60 * 1000) {
        token = await getAccessToken();
        lastTokenRefresh = Date.now();
      }

      const job = await claimProcessingJob();

      if (!job) {
        const delay = backoff.next();
        logger.info("No processing jobs, backing off", { delay });
        await sleep(delay);
        continue;
      }

      // reset backoff when work is found
      backoff.reset();

      await processQencodeStatusJob(job, token);
    } catch (err) {
      logger.error("Poll worker error", err);

      // optional: also backoff on errors
      const delay = backoff.next();
      await sleep(Math.max(1000,delay));
    }
  }
}
