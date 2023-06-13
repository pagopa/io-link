import { z } from "zod";

export const BuildLinkPayload = z.discriminatedUnion("feat", [
  z.object({ feat: z.literal("firma"), srid: z.string().nonempty() }),
  z.object({ feat: z.literal("idpay"), trxcode: z.string().nonempty() }),
]);

type BuildLinkPayload = z.infer<typeof BuildLinkPayload>;

export const getPathFromPayload = (p: BuildLinkPayload): string => {
  // The small switch here allows us to make sure that this
  // function is "total" "p.feat" is a discriminated union
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (p.feat) {
    case "firma":
      return `/fci/main?signatureRequestId=${p.srid}`;
    case "idpay":
      return `/idpay/auth/${p.trxcode}`;
  }
};

/**
 * Builds the URL of the UNIVERSAL LINK
 * The base URL should be the hostname of this webserver
 * The path must be equal to the in-app route of the linked screen
 * @throws {Error} baseUrl should be a valid URL
 */
export const buildLink = (baseUrl: string, p: BuildLinkPayload): string => {
  try {
    const path = getPathFromPayload(p);
    const url = new URL(path, baseUrl);
    return url.href;
  } catch (e) {
    throw new Error(
      "unable to build the app link",
      /* c8 ignore start */
      e instanceof Error
        ? {
            cause: e.message,
          }
        : {}
      /* c8 ignore end */
    );
  }
};

// Builds the content "Apple App Site Association" (AASA) file
// Allows us to connect an IOS and IPAD OS app to a domain
// It must be server on .well-known/apple-app-site-association
export const appleAppSiteAssociation = (...appIDs: string[]) => ({
  applinks: {
    details: appIDs.map((appID) => ({
      appID,
      appIDs,
      paths: ["*"],
      components: [
        {
          "/": "*",
        },
      ],
    })),
  },
});

// Builds the content of "assetlinks.json" file
// Allows us to connect an ANDROID app to a domain
// It must be server on .well-known/assetlink.json
export const assetLinks = (
  package_name: string,
  ...sha256_cert_fingerprints: string[]
) => [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name,
      sha256_cert_fingerprints,
    },
  },
];
