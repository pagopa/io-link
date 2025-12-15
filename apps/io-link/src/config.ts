import { z } from "zod";

const Config = z.object({
  environment: z.enum(["development", "production"]).default("production"),
  port: z.coerce.number().min(1024).max(49151).default(3000),
  ios: z
    .object({
      appId: z.string().nonempty(),
      bundleId: z.string().nonempty()
    })
    .optional(),
  android: z
    .object({
      packageName: z.string(),
      sha256CertFingerprints: z.string().transform((s) => s.split(","))
    })
    .optional(),
  fallback: z.object({
    onIOS: z.string().url().optional(),
    onAndroid: z.string().url().optional(),
    default: z.string().url()
  })
});

export type Config = z.infer<typeof Config>;

/**
 * @throws {ZodError} Config should be valid
 */
export const parseConfigFromEnvironment = () => {
  const configFromEnvironment = {
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    ios: {
      appId: process.env.IOS_APP_ID,
      bundleId: process.env.IOS_BUNDLE_ID
    },
    android: {
      packageName: process.env.ANDROID_PACKAGE_NAME,
      sha256CertFingerprints: process.env.ANDROID_SHA_256_CERT_FINGERPRINTS
    },
    fallback: {
      default: process.env.FALLBACK_URL,
      onIOS: process.env.FALLBACK_URL_ON_IOS,
      onAndroid: process.env.FALLBACK_URL_ON_ANDROID
    }
  };
  return Config.parse(configFromEnvironment);
};
