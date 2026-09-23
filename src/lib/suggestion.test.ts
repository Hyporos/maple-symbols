import { afterEach, describe, expect, it, vi } from "vitest";
import { readAnswered, rememberAnswered, SUGGESTION_KEY, suggestedEdition } from "./suggestion";
import type { Region } from "./regions";

describe("suggestedEdition (REGIONS D-9)", () => {
  // [languages, time zone, page's server, suggestion]
  const cases: [string[], string | undefined, Region, Region | null][] = [
    // Each server's own language, from the GMS page.
    [["ko-KR", "ko", "en-US"], "Asia/Seoul", "gms", "kms"],
    [["ko"], "America/Los_Angeles", "gms", "kms"],
    [["ja-JP"], "Asia/Tokyo", "gms", "jms"],
    [["zh-TW"], undefined, "gms", "tms"],
    [["zh-HK"], undefined, "gms", "tms"],
    [["zh-Hant"], undefined, "gms", "tms"],
    [["zh-CN"], undefined, "gms", "cms"],
    [["zh-Hans"], undefined, "gms", "cms"],
    [["zh"], undefined, "gms", "cms"],
    [["zh-SG"], undefined, "gms", "msea"],
    [["en-SG"], undefined, "gms", "msea"],
    [["en-MY"], undefined, "gms", "msea"],
    [["en-PH"], undefined, "gms", "msea"],
    [["en-TH"], undefined, "gms", "msea"],
    [["ms-MY"], undefined, "gms", "msea"],
    [["th"], undefined, "gms", "msea"],
    [["id-ID"], undefined, "gms", "msea"],
    [["fil"], undefined, "gms", "msea"],
    [["vi-VN"], undefined, "gms", "msea"],
    // An English browser in a server's time zone: the zone speaks.
    [["en-US", "en"], "Asia/Singapore", "gms", "msea"],
    [["en-US"], "Asia/Kuala_Lumpur", "gms", "msea"],
    [["en-US"], "Asia/Manila", "gms", "msea"],
    [["en-US"], "Asia/Bangkok", "gms", "msea"],
    [["en-US"], "Asia/Jakarta", "gms", "msea"],
    [["en-US"], "Asia/Ho_Chi_Minh", "gms", "msea"],
    [["en-US"], "Asia/Saigon", "gms", "msea"],
    [["en"], "Asia/Seoul", "gms", "kms"],
    [["en-GB"], "Asia/Tokyo", "gms", "jms"],
    [["en-US"], "Asia/Taipei", "gms", "tms"],
    [["en-US"], "Asia/Shanghai", "gms", "cms"],
    // The page already is that server's: no banner.
    [["ko-KR"], "Asia/Seoul", "kms", null],
    [["en-SG"], "Asia/Singapore", "msea", null],
    [["en-US"], "America/New_York", "gms", null],
    // GMS only from a clearly GMS-market English with no server zone.
    [["en-US"], "America/New_York", "msea", "gms"],
    [["en-GB"], "Europe/London", "kms", "gms"],
    [["en-AU"], undefined, "jms", "gms"],
    [["en-US"], "Asia/Singapore", "msea", null],
    // Nothing to go on: a bare or other English, other languages, other zones.
    [["en"], "America/Chicago", "msea", null],
    [["en-IN"], "Asia/Kolkata", "kms", null],
    [["de-DE", "fr"], "Europe/Berlin", "gms", null],
    [["es-MX"], "America/Mexico_City", "msea", null],
    [[], undefined, "kms", null],
    [["not a tag!"], "Nowhere/Else", "gms", null],
    // Languages outside the servers' are skipped for the next one; a bare "en" stops there.
    [["de-DE", "ko"], "Europe/Berlin", "gms", "kms"],
    [["en", "ko"], "America/Toronto", "gms", null],
    [["pt-BR", "ja"], undefined, "gms", "jms"],
    // A server's language outranks the zone.
    [["ja-JP"], "Asia/Seoul", "gms", "jms"],
  ];

  it.each(cases)("%j in %s on %s → %s", (languages, zone, current, expected) => {
    expect(suggestedEdition(languages, zone, current)).toBe(expected);
  });
});

describe("the remembered answer", () => {
  afterEach(() => vi.restoreAllMocks());

  it("stores the edition that was dismissed or taken", () => {
    expect(readAnswered()).toBeNull();
    rememberAnswered("kms");
    expect(window.localStorage.getItem(SUGGESTION_KEY)).toBe("kms");
    expect(readAnswered()).toBe("kms");
  });

  it("never throws when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => rememberAnswered("jms")).not.toThrow();
    expect(readAnswered()).toBeNull();
  });
});
