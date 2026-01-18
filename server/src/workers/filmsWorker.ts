// src/workers/filmWorker.ts
import { claimNextJob } from "../domains/jobs/claimJob.js";
import { processFilmJob } from "../domains/jobs/process.services.js";

const POLL_INTERVAL_MS = 30;

async function runWorker() {
  console.log("🎬 Film worker started");

  while (true) {
    try {
      const job = await claimNextJob();

      if (!job) {
        // No jobs → sleep
        await sleep(POLL_INTERVAL_MS);
        continue;
      }

      console.log(`🚀 Processing job ${job.id}`);
      await processFilmJob(job);
    } catch (err) {
      console.error("❌ Worker error:", err);
      // avoid tight crash loop
      await sleep(5000);
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runWorker().catch((err) => {
  console.error("💥 Worker crashed:", err);
  process.exit(1);
});
