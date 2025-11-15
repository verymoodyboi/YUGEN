import type { Request, Response } from 'express';
import * as filmService from './films.service.js';
import logger from '../../lib/logger.js';

export async function uploadFilmController(
  req: Request,
  res: Response,
  next: Function
): Promise<void> {
  try {
    // 1️⃣ Upload and insert film (is_approved = false)
    const result = await filmService.uploadFilm(req);

    // 2️⃣ Make filmId available for the moderation middleware
    res.locals.filmId = result.filmId;

    // 3️⃣ Respond immediately to the client
    res.status(201).json({
      success: true,
      filmId: result.filmId,
      message: "Film uploaded successfully and pending moderation.",
    });

    // 4️⃣ Continue to moderation middleware after sending response
    next();
  } catch (err) {
    logger.error("Upload film failed:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}
export async function editFilmController(req: Request, res: Response): Promise<void> {
  try {
    const result = await filmService.editFilm(req);
    res.json(result);
  } catch (err) {
    logger.error('Edit film failed:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
}

export async function deleteFilmController(req: Request, res: Response): Promise<void> {
  try {
    const result = await filmService.deleteFilm(req);
    res.json(result);
  } catch (err) {
    logger.error('Delete film failed:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
}
