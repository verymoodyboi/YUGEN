// src/domains/moderation/moderation.services.ts
import axios from "axios";
import supabase from "../../lib/supabase.js";

const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER!;
const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET!;
const CALLBACK_URL = 'http://46.101.247.144/api/moderation/callback'; // e.g. https://your-tunnel/.../api/moderation/callback?secret=...
const WEBHOOK_SECRET = process.env.SIGHTENGINE_WEBHOOK_SECRET!;

/**
 * Submit a public video URL to Sightengine as an async job.
 * If submission fails, mark film for manual review in flagged_films.
 */
export async function submitVideoForModeration(filmUuid: string, publicUrl: string) {
  try {
    const res = await axios.post(
      "https://api.sightengine.com/1.0/video/check.json",
      null,
      {
        params: {
          stream_url: publicUrl,
          api_user: SIGHTENGINE_USER,
          api_secret: SIGHTENGINE_SECRET,
          models: "nudity-2.1",
          callback_url: CALLBACK_URL,
        },
        timeout: 30_000,
      }
    );

    if (res.data?.status !== "success") {
      throw new Error("Sightengine returned non-success: " + JSON.stringify(res.data));
    }

    const requestId = res.data?.request?.id ?? null;
    const mediaId = res.data?.media?.id ?? null;
    const mediaUri = res.data?.media?.uri ?? null;
console.log("Callback IDs:", { requestId, mediaId });

    if (!requestId) throw new Error("Missing request id from Sightengine response");

    await supabase
      .from("films")
      .update({
        moderation_request_id: requestId,
        moderation_media_id: mediaId,
        moderation_media_uri: mediaUri,
        moderation_status: "under_review",
        moderation_submitted_at: new Date().toISOString(),
      })
      .eq("film_uuid", filmUuid);

    console.log(`✅ Submitted ${filmUuid} for moderation → request=${requestId} media=${mediaId}`);
    return { requestId, mediaId, mediaUri };
  } catch (err: any) {
    console.error("❌ Error submitting video for moderation:", err?.response?.data || err?.message || err);

    // Mark film as flagged for manual review (submission failure)
    try {
      await supabase
        .from("films")
        .update({
          moderation_status: "failed",
          is_flagged: true,
          flag_reason: "Automated scan failed, film is currently under manual review by our team",
        })
        .eq("film_uuid", filmUuid);

      await supabase.from("flagged_films").insert([
        {
          film_uuid: filmUuid,
          reason: "Automated scan failed, film is currently under manual review by our team",
          status: "waiting for review",
        },
      ]);

      console.log(`🚩 Film ${filmUuid} marked for manual review (submission failure)`);
    } catch (subErr) {
      console.error("⚠️ Failed to insert flagged film on submission error:", subErr);
    }

    throw err;
  }
}

/**
 * Compute the maximum sexual score across frames (sexual_activity + sexual_display).
 */
function computeMaxSexualScoreFromFrames(frames: any[] = []) {
  let maxScore = 0;
  for (const f of frames) {
    const n = f?.nudity ?? {};
    const score = (n.sexual_activity ?? 0) + (n.sexual_display ?? 0);
    if (score > maxScore) maxScore = score;
  }
  return { maxScore, framesEvaluated: frames.length };
}

/**
 * Check poster synchronously using Sightengine image API (no callback).
 * If poster check fails or exceeds threshold → flag film.
 */
export async function checkPosterForModeration(filmUuid: string, posterUrl: string) {
  try {
    const res = await axios.get("https://api.sightengine.com/1.0/check.json", {
      params: {
        url: posterUrl,
        models: "nudity-2.1",
        api_user: SIGHTENGINE_USER,
        api_secret: SIGHTENGINE_SECRET,
      },
      timeout: 15_000,
    });

    if (res.data?.status !== "success") {
      throw new Error(`Sightengine poster moderation failed: ${JSON.stringify(res.data)}`);
    }

    // Sightengine image response typically contains `nudity` top-level
    const nudity = res.data?.nudity ?? {};
    const sexualScore = (nudity.sexual_activity ?? 0) + (nudity.sexual_display ?? 0);
    const threshold = 0.3;
    const posterStatus = sexualScore > threshold ? "rejected" : "approved";

    // Save poster moderation result/status
    await supabase
      .from("films")
      .update({
        poster_moderation_result: res.data,
        poster_moderation_status: posterStatus,
      })
      .eq("film_uuid", filmUuid);

    console.log(`🖼️ Poster moderation for ${filmUuid}: ${posterStatus} (score=${sexualScore})`);

    if (posterStatus === "rejected") {
      await supabase
        .from("films")
        .update({
          moderation_status: "rejected",
          is_flagged: true,
          flag_reason: "Sexual content detected in poster by Sightengine",
        })
        .eq("film_uuid", filmUuid);

      await supabase.from("flagged_films").insert([
        {
          film_uuid: filmUuid,
          reason: "Sexual content detected in poster by Sightengine",
          status: "waiting for review",
        },
      ]);

      console.log(`🚩 Poster for ${filmUuid} flagged for review`);
    }

    return { posterStatus, sexualScore, raw: res.data };
  } catch (err: any) {
    console.error("❌ Poster moderation check failed:", err?.response?.data || err?.message || err);

    // Fallback: mark film for manual review
    try {
      await supabase
        .from("films")
        .update({
          is_flagged: true,
          flag_reason: "Poster scan failed, film is under manual review",
          moderation_status: "failed",
        })
        .eq("film_uuid", filmUuid);

      await supabase.from("flagged_films").insert([
        {
          film_uuid: filmUuid,
          reason: "Poster scan failed, film is under manual review",
          status: "waiting for review",
        },
      ]);

      console.log(`🚩 Film ${filmUuid} flagged for manual review (poster scan failed)`);
    } catch (fallbackErr) {
      console.error("⚠️ Failed to flag film after poster scan failure:", fallbackErr);
    }

    // Re-throw so caller can act if needed
    throw err;
  }
}

/**
 * Process Sightengine callback payload and update Supabase.
 * Idempotent: if film already 'approved' or 'rejected', skip.
 * Only mark film 'approved' when BOTH video and poster are approved.
 */
export async function handleModerationCallback(payload: any) {
  try {
    // payload can be { request: { id }, media: { id, uri }, data: { status, frames } } or older shapes
const requestId =
  payload?.request?.id ??
  payload?.request_id ??
  payload?.requestId ??
  null;
    const media = payload?.media ?? null;
    // `data` or `summary` may contain the frames and status
    const data = payload?.data ?? payload?.summary ?? payload ?? null;

    if (!requestId || !data) {
      throw new Error("Invalid callback payload: missing request or data");
    }

    // Find the film by moderation_request_id (preferred) or moderation_media_id fallback
    const { data: filmRows, error: selectErr } = await supabase
      .from("films")
      .select("film_uuid, moderation_status, poster_moderation_status")
      .or(`moderation_request_id.eq.${requestId},moderation_media_id.eq.${media?.id ?? ""}`)
      .limit(1);

    if (selectErr) {
      console.error("❌ Supabase lookup error:", selectErr);
      throw selectErr;
    }

    const film = filmRows?.[0];
    if (!film) {
      console.warn(`⚠️ No film row found for request=${requestId} media=${media?.id}`);
      return;
    }

    // If already finalized, don't overwrite
    const finalized = ["approved", "rejected"].includes(film.moderation_status);
    if (finalized) {
      console.log(`ℹ️ Film ${film.film_uuid} already finalized (${film.moderation_status}) — skipping update.`);
      return;
    }

    // If sightengine returned job-level error
    if (payload?.error) {
      await supabase
        .from("films")
        .update({
          moderation_status: "failed",
          moderation_result: payload.error,
          is_flagged: true,
          flag_reason: "Automated scan failed, film is currently under manual review by our team",
          moderation_checked_at: new Date().toISOString(),
        })
        .eq("film_uuid", film.film_uuid);

      await supabase.from("flagged_films").insert([
        {
          film_uuid: film.film_uuid,
          reason: "Automated scan failed, film is currently under manual review by our team",
          status: "waiting for review",
        },
      ]);

      console.log(`🚩 Film ${film.film_uuid} marked for manual review (callback error)`);
      return;
    }

    // Only handle finished/done states
    const statusFlag = data?.status ?? data?.summary?.status ?? null;
    if (statusFlag && statusFlag !== "finished" && statusFlag !== "done") {
      console.log(`⏳ Moderation for ${film.film_uuid} (request=${requestId}) not finished yet: ${statusFlag}`);
      return;
    }

    // Compute score across frames
    const frames = data?.frames ?? [];
    const { maxScore, framesEvaluated } = computeMaxSexualScoreFromFrames(frames);
    const threshold = 0.3;
    const videoStatus = maxScore > threshold ? "rejected" : "approved";

    // Save video moderation result
    await supabase
      .from("films")
      .update({
        moderation_status: videoStatus, // interim; may be overridden if poster fails
        moderation_result: data,
        moderation_checked_at: new Date().toISOString(),
      })
      .eq("film_uuid", film.film_uuid);

    console.log(
      `✅ Video moderation for ${film.film_uuid} → ${videoStatus} (maxScore=${maxScore} frames=${framesEvaluated})`
    );

    // If video rejected -> flag and return
    if (videoStatus === "rejected") {
      const { error: flagError } = await supabase.from("flagged_films").insert([
        {
          film_uuid: film.film_uuid,
          reason: "Sexual content detected by Sightengine",
          status: "waiting for review",
        },
      ]);
      await supabase
        .from("films")
        .update({
          is_flagged: true,
          flag_reason: "Sexual content detected by Sightengine",
          moderation_status: "rejected",
        })
        .eq("film_uuid", film.film_uuid);

      if (flagError) console.error("⚠️ Failed to insert flagged film:", flagError);
      else console.log(`🚩 Film ${film.film_uuid} flagged for sexual content (video)`);

      return;
    }

    // video approved — ensure poster also passed
    // fetch the poster_moderation_status (could be `approved`, `rejected`, or null/failed)
    const { data: posterRow, error: posterErr } = await supabase
      .from("films")
      .select("poster_moderation_status")
      .eq("film_uuid", film.film_uuid)
      .single();

    if (posterErr) {
      console.error("⚠️ Failed to fetch poster moderation status:", posterErr);
      // fallback: mark for manual review
      await supabase
        .from("films")
        .update({
          moderation_status: "failed",
          is_flagged: true,
          flag_reason: "Poster moderation missing — requires manual review",
        })
        .eq("film_uuid", film.film_uuid);

      await supabase.from("flagged_films").insert([
        {
          film_uuid: film.film_uuid,
          reason: "Poster moderation missing — requires manual review",
          status: "waiting for review",
        },
      ]);

      console.log(`🚩 Film ${film.film_uuid} flagged because poster moderation missing`);
      return;
    }

    const posterStatus = posterRow?.poster_moderation_status ?? null;

    // If poster explicitly rejected -> final rejected
    if (posterStatus === "rejected") {
      await supabase
        .from("films")
        .update({
          moderation_status: "rejected",
          is_flagged: true,
          flag_reason: "Sexual content detected in poster by Sightengine",
        })
        .eq("film_uuid", film.film_uuid);

      await supabase.from("flagged_films").insert([
        {
          film_uuid: film.film_uuid,
          reason: "Sexual content detected in poster by Sightengine",
          status: "waiting for review",
        },
      ]);

      console.log(`🚩 Film ${film.film_uuid} rejected due to poster moderation`);
      return;
    }

    // If poster status is 'approved' -> final approved
    if (posterStatus === "approved") {
      await supabase
        .from("films")
        .update({
          moderation_status: "approved",
        })
        .eq("film_uuid", film.film_uuid);

      console.log(`✅ Film ${film.film_uuid} fully approved (video + poster)`);
      return;
    }

    // posterStatus is null or not finished/unknown => mark film under_review (leave for manual/poller)
    console.log(`ℹ️ Film ${film.film_uuid} video OK but poster status=${posterStatus} — leaving under_review for now`);
    await supabase
      .from("films")
      .update({
        moderation_status: "under_review",
      })
      .eq("film_uuid", film.film_uuid);

  } catch (err: any) {
    console.error("❌ handleModerationCallback error:", err?.response?.data || err?.message || err);

    // Fallback: try to flag by film_uuid in payload if present
    try {
      const fallbackUuid = payload?.film_uuid ?? payload?.request?.film_uuid ?? null;
      if (fallbackUuid) {
        await supabase
          .from("films")
          .update({
            moderation_status: "failed",
            is_flagged: true,
            flag_reason: "Automated scan failed, film is currently under manual review by our team",
          })
          .eq("film_uuid", fallbackUuid);

        await supabase.from("flagged_films").insert([
          {
            film_uuid: fallbackUuid,
            reason: "Automated scan failed, film is currently under manual review by our team",
            status: "waiting for review",
          },
        ]);

        console.log(`🚩 Film ${fallbackUuid} flagged for manual review (callback error fallback)`);
      }
    } catch (fallbackErr) {
      console.error("⚠️ Failed to flag fallback film:", fallbackErr);
    }

    // rethrow so caller knows (controller may return 500)
    throw err;
  }
}
