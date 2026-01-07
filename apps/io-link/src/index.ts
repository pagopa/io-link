import * as L from "@pagopa/logger";
import { ZodError } from "zod";

import { createApp } from "./app";
import { parseConfigFromEnvironment } from "./config";
import { createLogger } from "./logger";

// Create a logger based on environment
// The env is not read from config because that operation can fails
const logger = createLogger(
  process.env.NODE_ENV === "development" ? "development" : "production"
);

const log = (
  level: "info" | "error",
  message: string,
  context: Record<string, unknown> = {}
) => L.log(level)(message, context)({ logger })();

try {
  const config = parseConfigFromEnvironment();
  const app = createApp(config, logger);
  app.listen(config.port, "0.0.0.0", () => {
    log("info", "service started", {
      port: config.port
    });
  });
} catch (err) {
  if (err instanceof ZodError) {
    err.issues.forEach((issue) => {
      log("error", "invalid config", {
        issue
      });
    });
  } else if (err instanceof Error) {
    log("error", err.message, {
      cause: err.cause
    });
  }
  process.exit(1);
}
