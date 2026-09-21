// workers/transcode/util/claim_next_transcode_job.ts
import * as os from "os";
import supabase from "../../lib/supabase.js";

const WORKER_NAME = process.env.TRANSCODE_WORKER_NAME ?? "transcode_worker";
const WORKER_INSTANCE_ID = process.env.WORKER_INSTANCE_ID;
const HOSTNAME = os.hostname();

const workerId = WORKER_INSTANCE_ID
  ? `${WORKER_NAME}_${WORKER_INSTANCE_ID}`
  : `${WORKER_NAME}_${HOSTNAME}`;

export async function claimNextTranscodeJob() {
  const { data, error } = await supabase.rpc("claim_next_transcode_job", {
    worker_id: workerId,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function fetchTranscodeJobPayload(jobId: string) {
  const { data, error } = await supabase
    .from("jobs_transcode")
    .select("payload")
    .eq("id", jobId)
    .single();
  if (error) throw error;
  return data.payload;
}
