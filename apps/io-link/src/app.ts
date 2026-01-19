import * as L from "@pagopa/logger";
import * as LE from "@pagopa/logger-express";
import cors from "cors";
import express, { Request } from "express";
import helmet from "helmet";
import { PassThrough } from "node:stream";
import qrcode from "qrcode";
import { ZodError, z } from "zod";

import {
  BuildLinkPayload,
  appleAppSiteAssociation,
  assetLinks,
  buildLink
} from "./applink";
import { maybeStoreCampaign } from "./campaign";
import { Config } from "./config";
import { getUrlFromUserAgent } from "./redirect";

const logError = (err: unknown, req: Request) => {
  /* c8 ignore start */
  if (err instanceof ZodError) {
    err.issues.forEach((issue) => {
      req.log?.("error", "invalid input", {
        issue
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

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
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
        color: z.string().length(9).regex(/^#/).default("#000000ff")
      })
    );
    try {
      const payload = Payload.parse(req.query);
      req.log?.("debug", "parsed payload", {
        payload
      });
      // The UNIVERSAL LINK should have https scheme
      const link = buildLink(`https://${req.get("x-forwarded-host")}`, payload);
      req.log?.("debug", "link created", {
        link
      });
      res.setHeader("Content-Type", "image/png");
      req.log?.("debug", "generating qr code");
      const qrCodeStream = new PassThrough();
      await qrcode.toFileStream(qrCodeStream, link, {
        width: payload.width,
        color: {
          dark: payload.color
        }
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
        payload
      });
      const link = buildLink(`https://${req.get("x-forwarded-host")}`, payload);
      req.log?.("debug", "link created", {
        link
      });
      res.redirect(link);
    } catch (err) {
      logError(err, req);
      res.status(404).end();
    }
  });

  app.all("/main/wallet", (req, res) => {
    // Redirect to /main/messages for temporary fix of the wallet external link issue
    req.log?.("debug", "redirecting to /main/messages as temporary wallet fix");
    const queryString = new URLSearchParams(
      req.query as Record<string, string>
    ).toString();
    const host = req.get("X-Original-Host") || req.get("Host");
    res.redirect(
      `${req.protocol}://${host}/main/messages${
        queryString ? "?" + queryString : ""
      }`
    );
  });

  app.all("*", (req, res) => {
    const ua = req.header("user-agent") ?? "";
    const url = getUrlFromUserAgent(ua)(c.fallback, maybeStoreCampaign(req));
    req.log?.("debug", `redirecting to ${url}`);
    res.redirect(url);
  });

  return app;
};
