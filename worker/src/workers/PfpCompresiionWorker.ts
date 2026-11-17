import {
  claimNextPfpCompressionJob,
  fetchPfpCompressionJobPayload,
} from "../jobs/util/claim_next_job_pfp.js";
import { processPfpCompressionJob } from "../jobs/job.process.pfp.compression.js";
import { ExponentialBackoff } from "./util/backoff.js";
import logger from "../lib/logger.js";

const BASE_BACKOFF_MS = Number(process.env.BACKOFF_BASE_MS ?? 500);
const MAX_BACKOFF_MS = Number(process.env.BACKOFF_MAX_MS ?? 30_000);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runPfpCompressionWorker() {
  const backoff = new ExponentialBackoff(BASE_BACKOFF_MS, MAX_BACKOFF_MS);

  logger.info("🖼️  Pfp compression worker started", {
    baseBackoffMs: BASE_BACKOFF_MS,
    maxBackoffMs: MAX_BACKOFF_MS,
  });

  while (true) {
    try {
      const job = await claimNextPfpCompressionJob();

      if (!job) {
        const delay = backoff.next();
        logger.info("No pfp compression jobs available, backing off", {
          delay,
        });
        await sleep(delay);
        continue;
      }

      backoff.reset();

      logger.info("🖼️  Processing pfp compression job", { jobId: job.id });

      const payload = await fetchPfpCompressionJobPayload(job.id);

      await processPfpCompressionJob({ ...job, payload });
    } catch (err) {
      logger.error("❌ Pfp compression worker loop error", err);
      await sleep(5_000);
    }
  }
}