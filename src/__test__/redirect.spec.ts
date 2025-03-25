import { describe, it, expect } from "vitest";
import { getUrlFromUserAgent } from "../redirect";
import { Config } from "../config";
import { StoreCampaign } from "../campaign";

const urls: Config["fallback"] = {
  onAndroid: "PLAY_STORE",
  onIOS: "APP_STORE",
  default: "FALL_BACK"
};

const androidTestTable = [
  {
    ua: "Mozilla/5.0 (Android 11; Mobile; rv:92.0) Gecko/92.0 Firefox/92.0",
    url: urls.onAndroid
  },
  {
    ua: "Mozilla/5.0 (Linux; Android 11; moto g 5G plus) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Mobile Safari/537.36",
    url: urls.onAndroid
  }
];
const iosTestTable = [
  {
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1",
    url: urls.onIOS
  },
  {
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/111.0.5563.101 Mobile/15E148 Safari/604.1",
    url: urls.onIOS
  },
  {
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/111.0 Mobile/15E148 Safari/605.1.15",
    url: urls.onIOS
  },
  {
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/111.0.5563.101 Mobile/15E148 Safari/604.1",
    url: urls.onIOS
  },
  {
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1",
    url: urls.onIOS
  },

  {
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 276.1.0.14.103 (iPhone9,3; iOS 14_4_2; it_IT; it-IT; scale=2.00; 750x1334; 460329226) NW/3",
    url: urls.onIOS
  }
];

const defaultTestTable = [
  {
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
    url: urls.default
  }
];

describe("getUrlFromUserAgent", () => {
  it("returns the right url for a given User-Agent", () => {
    const testTable = [
      ...androidTestTable,
      ...iosTestTable,
      ...defaultTestTable
    ];
    testTable.forEach(({ ua, url }) => {
      expect(getUrlFromUserAgent(ua)(urls)).toBe(url);
    });
  });
  it("use the fallback url when the platform override is not defined", () => {
    const iPhone =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1";
    const AndroidPhone =
      "Mozilla/5.0 (Linux; Android 11; moto g 5G plus) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Mobile Safari/537.36";
    const urls: Config["fallback"] = {
      default: "DEFAULT"
    };
    expect(getUrlFromUserAgent(iPhone)(urls)).toBe(urls.default);
    expect(getUrlFromUserAgent(AndroidPhone)(urls)).toBe(urls.default);
  });
});

describe("getUrlFromUserAgent with store campaigns params", () => {
  const mockConfig = {
    default: "https://default.com",
    onAndroid: "https://play.google.com/store/apps",
    onIOS: "https://apps.apple.com/app"
  };

  const mockStoreCampaign: StoreCampaign = {
    android: {
      utm_source: "android_source",
      utm_medium: "android_medium",
      utm_campaign: "android_campaign"
    },
    ios: {
      ct: "ios_ct",
      mt: "ios_mt",
      pt: "ios_pt"
    }
  };

  it("should return default URL when platform-specific URL is not provided", () => {
    const getUrl = getUrlFromUserAgent(defaultTestTable[0].ua);
    const result = getUrl(mockConfig, mockStoreCampaign);
    expect(result).toBe(mockConfig.default);
  });

  it("should append store campaign parameters for Android", () => {
    const getUrl = getUrlFromUserAgent(androidTestTable[0].ua);
    const result = getUrl(mockConfig, mockStoreCampaign);
    expect(result).toBe(
      mockConfig.onAndroid +
        "?utm_source=android_source&utm_medium=android_medium&utm_campaign=android_campaign"
    );
  });

  it("should append store campaign parameters for iOS", () => {
    const getUrl = getUrlFromUserAgent(iosTestTable[0].ua);
    const result = getUrl(mockConfig, mockStoreCampaign);
    expect(result).toBe(mockConfig.onIOS + "?ct=ios_ct&mt=ios_mt&pt=ios_pt");
  });
});
