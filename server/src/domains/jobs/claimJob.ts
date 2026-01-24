import os from "os";
import supabase from "../../lib/supabase.js";

export async function claimNextJob() {
  const workerId = "films_worker_1"

  const { data, error } = await supabase.rpc("claim_next_job", {
    worker_id: workerId,
  });

  if (error) throw error;
  return data; 
}
