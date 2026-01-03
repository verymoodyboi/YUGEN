// src/domains/jobs/claimJob.ts
import supabase from "../../lib/supabase.js";

/**
 * Atomically claim one queued job.
 * Uses UPDATE ... WHERE status='queued' ... RETURNING *
 */
export async function claimNextJob() {
  const { data, error } = await supabase
    .from("jobs")
    .update({
      status: "processing",
      run_at: new Date().toISOString(),
    })
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data; // null if no jobs
}
