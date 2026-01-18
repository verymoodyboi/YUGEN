// src/domains/moderation/moderation.controller.ts
import { Request, Response } from "express";
import { handleModerationCallback } from "./moderation.services.js";

const WEBHOOK_SECRET = process.env.SIGHTENGINE_WEBHOOK_SECRET;
export async function moderationCallback(req: Request, res: Response) {
  console.log("🚀 [CALLBACK RECEIVED]");
  console.log("Headers:", req.headers);

  // 1️⃣ Verify webhook secret FIRST
  const querySecret = (req.query?.secret as string) || null;
  const headerSecret = (req.headers["x-webhook-secret"] as string) || null;

  if (WEBHOOK_SECRET) {
    if (querySecret !== WEBHOOK_SECRET && headerSecret !== WEBHOOK_SECRET) {
      console.warn("⚠️ Webhook secret mismatch — rejecting callback");
      return res.status(403).json({ error: "Forbidden" });
    }
  } else {
    console.warn("⚠️ No WEBHOOK_SECRET configured — endpoint is unprotected");
  }

  // 2️⃣ Respond immediately (Sightengine is happy)
  res.status(200).json({ ok: true });

  // 3️⃣ Process asynchronously AFTER response
  console.log("Body:", JSON.stringify(req.body, null, 2));

  try {
    await handleModerationCallback(req.body);
  } catch (err: any) {
    console.error("❌ Error handling moderation callback:", err?.message || err);
  }
}

