import app from './app.js';
import logger from './lib/logger.js';
import "./domains/moderation/moderation.jobs.js";
const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`Server listening on http://localhost:${port}`);
});
