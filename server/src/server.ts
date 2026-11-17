import app from './app.js';
import logger from './lib/logger.js';
import "./domains/moderation/moderation.jobs.js";

const port = parseInt(process.env.PORT || "3000", 10);

app.listen(port, '0.0.0.0', () => {
  logger.info(`Server listening on port: ${port}`);
});
