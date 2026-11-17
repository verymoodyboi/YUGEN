// workers/transcode/transcode-worker.ts
import {
  claimNextTranscodeJob,
  fetchTranscodeJobPayload,
} from "../jobs/util/claim_next_job_HLS.js";
import { processTranscodeJob } from "../jobs/job.process.transcode.js";
import { ExponentialBackoff } from "./util/backoff.js";
import logger from "../lib/logger.js";

const BASE_BACKOFF_MS = Number(process.env.BACKOFF_BASE_MS ?? 500);
const MAX_BACKOFF_MS = Number(process.env.BACKOFF_MAX_MS ?? 30_000);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runTranscodeWorker() {
  const backoff = new ExponentialBackoff(BASE_BACKOFF_MS, MAX_BACKOFF_MS);

  logger.info("🎬 Transcode worker started", {
    baseBackoffMs: BASE_BACKOFF_MS,
    maxBackoffMs: MAX_BACKOFF_MS,
  });

  while (true) {
    try {
      const job = await claimNextTranscodeJob();

      if (!job) {
        const delay = backoff.next();
        logger.info("No transcode jobs available, backing off", { delay });
        await sleep(delay);
        continue;
      }

      backoff.reset();

      logger.info("🎬 Processing transcode job", { jobId: job.id });

      const payload = await fetchTranscodeJobPayload(job.id);

      await processTranscodeJob({
        ...job,
        payload,
      });
    } catch (err) {
      logger.error("❌ Transcode worker loop error", err);
      await sleep(5000);
    }
  }
}
