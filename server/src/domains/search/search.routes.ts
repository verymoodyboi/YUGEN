import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import * as controller from "./search.controller.js";

const router = Router();

router.get("/advanced", controller.advancedSearch);

router.get("/films", controller.searchFilms);

router.get("/accounts", controller.searchAccounts);

router.get("/playlists", controller.searchPlaylists);

router.get("/", controller.combinedSearch);

router.get("/mentions", controller.searchMentions);

export default router;
