import { Router } from "express";
import * as controller from "./recommendations.controller.js";

const router = Router();

router.get("/hotThisWeek", controller.hotThisWeek);
router.get("/personalized", controller.personalized);
router.get("/films-by-genre", controller.filmsByGenre);
router.get("/genres", controller.allGenres);
router.get("/home", controller.getHomeRecommendationsController);
router.get("/similar", controller.getSimilarFilmsController);
export default router;
