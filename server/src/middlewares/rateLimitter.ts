// src/middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import type { RequestHandler } from 'express';

/**
 * Default/global API rate limiter using settings from src/config.
 * Exports a RequestHandler that you can `app.use(...)` to apply globally.
 */
const defaultLimiter: RequestHandler = rateLimit({
  windowMs: config.RATE_LIMIT.windowMs,
  max: config.RATE_LIMIT.max,
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false,  // Disable the deprecated X-RateLimit-* headers
  // Customize response body when client is rate-limited
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests — try again later.' });
  },
}) as unknown as RequestHandler;

export default defaultLimiter;

/**
 * Create a custom rate limiter for specific routes (per-route limits).
 * Example use: router.post('/heavy', createRateLimiter({ max: 5, windowMs: 60_000 }), handler)
 */
export function createRateLimiter(options?: Partial<{
  windowMs: number;
  max: number;
  message?: string | object;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}>): RequestHandler {
  const opts = {
    windowMs: config.RATE_LIMIT.windowMs,
    max: config.RATE_LIMIT.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: any, res: any) => {
      res.status(429).json(typeof options?.message === 'string' ? { error: options?.message } : { error: 'Too many requests — try again later.' });
    },
    ...options,
  };

  // rateLimit returns a middleware; we cast to RequestHandler to satisfy TypeScript
  return rateLimit(opts as any) as unknown as RequestHandler;
}
