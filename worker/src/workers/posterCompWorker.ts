// workers/poster/poster-worker.ts
import {
  claimNextPosterCompressionJob,
  fetchPosterCompressionJobPayload,
} from "../jobs/util/claim_next_job_poster.js";
import { processPosterCompressionJob } from "../jobs/job.process.compression.js";
import { ExponentialBackoff } from "./util/backoff.js";
import logger from "../lib/logger.js";

const BASE_BACKOFF_MS = Number(process.env.BACKOFF_BASE_MS ?? 500);
const MAX_BACKOFF_MS = Number(process.env.BACKOFF_MAX_MS ?? 30_000);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runPosterCompressionWorker() {
  const backoff = new ExponentialBackoff(BASE_BACKOFF_MS, MAX_BACKOFF_MS);

  logger.info("🖼️  Poster compression worker started", {
    baseBackoffMs: BASE_BACKOFF_MS,
    maxBackoffMs: MAX_BACKOFF_MS,
  });

  while (true) {
    try {
      const job = await claimNextPosterCompressionJob();

      if (!job) {
        const delay = backoff.next();
        logger.info("No poster compression jobs available, backing off", {
          delay,
        });
        await sleep(delay);
        continue;
      }

      backoff.reset();

      logger.info("🖼️  Processing poster compression job", { jobId: job.id });

      const payload = await fetchPosterCompressionJobPayload(job.id);

      await processPosterCompressionJob({ ...job, payload });
    } catch (err) {
      logger.error("❌ Poster compression worker loop error", err);
      await sleep(5_000);
    }
  }
}