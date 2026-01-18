import express from "express";
import {
  getAllFlaggedFilmsController,
  recoverFilmController,
  deleteFilmController,
} from "./flagged_films.controller.js";

const router = express.Router();


router.get("/", getAllFlaggedFilmsController);

router.post("/recover/:film_uuid", recoverFilmController);


router.delete("/:film_uuid", deleteFilmController);

export default router;
