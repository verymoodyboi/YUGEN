// workers/transcode/jobs/job.process.qencode-status.ts
import supabase from "../lib/supabase.js";
import logger from "../lib/logger.js";
import { getQencodeStatus } from "../workers/util/checkTransStatus.js";

type Job = {
  id: string;
  qencode_task_id: string;
};

export async function processQencodeStatusJob(job: Job, token: string) {
  const taskToken = job.qencode_task_id;

  logger.info("Checking Qencode status", {
    jobId: job.id,
    taskToken,
  });

  const status = await getQencodeStatus(token, taskToken);

  if (!status) {
    logger.warn("No status returned", { taskToken });
    return;
  }
  logger.info("Qencode full status", JSON.stringify(status, null, 2));
  const state = status.status;

  if (state === "completed") {
    await supabase
      .from("jobs_transcode")
      .update({
        status: "finished",
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    logger.info("✅ Transcode finished", { jobId: job.id });
  } else if (state === "error") {
    await supabase
      .from("jobs_transcode")
      .update({
        status: "failed",
      })
      .eq("id", job.id);

    logger.error("❌ Transcode failed", { jobId: job.id });
  } else {
    // still processing → release lock
    await supabase
      .from("jobs_transcode")
      .update({
        locked_at: null,
        locked_by: null,
      })
      .eq("id", job.id);

    logger.info("⏳ Still processing", { jobId: job.id });
  }
}
