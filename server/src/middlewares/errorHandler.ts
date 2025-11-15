import type { Request, Response, NextFunction } from 'express';

import  logger from '../lib/logger.js';
import AppError from './classes/AppError.js';

/**
 * Centralized Express error handler.
 * Logs error and returns consistent JSON response.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Convert unknwn to Error if possible
  const error = err instanceof Error ? err : new Error(String(err));

  logger.error(error.stack || error.message);

  // If response already started, delegate to Express default
  if (res.headersSent) {
    return next(error);
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  // Fallback for unexpected errors
  res.status(500).json({ error: 'Internal server error' });
}
