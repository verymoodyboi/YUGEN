import express from "express";
import {
  getPendingUploadsController,
  acceptUploadController,
  rejectUploadController,
} from "./QA.controller.js";
import { requireAuth } from "../../../middlewares/requireAuth.js";
import { requireAdmin } from "../../../middlewares/requireAdmin.js";

const router = express.Router();

router.get("/pending",requireAuth,requireAdmin, getPendingUploadsController);

router.post("/accept/:film_uuid",requireAuth,requireAdmin, acceptUploadController);

router.post("/reject/:film_uuid",requireAuth,requireAdmin, rejectUploadController);

export default router;
