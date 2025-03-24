import * as express from "express";
import { z } from "zod";

const StoreCampaign = z.object({
  android: z
    .object({
      utm_source: z.string().nonempty(),
      utm_medium: z.string().nonempty(),
      utm_campaign: z.string().nonempty()
    })
    .optional(),
  ios: z
    .object({
      pt: z.string().nonempty(),
      ct: z.string().nonempty(),
      mt: z.string().nonempty()
    })
    .optional()
});

export type StoreCampaign = z.infer<typeof StoreCampaign>;

/**
 * @throws {ZodError} StoreCampaign should be valid
 */
export const parseStoreCampaignFromRequest = (req: express.Request) => {
  const storeCampaignFromRequest = {
    android: {
      utm_source: req.query.utm_source,
      utm_medium: req.query.utm_medium,
      utm_campaign: req.query.utm_campaign
    },
    ios: {
      pt: req.query.pt,
      ct: req.query.ct,
      mt: req.query.mt
    }
  };
  return StoreCampaign.parse(storeCampaignFromRequest);
};

/**
 * Parse store campaign from request
 * @param req Express request
 * @returns StoreCampaign if it is valid, undefined otherwise
 */
export const maybeStoreCampagn = (
  req: express.Request
): StoreCampaign | undefined => {
  try {
    return parseStoreCampaignFromRequest(req);
  } catch (err) {
    return undefined;
  }
};
