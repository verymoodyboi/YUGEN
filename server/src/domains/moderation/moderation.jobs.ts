// src/domains/moderation/moderation.poller.ts
import cron from "node-cron";
import axios from "axios";
import supabase from "../../lib/supabase.js";

const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER!;
const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET!;

const minAgeMinutes = 2; // only poll films submitted more than 2 minutes ago
const cronSchedule = "*/5 * * * *"; // every 5 minutes

export async function checkPendingModerationsOnce() {
  // select films under_review older than minAgeMinutes
  const cutoff = new Date(Date.now() - minAgeMinutes * 60_000).toISOString();
  const { data: pending, error } = await supabase
    .from("films")
    .select("film_uuid, moderation_media_id, moderation_request_id, release_date")
    .eq("moderation_status", "under_review")
    .not("moderation_media_id", "is", null)
    .lt("release_date", cutoff);

  if (error) {
    console.error("❌ Error fetching pending films:", error);
    return;
  }
  if (!pending?.length) {
    // no pending to poll
    return;
  }

  for (const film of pending) {
    try {
      if (!film.moderation_media_id) {
        console.log("Skipping", film.film_uuid, "no media_id");
        continue;
      }

      const res = await axios.get("https://api.sightengine.com/1.0/video/check.json", {
        params: {
          media_id: film.moderation_media_id,
          api_user: SIGHTENGINE_USER,
          api_secret: SIGHTENGINE_SECRET,
          models: "nudity-2.1",
        },
        timeout: 30_000,
      });

      const data = res.data;
      if (data?.data?.status === "finished") {
        // reuse compute logic: max score across frames
        const frames = data?.data?.frames ?? [];
        let maxScore = 0;
        for (const f of frames) {
          const n = f.nudity || {};
          const score = (n.sexual_activity ?? 0) + (n.sexual_display ?? 0);
          if (score > maxScore) maxScore = score;
        }
        const newStatus = maxScore > 0.3 ? "rejected" : "approved";

        await supabase
          .from("films")
          .update({
            moderation_status: newStatus,
            moderation_result: data,
          })
          .eq("film_uuid", film.film_uuid);

        console.log(`✅ (poller) Updated ${film.film_uuid} → ${newStatus} (max=${maxScore})`);
      } else {
        console.log(`⏳ (poller) ${film.film_uuid} status: ${data?.data?.status}`);
      }
    } catch (err: any) {
      console.error(`⚠️ Poller error for ${film.film_uuid}:`, err.response?.data || err.message);
    }
  }
}

 

