import express from 'express';
import type { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

import logger from './lib/logger.js';
import rateLimiter from './middlewares/rateLimitter.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Import your domain routes
import registertRouter from './domains/register/register.routes.js';
import profiletRouter from './domains/profile/profile.routes.js';
import filmsRouter from './domains/films/films.routes.js';
import streamRouter from './domains/stream/stream.routes.js';
import authRouter from './domains/authentication/authentication.routes.js';
import reportRouter from './domains/report/report.routes.js';
import academictRouter from './domains/academic/academic.routes.js';
import thoughtstRouter from './domains/thoughts/thoughts.routes.js';
import subsRouter from './domains/subscriptions/subscriptions.routes.js';
import historyRouter from './domains/history/history.routes.js';
import playlistsRouter from './domains/playlists/playlists.routes.js';
import watchlistRouter from './domains/watchlist/watchlist.routes.js';
import searchRouter from './domains/search/search.routes.js';
import recommendationsRouter from './domains/recommendations/recommendations.routes.js';
import challengesRouter from './domains/challenges/challenges.routes.js';
import view_profileRouter from './domains/view_profile/view_profile.routes.js';
import exploreRouter from "./domains/explore/explore.router.js"
import globeRoutes from "./domains/globe/globe.routes.js"
import toolstRouter from './domains/tools/tools.routes.js';
import flaggedRouter from "./domains/admin/flagged_films/flagged_films.routes.js"
import moderationRouter from './domains/moderation/moderation.routes.js';

import { register } from 'module';

// import userRoutes from './modules/users/users.routes.js'; // future

const app: Application = express();
const allowedOrigins = [
  "https://frontend-domain.com", // temp production url
  "http://localhost:5174",  
  "http://localhost:5173",            // for local dev
];
// Security middlewares
app.use(helmet());
app.use(compression());

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Rate limiting
app.use(rateLimiter);

// JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount domain routes
app.use('/api/register', registertRouter);
app.use('/api/profile', profiletRouter);
app.use('/api/thoughts', thoughtstRouter);
app.use('/api/tools', toolstRouter);
app.use('/api/auth', authRouter);
app.use('/api/films', filmsRouter);
app.use('/api/stream', streamRouter);
app.use('/api/report', reportRouter);
app.use('/api/academic', academictRouter);
app.use('/api/thoughts', thoughtstRouter);
app.use('/api/subs', subsRouter);
app.use('/api/history', historyRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/search', searchRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/view_profile', view_profileRouter);
app.use("/api/explore",exploreRouter)
app.use("/api/globe",globeRoutes)
app.use("/api/flagged",flaggedRouter)
app.use("/api/moderation", moderationRouter);
// app.use('/api/users', userRoutes); // future

// Centralized error handler (last)
app.use(errorHandler);

logger.info('Express app initialized');

export default app;
