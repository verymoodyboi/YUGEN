// moderation.routes.ts
import express from "express";
import { moderationCallback } from "./moderation.controller.js";

const router = express.Router();
router.post("/callback", express.json({ limit: "10mb" }), moderationCallback);

export default router;
