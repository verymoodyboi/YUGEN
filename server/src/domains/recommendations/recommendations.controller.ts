import type { Request, Response } from "express";
import * as service from "./recommendations.services.js";
import { paginationSchema, personalizedSchema, genreSchema } from "./recommendations.validations.js";
import logger from "../../lib/logger.js";
export async function hotThisWeek(req: Request, res: Response) {
  try {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const results = await service.getHotThisWeek(value.offset, value.limit);
    res.json(results);
  } catch (err: any) {
    console.error("HotThisWeek error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}

export async function personalized(req: Request, res: Response) {
  try {
    const { error, value } = personalizedSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const results = await service.getPersonalized(value.user_id, value.offset, value.limit);
    res.json(results);
  } catch (err: any) {
    console.error("Personalized error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}

export async function filmsByGenre(req: Request, res: Response) {
  try {
    const { error, value } = genreSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const results = await service.getFilmsByGenre(value.genre, value.offset, value.limit);
    res.json(results);
  } catch (err: any) {
    console.error("FilmsByGenre error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}
export async function allGenres(req: Request, res: Response) {
  try {
    const results = await service.getAllGenres();
    res.json(results);
  } catch (err: any) {
    console.error("AllGenres error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}


export async function getHomeRecommendationsController(req:any, res:any) {
  try {
    const userId = req.user?.id || req.query.userId;
    const data = await service.fetchHomeRecommendations(userId);
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ error: "Failed to load recommendations" });
  }
}






export async function getSimilarFilmsController(req: Request, res: Response) {
  try {
    const filmId = String(req.query.filmId || req.params.filmId || "");
    const userId = req.user?.id ?? String(req.query.userId || "");

    if (!filmId) {
      return res.status(400).json({ error: "filmId is required" });
    }

    const films = await service.fetchSimilarFilms(filmId, userId || undefined);
    return res.status(200).json({ films });
  } catch (err) {
    logger.error("Failed to fetch similar films", { err });
    return res.status(500).json({ error: "Failed to load similar films" });
  }
}
