import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";

import express from "express";

import * as L from "@pagopa/logger";

import { createApp } from "../app";
import { Config } from "../config";
import { appleAppSiteAssociation, assetLinks } from "../applink";

type AppTestContext = {
  app: express.Application;
  endpoint: string;
};

const config: Config = {
  environment: "development",
  port: 3000,
  ios: {
    appId: "IOS_APP_ID",
    bundleId: "it.pagopa.io.continua.test",
  },
  android: {
    packageName: "ANDROID_PACKAGE_NAME",
    sha256CertFingerprints: ["AAA1", "AAA2"],
  },
  fallback: {
    onAndroid: "PLAYSTORE_URL",
    onIOS: "APPSTORE_URL",
    default: "FALLBACK_URL",
  },
};

const logger: L.Logger = {
  log: () => () => {},
};

const mocks = { config, logger };

beforeEach<AppTestContext>((ctx) => {
  ctx.app = createApp(mocks.config, mocks.logger);
});

describe("/.well-known/apple-app-site-association", () => {
  beforeEach<AppTestContext>((ctx) => {
    ctx.endpoint = "/.well-known/apple-app-site-association";
  });
  it<AppTestContext>("should return 404 when iOS is not enabled", async (ctx) => {
    const app = createApp({ ...config, ios: undefined }, logger);
    await supertest(app).get(ctx.endpoint).expect(404);
  });
  it<AppTestContext>("should return 200 with the correct response when iOS is enabled", async (ctx) => {
    if (mocks.config.ios) {
      const aasa = appleAppSiteAssociation(
        `${mocks.config.ios.appId}.${mocks.config.ios.bundleId}`
      );
      const res = await supertest(ctx.app).get(ctx.endpoint).expect(200);
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.body).toEqual(aasa);
    }
    expect.assertions(2);
  });
});

describe("./.well-known/assetlinks.json", () => {
  beforeEach<AppTestContext>((ctx) => {
    ctx.endpoint = "/.well-known/assetlinks.json";
  });
  it<AppTestContext>("should return 404 when Android is not enabled", async (ctx) => {
    const app = createApp({ ...config, android: undefined }, logger);
    await supertest(app).get(ctx.endpoint).expect(404);
  });
  it<AppTestContext>("should return 200 with the correct response when Android is enabled", async (ctx) => {
    if (mocks.config.android) {
      const assets = assetLinks(
        mocks.config.android.packageName,
        ...mocks.config.android.sha256CertFingerprints
      );
      const res = await supertest(ctx.app).get(ctx.endpoint).expect(200);
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.body).toEqual(assets);
    }
    expect.assertions(2);
  });
});

describe("/qrcode.png", () => {
  beforeEach<AppTestContext>((ctx) => {
    ctx.endpoint = "/qrcode.png";
  });
  it<AppTestContext>("should return 404 on invalid request (invalid feature or missing payload data)", async (ctx) => {
    await supertest(ctx.app).get(ctx.endpoint).expect(404);
    await supertest(ctx.app).get(`${ctx.endpoint}?feat=firma`);
  });
  it<AppTestContext>("should return a 200 with a QRCODE image in png when payload is valid", async (ctx) => {
    const res = await supertest(ctx.app)
      .get(`${ctx.endpoint}?feat=firma&srid=SIGNATUREID`)
      .set("X-Forwarded-Host", "localhost:1407")
      .expect(200);
    expect(res.headers["content-type"]).toContain("image/png");
    // Since this is a test executed in an async context, we have to use "expect" from the context
    // to ensure vitest picks the right test case.
    // Ref: https://vitest.dev/guide/snapshot.html#use-snapshots
    ctx.expect(res.body).toMatchSnapshot();
  });
});

describe("/open", () => {
  beforeEach<AppTestContext>((ctx) => {
    ctx.endpoint = "/open";
  });
  it<AppTestContext>("should return 404 on invalid request (invalid feature or missing payload data)", async (ctx) => {
    await supertest(ctx.app).get(ctx.endpoint).expect(404);
    await supertest(ctx.app).get(`${ctx.endpoint}?feat=firma`);
  });
  it<AppTestContext>("should redirect to link when payload is valid", async (ctx) => {
    await supertest(ctx.app)
      .get(`${ctx.endpoint}?feat=firma&srid=SIGNATUREID`)
      .set("X-Forwarded-Host", "localhost:1407")
      .expect(302)
      .expect(
        "Location",
        "https://localhost:1407/fci/main?signatureRequestId=SIGNATUREID"
      );
  });
});

describe("*", () => {
  beforeEach<AppTestContext>((ctx) => {
    ctx.endpoint = "/wallet";
  });
  it<AppTestContext>("should redirect me to Apple App Store if I'm on Apple device", async (ctx) => {
    await supertest(ctx.app)
      .get(ctx.endpoint)
      .set(
        "User-Agent",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/111.0.5563.101 Mobile/15E148 Safari/604.1"
      )
      .expect(302)
      .expect("Location", mocks.config.fallback.onIOS ?? "");
  });
});
