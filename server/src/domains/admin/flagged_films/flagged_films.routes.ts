import express from "express";
import {
  getAllFlaggedFilmsController,
  recoverFilmController,
  deleteFilmController,
} from "./flagged_films.controller.js";
import { requireAuth } from "../../../middlewares/requireAuth.js";
import { requireAdmin } from "../../../middlewares/requireAdmin.js";

const router = express.Router();


router.get("/",requireAuth,requireAdmin, getAllFlaggedFilmsController);

router.post("/recover/:film_uuid",requireAuth,requireAdmin, recoverFilmController);


router.delete("/:film_uuid",requireAuth,requireAdmin, deleteFilmController);

export default router;
