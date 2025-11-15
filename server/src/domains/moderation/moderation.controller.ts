// src/domains/moderation/moderation.controller.ts
import { Request, Response } from "express";
import { handleModerationCallback } from "./moderation.services.js";

const WEBHOOK_SECRET = process.env.SIGHTENGINE_WEBHOOK_SECRET;

/**
 * This controller logs the incoming payload and verifies a shared secret.
 * Sightengine will POST here. We verify secret (query param `secret` or header `x-webhook-secret`)
 * to avoid unauthorized updates.
 */
export async function moderationCallback(req: Request, res: Response) {
  console.log("🚀 [CALLBACK RECEIVED]");
  console.log("Headers:", req.headers);

  // Basic webhook secret verification
  const querySecret = (req.query?.secret as string) || null;
  const headerSecret = (req.headers["x-webhook-secret"] as string) || null;
  if (WEBHOOK_SECRET) {
    if (querySecret !== WEBHOOK_SECRET && headerSecret !== WEBHOOK_SECRET) {
      console.warn("⚠️ Webhook secret mismatch - rejecting callback");
      return res.status(403).json({ error: "Forbidden" });
    }
  } else {
    console.warn("⚠️ No WEBHOOK_SECRET configured — callback endpoint not protected (recommended to set one).");
  }

  console.log("Body:", JSON.stringify(req.body, null, 2));

  try {
    await handleModerationCallback(req.body);
    res.status(200).json({ message: "Moderation result received" });
  } catch (err: any) {
    console.error("❌ Error handling moderation callback:", err?.message || err);
    res.status(500).json({ error: "Failed to handle callback" });
  }
}
