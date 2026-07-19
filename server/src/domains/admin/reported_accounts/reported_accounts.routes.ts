import express from "express";
import {
  getAllReportedAccountsController,
  dismissReportController,
  banUserController,
} from "./reported_accounts.controller.js";
import { requireAuth } from "../../../middlewares/requireAuth.js";
import { requireAdmin } from "../../../middlewares/requireAdmin.js";

const router = express.Router();


router.get("/",requireAuth,requireAdmin, getAllReportedAccountsController);

router.post("/dismiss/:id",requireAuth,requireAdmin, dismissReportController);


router.delete("/ban/:auth_id",requireAuth,requireAdmin, banUserController);

export default router;
