import type { Request, Response } from "express";
import * as service from "./search.services.js";
import { searchSchema } from "./search.validations.js";

export async function advancedSearch(req: Request, res: Response) {
  try {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: error.details.map((d) => d.message),
      });
    }

    const results = await service.advancedSearch(value);
    res.json(results);
  } catch (err: any) {
    console.error("Advanced search error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}

export async function searchFilms(req: Request, res: Response) {
  try {
    const { error } = searchSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const results = await service.searchFilms(req.query);
    res.json(results);
  } catch (err: any) {
    console.error("Film search error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}

export async function searchAccounts(req: Request, res: Response) {
  try {
    const { error } = searchSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const results = await service.searchAccounts(req.query);
    res.json(results);
  } catch (err: any) {
    console.error("Account search error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}

export async function searchPlaylists(req: Request, res: Response) {
  try {
    const { error } = searchSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const results = await service.searchPlaylists(req.query);
    res.json(results);
  } catch (err: any) {
    console.error("Playlist search error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}

export async function combinedSearch(req: Request, res: Response) {
  try {
    const { q } = req.query;
    if (!q) return res.json({ results: [] });

    const results = await service.combinedSearch(q as string);
    res.json({ results });
  } catch (err: any) {
    console.error("Combined search error:", err);
    res.status(500).json({ error: "Failed to search" });
  }
}

export async function searchMentions(req: Request, res: Response) {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });

    const users = await service.searchMentions(q as string);
    res.json({ users });
  } catch (err: any) {
    console.error("Mentions search error:", err);
    res.status(500).json({ error: "Failed to search users" });
  }
}
