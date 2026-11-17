import * as os from "os";
import supabase from "../../lib/supabase.js";

const WORKER_NAME = process.env.WORKER_NAME ?? "films_worker";
const WORKER_INSTANCE_ID = process.env.WORKER_INSTANCE_ID;
const HOSTNAME = os.hostname();

const workerId = WORKER_INSTANCE_ID
  ? `${WORKER_NAME}_${WORKER_INSTANCE_ID}`
  : `${WORKER_NAME}_${HOSTNAME}`;

export async function claimNextJob() {
  const { data, error } = await supabase.rpc("claim_next_job_v2", {
    worker_id: workerId,
  });

  if (error) throw error;

  return data?.[0] ?? null;
}

export async function fetchJobPayload(jobId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("payload")
    .eq("id", jobId)
    .single();

  if (error) throw error;
  return data.payload;
}
