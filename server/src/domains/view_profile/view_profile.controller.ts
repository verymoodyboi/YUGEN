import type { Request, Response } from "express";
import * as service from "./view_profile.services.js";

export async function getUserProfile(req: Request, res: Response) {
  try {
    const username = req.query.username as string;
    if (!username) {
      return res.status(400).json({ error: "Missing username parameter" });
    }

    const user = await service.getUserProfile(username);
    res.json({ user });
  } catch (err: any) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

export async function getLatestProfileFilms(req: Request, res: Response) {
  try {
    const uploaderID = req.query.uploaderID as string;
    if (!uploaderID) {
      return res.status(400).json({ error: "Missing uploaderID parameter" });
    }

    const offset = parseInt((req.query.offset as string) || "0", 10);
    const limit = parseInt((req.query.limit as string) || "5", 10);

    const films = await service.getLatestProfileFilms(uploaderID, offset, limit);
    res.json(films);
  } catch (err: any) {
    console.error("Error fetching latest profile films:", err);
    res.status(500).json({ error: "Failed to fetch latest profile films" });
  }
}
