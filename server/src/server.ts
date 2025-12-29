import app from './app.js';
import logger from './lib/logger.js';
import "./domains/moderation/moderation.jobs.js";

const port = process.env.PORT || 3000;
console.log("ENV CHECK:", {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
app.listen(3000, () => {
  logger.info(`Server listening on http://localhost:${port}`);
});
