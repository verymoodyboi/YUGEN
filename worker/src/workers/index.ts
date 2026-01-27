import { runFilmWorker } from "./filmWorker.js"
import logger from "../lib/logger.js";
console.log("🔥 Film worker entrypoint loaded");

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled promise rejection", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", err);
  process.exit(1);
});

runFilmWorker().catch((err) => {
  logger.error("💥 Worker failed to start", err);
  process.exit(1);
});
