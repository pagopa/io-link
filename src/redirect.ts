import { Config } from "./config";

type Platform = "ios" | "android";

const getPlatformFromUserAgent = (ua: string): Platform | undefined => {
  if (ua.includes("iPhone")) {
    return "ios";
  }
  if (ua.includes("Android") && ua.includes("Mobile")) {
    return "android";
  }
  return undefined;
};

export const getUrlFromUserAgent =
  (ua: string) => (url: Config["fallback"]) => {
    const platform = getPlatformFromUserAgent(ua);
    if (platform) {
      switch (platform) {
        case "android":
          return url.onAndroid ?? url.default;
        case "ios":
          return url.onIOS ?? url.default;
      }
    }
    return url.default;
  };
