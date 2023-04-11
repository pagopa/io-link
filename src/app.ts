import { PassThrough } from "node:stream";
import express, { Request } from "express";
import helmet from "helmet";
import cors from "cors";

import { z, ZodError } from "zod";

import qrcode from "qrcode";

import * as LE from "@pagopa/logger-express";
import * as L from "@pagopa/logger";

import {
  BuildLinkPayload,
  buildLink,
  appleAppSiteAssociation,
  assetLinks,
} from "./applink";

import { getUrlFromUserAgent } from "./redirect";

import { Config } from "./config";

const logError = (err: unknown, req: Request) => {
  /* c8 ignore start */
  if (err instanceof ZodError) {
    err.issues.forEach((issue) => {
      req.log?.("error", "invalid input", {
        issue,
      });
    });
  } else if (err instanceof Error) {
    req.log?.("error", err.message);
  }
  /* c8 ignore end */
};

export const createApp = (
  c: Readonly<Config>,
  logger: L.Logger
): express.Application => {
  const app = express();

  app.use(helmet());
  app.disable("x-powered-by");
  app.use(express.static("public"));
  app.use(LE.logger(logger));
  app.use(LE.access());

  app.get("/health", (req, res) => {
    res.status(204).end();
  });

  app.get("/.well-known/apple-app-site-association", (_, res) => {
    if (c.ios) {
      res.json(appleAppSiteAssociation(`${c.ios.appId}.${c.ios.bundleId}`));
    } else {
      res.status(404).end();
    }
  });

  app.get("/.well-known/assetlinks.json", (_, res) => {
    if (c.android) {
      res.json(
        assetLinks(c.android.packageName, ...c.android.sha256CertFingerprints)
      );
    } else {
      res.status(404).end();
    }
  });

  app.get("/qrcode.png", cors(), async (req, res) => {
    const Payload = z.intersection(
      BuildLinkPayload,
      z.object({
        width: z.coerce.number().min(100).max(500).default(250),
        color: z.string().length(9).regex(/^#/).default("#000000ff"),
      })
    );
    try {
      const payload = Payload.parse(req.query);
      req.log?.("debug", "parsed payload", {
        payload,
      });
      // The UNIVERSAL LINK should have https scheme
      const link = buildLink(`https://${req.get("host")}`, payload);
      req.log?.("debug", "link created", {
        link,
      });
      res.setHeader("Content-Type", "image/png");
      req.log?.("debug", "generating qr code");
      const qrCodeStream = new PassThrough();
      await qrcode.toFileStream(qrCodeStream, link, {
        width: payload.width,
        color: {
          dark: payload.color,
        },
      });
      qrCodeStream.pipe(res);
    } catch (err) {
      logError(err, req);
      res.status(404).end();
    }
  });

  app.get("/open", cors(), (req, res) => {
    try {
      const payload = BuildLinkPayload.parse(req.query);
      req.log?.("debug", "parsed payload", {
        payload,
      });
      const link = buildLink(`https://${req.get("host")}`, payload);
      req.log?.("debug", "link created", {
        link,
      });
      res.redirect(link);
    } catch (err) {
      logError(err, req);
      res.status(404).end();
    }
  });

  app.all("*", (req, res) => {
    const ua = req.header("user-agent") ?? "";
    const url = getUrlFromUserAgent(ua)(c.fallback);
    req.log?.("debug", `redirecting to ${url}`);
    res.redirect(url);
  });

  return app;
};
