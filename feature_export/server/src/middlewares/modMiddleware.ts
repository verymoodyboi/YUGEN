import { Request, Response, NextFunction } from "express";
import { moderateVideoFile, moderateImageFile, isContentDisallowed } from "../lib/mod.js";

export async function moderationBeforeUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const filmFile = (req.files as any)?.Film?.[0];
    const posterFile = (req.files as any)?.Poster?.[0];

    if (!filmFile || !posterFile) {
      console.warn("⚠️ Moderation skipped — missing film or poster file.");
      return next();
    }

    console.log("🔍 Running content moderation before upload...");

    // Run both checks in parallel for speed
    const [videoResult, posterResult] = await Promise.all([
      moderateVideoFile(filmFile.path),
      moderateImageFile(posterFile.path),
    ]);

    const videoFlagged = isContentDisallowed(videoResult);
    const posterFlagged = isContentDisallowed(posterResult);

    if (videoFlagged || posterFlagged) {
      console.warn("🚫 Upload blocked: inappropriate or AI-generated content detected");
      return res.status(400).json({
        error: "Upload blocked: inappropriate or AI-generated content detected",
      });
    }

    console.log("✅ Content approved, continuing upload...");
    next();
  } catch (err: any) {
    console.error("❌ Moderation error:", err.message || err);
    res.status(500).json({ error: "Content moderation failed" });
  }
}
