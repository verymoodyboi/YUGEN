import type { Request, Response } from 'express';
import * as service from './pokes.services.js';
import {
  sendPokeSchema,
  acceptPokeSchema,
   deletePokeSchema,
  pokeStatusSchema,
} from './pokes.validations.js';

export async function sendPoke(req: Request, res: Response) {
  try {
    const { error } = sendPokeSchema.validate(req.body);
    if (error)
      return res.status(400).json({ error: error.details.map(d => d.message) });

    const pokerId = req.user?.id;
    const { targetId } = req.body;

    if (!pokerId)
      return res.status(401).json({ error: 'Unauthorized' });

    await service.sendPoke(pokerId, targetId);

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error sending poke:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function acceptPoke(req: Request, res: Response) {
  try {
    const { error } = acceptPokeSchema.validate(req.body);
    if (error)
      return res.status(400).json({ error: error.details.map(d => d.message) });

    const userId = req.user?.id;
    const { pokeId } = req.body;

    if (!userId)
      return res.status(401).json({ error: 'Unauthorized' });

    await service.acceptPoke(userId, pokeId);

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error accepting poke:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function getUserPokes(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId)
      return res.status(401).json({ error: 'Unauthorized' });

    const result = await service.getUserPokes(userId);

    res.json(result);
  } catch (err: any) {
    console.error('Error fetching user pokes:', err);
    res.status(500).json({ error: err.message });
  }
}



export async function deletePoke(req: Request, res: Response) {
  try {
    const { error } = deletePokeSchema.validate(req.body);
    if (error)
      return res.status(400).json({ error: error.details.map(d => d.message) });

    const userId = req.user?.id;
    const { pokeId } = req.body;

    if (!userId)
      return res.status(401).json({ error: "Unauthorized" });

    await service.deletePoke(userId, pokeId);

    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting poke:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get poke status
 */
export async function getPokeStatus(req: Request, res: Response) {
  try {
    const { error } = pokeStatusSchema.validate(req.query);
    if (error)
      return res.status(400).json({ error: error.details.map(d => d.message) });

    const userId = req.user?.id;
    const { profileUserId } = req.query;

    if (!userId)
      return res.status(401).json({ error: "Unauthorized" });

    const result = await service.getPokeStatus(
      userId,
      String(profileUserId)
    );

    res.json(result);
  } catch (err: any) {
    console.error("Error fetching poke status:", err);
    res.status(500).json({ error: err.message });
  }
}



export async function rejectPoke(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { pokeId } = req.params;

    await service.rejectPoke(userId, pokeId);

    res.status(200).json({ message: "Poke rejected" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}