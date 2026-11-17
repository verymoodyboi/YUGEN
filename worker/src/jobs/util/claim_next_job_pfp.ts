// workers/pfp/util/claim_next_pfp_compression_job.ts
import * as os from "os";
import supabase from "../../lib/supabase.js";

const WORKER_NAME =
  process.env.PFP_WORKER_NAME ?? "pfp_compression_worker";
const WORKER_INSTANCE_ID = process.env.WORKER_INSTANCE_ID;
const HOSTNAME = os.hostname();

const workerId = WORKER_INSTANCE_ID
  ? `${WORKER_NAME}_${WORKER_INSTANCE_ID}`
  : `${WORKER_NAME}_${HOSTNAME}`;

export async function claimNextPfpCompressionJob() {
  const { data, error } = await supabase.rpc(
    "claim_next_pfp_compression_job",
    { worker_id: workerId },
  );
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function fetchPfpCompressionJobPayload(jobId: string) {
  const { data, error } = await supabase
    .from("jobs_pfp_compression")
    .select("payload")
    .eq("id", jobId)
    .single();
  if (error) throw error;
  return data.payload;
}