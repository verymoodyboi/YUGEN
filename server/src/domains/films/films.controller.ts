import type { Request, Response } from 'express';
import * as filmService from './films.service.js';
import logger from '../../lib/logger.js';




export async function retryUploadController(req: Request, res: Response) {
  try {
    const result = await filmService.retryUpload(req);
    res.json(result);
  } catch (err: any) {
    console.error("Retry upload failed:", err);
    res.status(400).json({
      error: err.message || "Retry upload failed",
    });
  }
}



export async function initializeUploadController(
  req: Request,
  res: Response
) {
  try {
    const result = await filmService.initializeUpload(req);

    res.status(201).json({
      success: true,
      filmId: result.film_uuid,
      uploadUrl: result.filmUploadUrl,
      posterUploadUrl: result.posterUploadUrl,
      moderationUploadUrl: result.moderationUploadUrl
    });
  } catch (err) {
    logger.error("Initialize upload failed:", err);
    res.status(500).json({ error: "Failed to initialize upload" });
  }
}






export async function deleteFilmController(
  req: Request,
  res: Response
) {
  try {
    const { film_uuid } = req.body;
    const userId = req.user!.id;

    await filmService.deleteFilmService(film_uuid, userId);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete film failed:", err);
    res.status(400).json({ error: "Failed to delete film" });
  }
}





export async function processUploadController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const result = await filmService.processUpload(req);

    res.status(202).json({
      success: true,
      jobId: result.jobId,
      message: "Upload confirmed. Film processing started.",
    });
  } catch (err) {
    logger.error("Process upload failed:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}



export async function uploadFilmController(
  req: Request,
  res: Response,
  next: Function
): Promise<void> {
  try {
    //  Upoad and insert film (is_aproved = false)
    const result = await filmService.uploadFilm(req);

    //  filmId available for the moderation middleware
    res.locals.filmId = result.film_uuid;

    // 3️⃣ Respond immediately to the client
    res.status(201).json({
      success: true,
      filmId: result.film_uuid,
      message: "Film uploaded successfully and pending moderation.",
    });

    // 4️⃣ Continueo moderation middleware after sending response
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

// export async function deleteFilmController(req: Request, res: Response): Promise<void> {
//   try {
//     const result = await filmService.deleteFilm(req);
//     res.json(result);
//   } catch (err) {
//     logger.error('Delete film failed:', err);
//     res.status(500).json({ error: 'Unexpected server error' });
//   }
// }






