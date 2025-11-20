// src/domains/admin/flagged_films/flagged_films.controller.ts
import { Request, Response } from "express";
import {
  getFlaggedFilms,
  recoverFilm,
  deleteFilm,
} from "./flagged_films.services.js";

export async function getAllFlaggedFilmsController(req: Request, res: Response): Promise<void> {
  try {
    const films = await getFlaggedFilms();
    res.status(200).json(films);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function recoverFilmController(req: Request, res: Response): Promise<void> {
  try {
    const { film_uuid } = req.params;
    if (!film_uuid) {
      res.status(400).json({ error: "film_uuid parameter is required" });
      return;
    }

    const result = await recoverFilm(film_uuid);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteFilmController(req: Request, res: Response): Promise<void> {
  try {
    const { film_uuid } = req.params;
    if (!film_uuid) {
      res.status(400).json({ error: "film_uuid parameter is required" });
      return;
    }

    const result = await deleteFilm(film_uuid);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
