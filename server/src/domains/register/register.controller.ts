import type { Request, Response } from 'express';
import * as registerService from './register.services.js';
export async function register(req: Request, res: Response) {
  try {
    const result = await registerService.registerUser(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function registerGoogle(req: Request, res: Response) {
  try {
    const result = await registerService.registerGoogleUser(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}