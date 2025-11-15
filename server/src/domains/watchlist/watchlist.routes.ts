import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import * as controller from "./watchlist.controller.js";

const router = Router();

router.post("/toggle", requireAuth, controller.toggleWatchlist);
router.get("/check", requireAuth, controller.checkWatchlist);
router.get("/my", requireAuth, controller.getMyWatchlist);

export default router;
