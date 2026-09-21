import type { Request, Response } from 'express';
import * as streamService from './stream.services.js';

export async function getFilm(req: Request, res: Response) {
  try {
    const { filmId } = req.params;
    if (!filmId) {
      return res.status(400).json({ error: 'Missing filmId' });
    }

    const film = await streamService.getFilmById(filmId);
    res.json({ film });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch film' });
  }
}

export async function incrementView(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Missing film id' });
    }

    const result = await streamService.incrementView(id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unexpected error' });
  }
}

export async function clickFilm(req: Request, res: Response) {
  try {
    const { film_uuid } = req.params;

    if (!film_uuid ) {
      return res.status(400).json({ error: 'Missing film_uuid or user' });
    }
   
    const result = await streamService.logClick(film_uuid);
      res.json(result);
    
  
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unexpected error' });
  }
}
