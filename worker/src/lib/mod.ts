import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";

const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER!;
const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET!;

/* -------------------------------------------------------------------------- */
/*                              Type Definitions                              */
/* -------------------------------------------------------------------------- */
export interface ModerationResult {
  nudity?: {
    sexual_activity?: number;
    sexual_display?: number;
    suggestive?: number;
  };
}

/* -------------------------------------------------------------------------- */
/*                         🎥 Direct Video Moderation                          */
/* -------------------------------------------------------------------------- */
export async function moderateVideoFile(filePath: string): Promise<ModerationResult> {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) throw new Error(`Video not found: ${resolvedPath}`);

  const size = fs.statSync(resolvedPath).size;
  if (size > 50 * 1024 * 1024)
    throw new Error("Video too large (>50MB) for direct moderation");

  console.log("🔍 Starting video moderation:", resolvedPath);

  const form = new FormData();
  form.append("media", fs.createReadStream(resolvedPath), {
    filename: path.basename(resolvedPath),
    contentType: "video/mp4",
  });
  form.append("models", "nudity-2.0");
  form.append("api_user", SIGHTENGINE_USER);
  form.append("api_secret", SIGHTENGINE_SECRET);

  try {
    // ✅ Use the synchronous VIDEO endpoint, not /check.json
    const { data } = await axios.post(
      "https://api.sightengine.com/1.0/video/check-sync.json",
      form,
      { headers: form.getHeaders() }
    );

    console.log(`✅ Video moderation completed for ${resolvedPath}`);
    return data;
  } catch (err: any) {
    console.error("❌ Moderation error:", err.response?.data || err.message);
    throw new Error(
      `Sightengine video check failed: ${
        err.response?.data?.error?.message || err.message
      }`
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                           🖼️ Image Moderation                              */
/* -------------------------------------------------------------------------- */
export async function moderateImageFile(filePath: string): Promise<ModerationResult> {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) throw new Error(`Image not found: ${resolvedPath}`);

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType =
    ext === ".png"
      ? "image/png"
      : ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : "application/octet-stream";

  console.log("🖼️ Starting image moderation:", resolvedPath);

  const form = new FormData();
  form.append("media", fs.createReadStream(resolvedPath), {
    filename: path.basename(resolvedPath),
    contentType,
  });
  form.append("models", "nudity-2.0");
  form.append("api_user", SIGHTENGINE_USER);
  form.append("api_secret", SIGHTENGINE_SECRET);

  try {
    const { data } = await axios.post(
      "https://api.sightengine.com/1.0/check.json",
      form,
      { headers: form.getHeaders() }
    );

    console.log(`✅ Image moderation completed for ${resolvedPath}`);
    return data;
  } catch (err: any) {
    console.error("❌ Image moderation failed:", err.response?.data || err.message);
    throw new Error(
      `Sightengine image check failed: ${
        err.response?.data?.error?.message || err.message
      }`
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                     🚫 Determine If Content Is Unsafe                      */
/* -------------------------------------------------------------------------- */
export function isContentDisallowed(result: any): boolean {
  try {
    const nudity = result?.nudity;
    if (!nudity) return false;

    const sa = nudity.sexual_activity ?? 0;
    const sd = nudity.sexual_display ?? 0;
    const sg = nudity.suggestive ?? 0;

    return sa > 0.2 || sd > 0.2 || sg > 0.5;
  } catch (err) {
    console.error("Moderation parse error:", err);
    return false;
  }
}
