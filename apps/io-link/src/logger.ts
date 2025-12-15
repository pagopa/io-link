/* eslint-disable no-console */

import * as L from "@pagopa/logger";

import { Config } from "./config";

export const createLogger = (env: Config["environment"]): L.Logger => ({
  log: (s, level) => () => {
    if (env === "production" && level === "debug") {
      return;
    }
    if (level === "fatal" || level === "error") {
      console.error(s);
    } else {
      console.log(s);
    }
  },
  format: env === "development" ? L.format.simple : L.format.json
});
