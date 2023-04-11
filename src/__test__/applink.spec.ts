import { describe, it, expect } from "vitest";

import { getPathFromPayload, buildLink } from "../applink";

const payload = { feat: "firma" as const, srid: "AAA" };
const mocks = { payload };

describe("getPathFromPayload", () => {
  it("gets the correct path of io-sign", () => {
    const result = getPathFromPayload(mocks.payload);
    expect(result).toBe("/fci/main?signatureRequestId=AAA");
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
