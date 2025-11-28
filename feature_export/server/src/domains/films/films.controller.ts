import type { Request, Response } from 'express';
import * as filmService from './films.service.js';
import logger from '../../lib/logger.js';
import crypto from 'crypto';

export async function uploadFilmController(
  req: Request,
  res: Response,
  next: Function
): Promise<void> {
  try {
    // Generate film UUID here so we can respond immediately while processing continues
    const filmUuid = crypto.randomUUID();

    // Make filmId available for downstream middleware
    res.locals.filmId = filmUuid;

    // Respond immediately to the client (fire-and-forget processing)
    res.status(201).json({
      success: true,
      filmId: filmUuid,
      message: 'Film upload accepted; processing in background and pending moderation.',
    });

    // Start background processing without blocking the response
    void (async () => {
      try {
        await filmService.uploadFilm(req, filmUuid);
      } catch (err: any) {
        logger.error('Background film processing failed for %s: %o', filmUuid, err);
      }
    })();

    // Continue to next middleware (moderation hook) — it can use res.locals.filmId
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

// Status controller removed in revert
