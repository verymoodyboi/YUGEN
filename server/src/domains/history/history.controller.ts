import type { Request, Response } from 'express';
import * as service from './history.services.js';
import { addHistorySchema,removeHistorySchema } from './history.validations.js';

export async function addHistory(req: Request, res: Response) {
  try {
    const { error } = addHistorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details.map(d => d.message) });
    }

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await service.addHistory(userId, req.body.filmId);
    res.json({ success: true });
  } catch (err: any) {
    console.error('History add error:', err);
    res.status(500).json({ error: err.message });
  }
}


export async function removeHistory(req: Request, res: Response) {
  try {
    const { error } = removeHistorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details.map(d => d.message) });
    }

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await service.addHistory(userId, req.body.filmId);
    res.json({ success: true });
  } catch (err: any) {
    console.error('History remove error:', err);
    res.status(500).json({ error: err.message });
  }
}


export async function getHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const data = await service.getHistory(userId);
    res.json(data);
  } catch (err: any) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: err.message });
  }
}
