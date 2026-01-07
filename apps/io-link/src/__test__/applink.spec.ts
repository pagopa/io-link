import { describe, expect, it } from "vitest";

import { buildLink, getPathFromPayload } from "../applink";

const payloads = [
  [
    "fci",
    { feat: "firma" as const, srid: "AAA" },
    "/fci/main?signatureRequestId=AAA"
  ],
  ["idpay", { feat: "idpay" as const, trxcode: "AAA" }, "/idpay/auth/AAA"]
] as const;

const payload = { feat: "firma" as const, srid: "AAA" };
const mocks = { payload };

describe("getPathFromPayload", () => {
  it.each(payloads)("gets the correct path for feat %s", (_, p, expected) => {
    const result = getPathFromPayload(p);
    expect(result).toBe(expected);
  });
});

describe("buildLink", () => {
  it("builds an absolute url for a given payload", () => {
    const result = buildLink("https://example.com", mocks.payload);
    expect(result).toBe("https://example.com/fci/main?signatureRequestId=AAA");
  });
  it("throws on invalid baseUrl", () => {
    expect(() => buildLink("INVALID", mocks.payload)).toThrowError(
      "unable to build the app link"
    );
  });
});
