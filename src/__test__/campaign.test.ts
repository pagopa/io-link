import { describe, it, expect } from "vitest";
import { parseStoreCampaignFromRequest, maybeStoreCampagn } from "../campaign";
import { Request } from "express";

describe("Campaign", () => {
  describe("parseStoreCampaignFromRequest", () => {
    it("should parse valid Android campaign", () => {
      const mockReq = {
        query: {
          utm_source: "test-source",
          utm_medium: "test-medium",
          utm_campaign: "test-campaign"
        }
      } as unknown as Request;

      const result = parseStoreCampaignFromRequest(mockReq);
      expect(result).toEqual({
        android: {
          utm_source: "test-source",
          utm_medium: "test-medium",
          utm_campaign: "test-campaign"
        },
        ios: undefined
      });
    });

    it("should parse valid iOS campaign", () => {
      const mockReq = {
        query: {
          pt: "test-pt",
          ct: "test-ct",
          mt: "test-mt"
        }
      } as unknown as Request;

      const result = parseStoreCampaignFromRequest(mockReq);
      expect(result).toEqual({
        android: undefined,
        ios: {
          pt: "test-pt",
          ct: "test-ct",
          mt: "test-mt"
        }
      });
    });

    it("should throw on invalid campaign", () => {
      const mockReq = {
        query: {
          utm_source: "", // Empty string will cause validation error
          utm_medium: "test-medium",
          utm_campaign: "test-campaign"
        }
      } as unknown as Request;

      expect(() => parseStoreCampaignFromRequest(mockReq)).toThrow();
    });
  });

  describe("maybeStoreCampagn", () => {
    it("should return campaign if valid", () => {
      const mockReq = {
        query: {
          utm_source: "test-source",
          utm_medium: "test-medium",
          utm_campaign: "test-campaign"
        }
      } as unknown as Request;

      const result = maybeStoreCampagn(mockReq);
      expect(result).toBeDefined();
    });

    it("should return undefined if campaign is invalid", () => {
      const mockReq = {
        query: {
          utm_source: "", // Empty string causes validation error
          utm_medium: "test-medium",
          utm_campaign: "test-campaign"
        }
      } as unknown as Request;

      const result = maybeStoreCampagn(mockReq);
      expect(result).toBeUndefined();
    });
  });
});
