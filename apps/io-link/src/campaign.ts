import * as express from "express";
import { z } from "zod";

import { stripUndefined } from "./utils";

const AndroidCampaign = z.object({
  utm_source: z.string().nonempty(),
  utm_medium: z.string().nonempty(),
  utm_campaign: z.string().nonempty()
});

export type AndroidCampaign = z.infer<typeof AndroidCampaign>;

const IosCampaign = z.object({
  pt: z.string().nonempty(),
  ct: z.string().nonempty(),
  mt: z.string().nonempty()
});

export type IosCampaign = z.infer<typeof IosCampaign>;

const StoreCampaign = z.union([
  z.object({
    android: AndroidCampaign,
    ios: IosCampaign.optional()
  }),
  z.object({
    android: AndroidCampaign.optional(),
    ios: IosCampaign
  })
]);

export type StoreCampaign = z.infer<typeof StoreCampaign>;

/**
 * @throws {ZodError} StoreCampaign should be valid
 */
export const parseStoreCampaignFromRequest = (req: express.Request) => {
  const maybeAndroidCampaign = AndroidCampaign.safeParse({
    utm_source: req.query.utm_source,
    utm_medium: req.query.utm_medium,
    utm_campaign: req.query.utm_campaign
  });
  const maybeIosCampaign = IosCampaign.safeParse({
    pt: req.query.pt,
    ct: req.query.ct,
    mt: req.query.mt
  });
  const storeCampaignFromRequest = {
    android: maybeAndroidCampaign.success
      ? maybeAndroidCampaign.data
      : undefined,
    ios: maybeIosCampaign.success ? maybeIosCampaign.data : undefined
  };
  return StoreCampaign.parse(stripUndefined(storeCampaignFromRequest));
};

/**
 * Parse store campaign from request
 * @param req Express request
 * @returns StoreCampaign if it is valid, undefined otherwise
 */
export const maybeStoreCampaign = (
  req: express.Request
): StoreCampaign | undefined => {
  try {
    return parseStoreCampaignFromRequest(req);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return undefined;
  }
};
