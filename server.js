import "dotenv/config";
import { requireEnv } from "./utils/env.js";
import app from "./app.js";
import logger from "./utils/logger.js";

// Fail fast if required secrets are missing
requireEnv("SESSION_SECRET", "CSRF_SECRET");

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV }, "Server started");
});

const shutdown = (signal) => {
  logger.info({ signal }, "Graceful shutdown initiated");
  server.close(() => {
    logger.info("All connections closed, exiting");
    process.exit(0);
  });
  // Force exit if connections don't drain within 10 s
  setTimeout(() => {
    logger.error("Shutdown timed out, forcing exit");
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => {
  logger.error({ err }, "Unhandled promise rejection");
  shutdown("unhandledRejection");
});
