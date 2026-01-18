import supabase from "../../lib/supabase.js";

export async function claimNextJob() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("jobs")
    .update({
      status: "processing",
      locked_at: now,
    })
    .eq("status", "queued")
    .lte("run_at", now) 
    .order("created_at", { ascending: true })
    .limit(1)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}
