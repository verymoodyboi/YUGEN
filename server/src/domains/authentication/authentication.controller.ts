import type { Request, Response } from 'express';
import * as authService from './authentication.services.js';

export async function authStatus(req: any, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'unauthenticated' });
    }

    const result = await authService.getAuthStatus(req.user);
    return res.json(result);
  } catch (err: any) {
    console.error('Auth status error', { err });
    return res.status(500).json({
      status: 'unauthenticated',
      error: err.message,
    });
  }
}


export async function me(req: Request, res: Response) {
  try {
    const { id, email } = req.user ?? {};
    if (!id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await authService.getMe(id, email);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch user info' });
  }
}
