// src/domains/admin/flagged_films/flagged_films.router.ts
import express from "express";
import {
  getAllFlaggedFilmsController,
  recoverFilmController,
  deleteFilmController,
} from "./flagged_films.controller";

const router = express.Router();

/**
 * @route GET /api/admin/flagged_films
 * @desc Get all flagged films (ascending by date)
 */
router.get("/", getAllFlaggedFilmsController);

/**
 * @route POST /api/admin/flagged_films/recover/:film_uuid
 * @desc Recover a film (make visible again)
 */
router.post("/recover/:film_uuid", recoverFilmController);

/**
 * @route DELETE /api/admin/flagged_films/:film_uuid
 * @desc Permanently delete a flagged film
 */
router.delete("/:film_uuid", deleteFilmController);

export default router;
