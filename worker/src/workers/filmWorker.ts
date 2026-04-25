import { claimNextJob, fetchJobPayload } from "../jobs/util/claim_next_job.js";
import { processFilmJob } from "../jobs/job.process.film.js";
import { ExponentialBackoff } from "./util/backoff.js";
import logger from "../lib/logger.js";

const BASE_BACKOFF_MS = Number(process.env.BACKOFF_BASE_MS ?? 500);
const MAX_BACKOFF_MS = Number(process.env.BACKOFF_MAX_MS ?? 30_000);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runFilmWorker() {
  const backoff = new ExponentialBackoff(BASE_BACKOFF_MS, MAX_BACKOFF_MS);

  logger.info("🎬 Film worker started", {
    baseBackoffMs: BASE_BACKOFF_MS,
    maxBackoffMs: MAX_BACKOFF_MS,
  });

  while (true) {
    try {
      const job = await claimNextJob();

      if (!job) {
        const delay = backoff.next();
        logger.info("No jobs available, backing off", { delay });
        await sleep(delay);
        continue;
      }

      backoff.reset();

      logger.info("🚀 Processing job", { jobId: job.id });

      const payload = await fetchJobPayload(job.id);

      await processFilmJob({
        ...job,
        payload,
      });
    } catch (err) {
      logger.error("❌ Worker loop error", err);
      await sleep(5000);
    }
  }
}
