import axios from "axios";
import supabase from "../../lib/supabase.js";
import { AxiosResponse } from "axios";

const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER!;
const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET!;
const CALLBACK_URL = "https://try-yugen.com/api/moderation/callback";
const WEBHOOK_SECRET = process.env.SIGHTENGINE_WEBHOOK_SECRET!;

export async function submitVideoForModeration(
  filmUuid: string,
  publicUrl: string,
) {
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
      },
    );

    if (res.data?.status !== "success") {
      throw new Error(
        "Sightengine returned non-success: " + JSON.stringify(res.data),
      );
    }

    const requestId = res.data?.request?.id ?? null;
    const mediaId = res.data?.media?.id ?? null;
    const mediaUri = res.data?.media?.uri ?? null;
    console.log("Callback IDs:", { requestId, mediaId });

    if (!requestId)
      throw new Error("Missing request id from Sightengine response");

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

    console.log(
      ` Submitted ${filmUuid} for moderation → request=${requestId} media=${mediaId}`,
    );
    return { requestId, mediaId, mediaUri };
  } catch (err: any) {
    console.error(
      " Error submitting video for moderation:",
      err?.response?.data || err?.message || err,
    );

    // Mark film as flagged for manual review (submission failure)
    try {
      await supabase
        .from("films")
        .update({
          moderation_status: "failed",
          is_flagged: true,
          flag_reason:
            "Automated scan failed, film is currently under manual review by our team",
        })
        .eq("film_uuid", filmUuid);

      await supabase.from("flagged_films").insert([
        {
          film_uuid: filmUuid,
          reason:
            "Automated scan failed, film is currently under manual review by our team",
          status: "waiting for review",
        },
      ]);

      console.log(
        ` Film ${filmUuid} marked for manual review (submission failure)`,
      );
    } catch (subErr) {
      console.error(
        " Failed to insert flagged film on submission error:",
        subErr,
      );
    }

    throw err;
  }
}

function computeMaxSexualScoreFromFrames(frames: any[] = []) {
  let maxScore = 0;
  for (const f of frames) {
    const n = f?.nudity ?? {};
    const score = (n.sexual_activity ?? 0) + (n.sexual_display ?? 0);
    if (score > maxScore) maxScore = score;
  }
  return { maxScore, framesEvaluated: frames.length };
}

export async function checkPosterForModeration(
  filmUuid: string,
  posterUrl: string,
) {
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
      throw new Error(
        `Sightengine poster moderation failed: ${JSON.stringify(res.data)}`,
      );
    }

    const nudity = res.data?.nudity ?? {};
    const sexualScore =
      (nudity.sexual_activity ?? 0) + (nudity.sexual_display ?? 0);
    const threshold = 0.3;
    const posterStatus = sexualScore > threshold ? "rejected" : "approved";

    await supabase
      .from("films")
      .update({
        poster_moderation_result: res.data,
        poster_moderation_status: posterStatus,
      })
      .eq("film_uuid", filmUuid);

    console.log(
      `Poster moderation for ${filmUuid}: ${posterStatus} (score=${sexualScore})`,
    );

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

      console.log(`Poster for ${filmUuid} flagged for review`);
    }

    return { posterStatus, sexualScore, raw: res.data };
  } catch (err: any) {
    console.error(
      "Poster moderation check failed:",
      err?.response?.data || err?.message || err,
    );

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

      console.log(
        `Film ${filmUuid} flagged for manual review (poster scan failed)`,
      );
    } catch (fallbackErr) {
      console.error(
        "Failed to flag film after poster scan failure:",
        fallbackErr,
      );
    }

    throw err;
  }
}

async function resolveFinalApprovalStatus(uploader_id: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("user_type")
    .eq("auth_id", uploader_id)
    .single();

  if (error) {
    console.error("Failed to fetch uploader user_type:", error);
    return "quality_control";
  }

  return user?.user_type === "verified" ? "approved" : "quality_control";
}

export async function handleModerationCallback(payload: any) {
  try {
    const requestId =
      payload?.request?.id ?? payload?.request_id ?? payload?.requestId ?? null;
    const media = payload?.media ?? null;
    const data = payload?.data ?? payload?.summary ?? payload ?? null;

    if (!requestId || !data) {
      throw new Error("Invalid callback payload: missing request or data");
    }

    const { data: filmRows, error: selectErr } = await supabase
      .from("films")
      .select(
        "film_uuid, moderation_status, poster_moderation_status, uploader_id",
      )
      .or(
        `moderation_request_id.eq.${requestId},moderation_media_id.eq.${media?.id ?? ""}`,
      )
      .limit(1);

    if (selectErr) {
      console.error("Supabase lookup error:", selectErr);
      throw selectErr;
    }

    const film = filmRows?.[0];
    if (!film) {
      console.warn(
        `No film row found for request=${requestId} media=${media?.id}`,
      );
      return;
    }

    const finalized = ["approved", "rejected"].includes(film.moderation_status);
    if (finalized) {
      console.log(
        `Film ${film.film_uuid} already finalized (${film.moderation_status}) — skipping update.`,
      );
      return;
    }

    if (payload?.error) {
      await supabase
        .from("films")
        .update({
          moderation_status: "failed",
          moderation_result: payload.error,
          is_flagged: true,
          flag_reason:
            "Automated scan failed, film is currently under manual review by our team",
          moderation_checked_at: new Date().toISOString(),
        })
        .eq("film_uuid", film.film_uuid);

      await supabase.from("flagged_films").insert([
        {
          film_uuid: film.film_uuid,
          reason:
            "Automated scan failed, film is currently under manual review by our team",
          status: "waiting for review",
        },
      ]);

      console.log(
        `Film ${film.film_uuid} marked for manual review (callback error)`,
      );
      return;
    }

    const statusFlag = data?.status ?? data?.summary?.status ?? null;
    if (statusFlag && statusFlag !== "finished" && statusFlag !== "done") {
      console.log(
        ` Moderation for ${film.film_uuid} (request=${requestId}) not finished yet: ${statusFlag}`,
      );
      return;
    }

    const frames = data?.frames ?? [];
    const { maxScore, framesEvaluated } =
      computeMaxSexualScoreFromFrames(frames);
    const threshold = 0.3;
    const videoStatus = maxScore > threshold ? "rejected" : "approved";

    await supabase
      .from("films")
      .update({
        moderation_status: videoStatus,
        moderation_result: data,
        moderation_checked_at: new Date().toISOString(),
      })
      .eq("film_uuid", film.film_uuid);

    console.log(
      `Video moderation for ${film.film_uuid} → ${videoStatus} (maxScore=${maxScore} frames=${framesEvaluated})`,
    );

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

      if (flagError)
        console.error(" Failed to insert flagged film:", flagError);
      else
        console.log(
          `Film ${film.film_uuid} flagged for sexual content (video)`,
        );

      return;
    }

    const { data: posterRow, error: posterErr } = await supabase
      .from("films")
      .select("poster_moderation_status")
      .eq("film_uuid", film.film_uuid)
      .single();

    if (posterErr) {
      console.error("Failed to fetch poster moderation status:", posterErr);
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

      console.log(
        `Film ${film.film_uuid} flagged because poster moderation missing`,
      );
      return;
    }

    const posterStatus = posterRow?.poster_moderation_status ?? null;

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

      console.log(`Film ${film.film_uuid} rejected due to poster moderation`);
      return;
    }

    if (posterStatus === "approved") {
      const finalStatus = await resolveFinalApprovalStatus(film.uploader_id);

      await supabase
        .from("films")
        .update({
          moderation_status: finalStatus,
        })
        .eq("film_uuid", film.film_uuid);

      console.log(`Film ${film.film_uuid} fully approved (video + poster)`);
      return;
    }

    // posterStatus is null or not finished/unknown => mark film under_review (leave for manual/poller)
    console.log(
      `Film ${film.film_uuid} video OK but poster status=${posterStatus} — leaving under_review for now`,
    );
    await supabase
      .from("films")
      .update({
        moderation_status: "under_review",
      })
      .eq("film_uuid", film.film_uuid);
  } catch (err: any) {
    console.error(
      "handleModerationCallback error:",
      err?.response?.data || err?.message || err,
    );

    // Fallback: try to flag by film_uuid in payload if present
    try {
      const fallbackUuid =
        payload?.film_uuid ?? payload?.request?.film_uuid ?? null;
      if (fallbackUuid) {
        await supabase
          .from("films")
          .update({
            moderation_status: "failed",
            is_flagged: true,
            flag_reason:
              "Automated scan failed, film is currently under manual review by our team",
          })
          .eq("film_uuid", fallbackUuid);

        await supabase.from("flagged_films").insert([
          {
            film_uuid: fallbackUuid,
            reason:
              "Automated scan failed, film is currently under manual review by our team",
            status: "waiting for review",
          },
        ]);

        console.log(
          `Film ${fallbackUuid} flagged for manual review (callback error fallback)`,
        );
      }
    } catch (fallbackErr) {
      console.error("Failed to flag fallback film:", fallbackErr);
    }

    // rethrow so caller knows (controller may return 500)
    throw err;
  }
}

// --- Types ---
interface FrameResult {
  url: string;
  score: number;
  rawResponse: any;
  ok: boolean;
}

interface FrameModerationResponse {
  passed: boolean;
  maxScore: number;
  results: FrameResult[];
}

/**
 * Extract a sexual content score from Sightengine image API response
 */
function extractSexualScoreFromImageResponse(data: any): number {
  try {
    if (!data) return 0;

    const nudity = data.nudity ?? data?.attributes?.nudity ?? null;
    const candidates: number[] = [];

    if (nudity) {
      if (typeof nudity === "number") candidates.push(nudity);
      if (typeof nudity.sexual === "number") candidates.push(nudity.sexual);
      if (nudity.raw && typeof nudity.raw.sexual === "number")
        candidates.push(nudity.raw.sexual);
      if (typeof nudity.partial === "number") candidates.push(nudity.partial);
    }

    if (data?.nudity?.sexuality && typeof data.nudity.sexuality === "number") {
      candidates.push(data.nudity.sexuality);
    }

    if (data?.pornography && typeof data.pornography === "number") {
      candidates.push(data.pornography);
    }

    if (typeof data.prob === "number") candidates.push(data.prob);
    if (typeof data.score === "number") candidates.push(data.score);

    const max = candidates.length ? Math.max(...candidates) : 0;
    return Math.max(0, Math.min(1, Number(max) || 0));
  } catch (e) {
    console.warn("extractSexualScoreFromImageResponse error:", e);
    return 0;
  }
}

/**
 * Submit multiple frames for moderation using Sightengine image API.
 * Marks film as approved/passed or rejected/flagged depending on scores.
 */

type ModerationResult =
  | {
      url: string;
      ok: true;
      res: AxiosResponse<any>;
    }
  | {
      url: string;
      ok: false;
      err: unknown;
    };

export async function submitFramesForModeration(
  filmUuid: string,
  frameUrls: string[] = [],
): Promise<FrameModerationResponse> {
  if (!Array.isArray(frameUrls) || frameUrls.length === 0) {
    throw new Error("No frame URLs provided for moderation");
  }

  const results: FrameResult[] = [];

  // Send requests in parallel
  const requests = frameUrls.map((url) =>
    axios
      .get("https://api.sightengine.com/1.0/check.json", {
        params: {
          url,
          models: "nudity-2.1",
          api_user: SIGHTENGINE_USER,
          api_secret: SIGHTENGINE_SECRET,
        },
        timeout: 15_000,
      })
      .then((res: AxiosResponse) => ({ url, res }))
      .catch((err: any) => ({ url, err })),
  );

  const settled = await Promise.all(requests);

  for (const item of settled) {
    // Type guard to check if item has err
    if ("err" in item || !("res" in item)) {
      console.warn(
        "Frame moderation request failed for",
        item.url,
        "error:",
        "err" in item ? (item.err?.message ?? item.err) : "unknown",
      );
      results.push({
        url: item.url,
        score: 1,
        rawResponse: "err" in item ? { error: item.err?.message } : undefined,
        ok: false,
      });
      continue;
    }

    // At this point, TypeScript knows item has res
    const data = item.res.data;
    if (data?.status !== "success" && data?.status !== "ok") {
      console.warn("Sightengine returned non-success for:", item.url, data);
      results.push({
        url: item.url,
        score: 1,
        rawResponse: data,
        ok: false,
      });
      continue;
    }

    const score = extractSexualScoreFromImageResponse(data);
    results.push({ url: item.url, score, rawResponse: data, ok: true });
  }

  const maxScore = results.reduce((acc, r) => Math.max(acc, r.score ?? 0), 0);

  try {
    if (maxScore > 0.3) {
      await supabase.from("flagged_films").insert([
        {
          film_uuid: filmUuid,
          reason: "Sexual content detected in moderation snapshots",
          status: "waiting for review",
        },
      ]);

      await supabase
        .from("films")
        .update({
          moderation_status: "rejected",
          is_flagged: true,
          flag_reason: "Sexual content detected in moderation snapshots",
          moderation_result: results.map((r) => ({
            url: r.url,
            score: r.score,
          })),
          moderation_checked_at: new Date().toISOString(),
        })
        .eq("film_uuid", filmUuid);

      console.info(
        `Frames moderation for ${filmUuid} -> rejected (maxScore=${maxScore})`,
      );
      return { passed: false, maxScore, results };
    } else {
      await supabase
        .from("films")
        .update({
          moderation_status: "quality_control",
          moderation_result: results.map((r) => ({
            url: r.url,
            score: r.score,
          })),
          moderation_checked_at: new Date().toISOString(),
        })
        .eq("film_uuid", filmUuid);

      console.info(
        `Frames moderation for ${filmUuid} -> passed (maxScore=${maxScore})`,
      );
      return { passed: true, maxScore, results };
    }
  } catch (dbErr: any) {
    console.error("Error updating DB after frame moderation:", dbErr);

    // Defensive: mark for manual review
    try {
      await supabase.from("flagged_films").insert([
        {
          film_uuid: filmUuid,
          reason: "Moderation DB update failed — requires manual review",
          status: "waiting for review",
        },
      ]);

      await supabase
        .from("films")
        .update({
          moderation_status: "failed",
          is_flagged: true,
          flag_reason: "Moderation DB update failed",
        })
        .eq("film_uuid", filmUuid);
    } catch (innerErr) {
      console.error("Failed to insert fallback flagged film:", innerErr);
    }

    throw dbErr;
  }
}
