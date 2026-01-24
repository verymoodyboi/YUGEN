import { Request, Response } from "express";
import {
  getPendingUploads,
  acceptUpload,
  rejectUpload,
} from "./QA.services";

export async function getPendingUploadsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const uploads = await getPendingUploads();
    res.status(200).json(uploads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function acceptUploadController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { film_uuid } = req.params;

    if (!film_uuid) {
      res.status(400).json({ error: "film_uuid parameter is required" });
      return;
    }

    const result = await acceptUpload(film_uuid);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function rejectUploadController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { film_uuid } = req.params;

    if (!film_uuid) {
      res.status(400).json({ error: "film_uuid parameter is required" });
      return;
    }

    const result = await rejectUpload(film_uuid);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
