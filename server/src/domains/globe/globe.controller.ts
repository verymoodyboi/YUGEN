import { Request, Response } from "express";
import {
  getFilmsByCountry,
  getCountryStats,
  fetchArtistsByCountry,
} from "./globe.services.js";
import logger from "../../lib/logger";

/**
 * GET /globe/:name/films
 */
/**
 * GET /globe/:name/films
 */
export const fetchFilmsByCountry = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = parseInt(req.query.offset as string) || 0;

    const films = await getFilmsByCountry(name, limit, offset);
    console.log(`Fetched ${films.length} films for ${name} (offset ${offset})`);

    res.status(200).json({ success: true, data: films });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /globe/:country/users
 */
export const getArtistsByCountry = async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    if (!country) return res.status(400).json({ error: "Country required" });

    const limit = parseInt(req.query.limit as string) || 9;
    const offset = parseInt(req.query.offset as string) || 0;

    const artists = await fetchArtistsByCountry(country, limit, offset);
    console.log(
      `Fetched ${artists.length} artists for ${country} (offset ${offset})`
    );

    res.status(200).json({ success: true, data: artists });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /globe/:name/stats
 */
export const fetchCountryStats = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const stats = await getCountryStats(name);
    res.status(200).json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /globe/:country/users
 */
