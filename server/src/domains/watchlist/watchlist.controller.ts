import type { Request, Response } from "express";
import * as service from "./watchlist.services.js";
import { toggleWatchlistSchema, checkWatchlistSchema } from "./watchlist.validations.js";

export async function toggleWatchlist(req: Request, res: Response) {
  try {
    const { error } = toggleWatchlistSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const userId = req.user?.id;
    const result = await service.toggleWatchlist(userId!, req.body.filmID);
    res.json(result);
  } catch (err: any) {
    console.error("Watchlist toggle error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function checkWatchlist(req: Request, res: Response) {
  try {
    const { error } = checkWatchlistSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const userId = req.user?.id;
    const result = await service.checkWatchlist(userId!, req.query.filmID as string);
    res.json(result);
  } catch (err: any) {
    console.error("Check watchlist error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getMyWatchlist(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const result = await service.getMyWatchlist(userId!);
    res.json({ watchlist: result });
  } catch (err: any) {
    console.error("Error fetching watchlist:", err);
    res.status(500).json({ error: err.message });
  }
}
