import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import * as controller from "./view_profile.controller.js";

const router = Router();

router.get("/users/profile", controller.getUserProfile);

router.get("/latest-profile", controller.getLatestProfileFilms);

router.get("/myUploads", controller.getMyUploads);

export default router;
