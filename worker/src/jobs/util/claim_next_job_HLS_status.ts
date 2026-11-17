// workers/transcode/util/claim_processing_job.ts
import * as os from "os";
import supabase from "../../lib/supabase.js";

const WORKER_NAME = "qencode_poll_worker";
const HOSTNAME = os.hostname();

const workerId = `${WORKER_NAME}_${HOSTNAME}`;

export async function claimProcessingJob() {
  const { data, error } = await supabase.rpc("claim_processing_transcode_job", {
    worker_id: workerId,
  });

  if (error) throw error;
  return data?.[0] ?? null;
}
