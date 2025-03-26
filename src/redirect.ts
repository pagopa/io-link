import { AndroidCampaign, IosCampaign, StoreCampaign } from "./campaign";
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

/**
 * Add store campaign query parameters to the URL
 * @param url URL
 * @param storeCampaign Store campaign
 * @returns URL with store campaign
 */
const appendStoreCampaignParamsToUrl = (
  url: string,
  storeCampaign?: IosCampaign | AndroidCampaign
) => {
  if (!storeCampaign) {
    return url;
  }
  const urlWithParams = new URL(url);
  const params = new URLSearchParams(storeCampaign);
  urlWithParams.search = params.toString();
  return urlWithParams.toString();
};

/**
 * Get the URL based on the user agent
 * @param ua User agent
 * @param url Fallback URL
 * @param storeCampaign Optional store campaign
 */
export const getUrlFromUserAgent =
  (ua: string) => (url: Config["fallback"], storeCampaign?: StoreCampaign) => {
    const platform = getPlatformFromUserAgent(ua);
    if (platform) {
      switch (platform) {
        case "android":
          return url.onAndroid
            ? appendStoreCampaignParamsToUrl(
                url.onAndroid,
                storeCampaign?.android
              )
            : url.default;
        case "ios":
          return url.onIOS
            ? appendStoreCampaignParamsToUrl(url.onIOS, storeCampaign?.ios)
            : url.default;
      }
    }
    return url.default;
  };
