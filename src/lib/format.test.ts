import { describe, expect, it } from "vitest";
import { formatDate, formatDay, formatMesos, formatNumber, plural } from "./format";
import { createInitialSymbols } from "./data";
import { DEFAULT_LOCALE } from "./routes";
import { dayjs } from "./dayjs";

describe("formatNumber", () => {
  it("groups with the app locale, not the browser's", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
    // The whole point of B-4: a German browser must not change an English UI.
    expect(formatNumber(1234567, "de")).toBe("1.234.567");
  });

  it("matches what the bare toLocaleString() calls produced for en", () => {
    for (const n of [0, 5, 999, 1000, 26550, 2679, 4565, 1_000_000]) {
      expect(formatNumber(n)).toBe(n.toLocaleString("en"));
    }
  });

  it("renders an absent value as an empty string, not 'undefined'", () => {
    // Calculator reads mesosRequired[level], which is undefined past the table.
    expect(formatNumber(undefined)).toBe("");
  });
});

describe("formatMesos", () => {
  it("is formatNumber in English, for every cost in the tables", () => {
    expect(formatMesos(3_930_100_000)).toBe("3,930,100,000");
    expect(formatMesos(3_930_100_000, "en")).toBe("3,930,100,000");
    for (const symbol of createInitialSymbols()) {
      for (const cost of symbol.mesosRequired) expect(formatMesos(cost)).toBe(formatNumber(cost));
    }
  });

  it("falls back to formatNumber for locales without a unit system", () => {
    expect(formatMesos(3_930_100_000, "de")).toBe("3.930.100.000");
    expect(formatMesos(3_930_100_000, "en-SG")).toBe("3,930,100,000");
  });

  it("uses 억 and 만 in Korean, grouped inside, spaced between, zero groups left out", () => {
    expect(formatMesos(3_930_100_000, "ko")).toBe("39억 3,010만");
    expect(formatMesos(100_000_000, "ko")).toBe("1억");
    expect(formatMesos(12_345, "ko")).toBe("1만 2,345");
    expect(formatMesos(9_999, "ko")).toBe("9,999");
    expect(formatMesos(100_000_005, "ko")).toBe("1억 5");
    expect(formatMesos(123_456_789_012, "ko")).toBe("1,234억 5,678만 9,012");
  });

  it("uses bare digits run together in Japanese and both Chinese scripts", () => {
    expect(formatMesos(3_930_100_000, "ja")).toBe("39億3010万");
    expect(formatMesos(12_345, "ja")).toBe("1万2345");
    expect(formatMesos(9_999, "ja")).toBe("9999");
    expect(formatMesos(3_930_100_000, "zh-Hant")).toBe("39億3010萬");
    expect(formatMesos(3_930_100_000, "zh-Hans")).toBe("39亿3010万");
    expect(formatMesos(100_000_000, "zh-Hans")).toBe("1亿");
  });

  it("adds 조 / 兆 at 10^12, except in Simplified Chinese, where 亿 keeps growing", () => {
    expect(formatMesos(1_234_500_000_000, "ko")).toBe("1조 2,345억");
    expect(formatMesos(1_000_000_000_000, "ja")).toBe("1兆");
    expect(formatMesos(1_000_000_000_000, "zh-Hant")).toBe("1兆");
    expect(formatMesos(1_234_500_000_000, "zh-Hans")).toBe("12345亿");
  });

  it("resolves tags with a region by language and script", () => {
    expect(formatMesos(3_930_100_000, "ko-KR")).toBe("39억 3,010만");
    expect(formatMesos(3_930_100_000, "ja-JP")).toBe("39億3010万");
    expect(formatMesos(3_930_100_000, "zh-Hant-TW")).toBe("39億3010萬");
    expect(formatMesos(3_930_100_000, "zh-TW")).toBe("39億3010萬");
    expect(formatMesos(3_930_100_000, "zh-CN")).toBe("39亿3010万");
    expect(formatMesos(3_930_100_000, "zh")).toBe("39亿3010万");
  });

  it("writes zero as 0 and rounds a stray fraction to whole mesos", () => {
    expect(formatMesos(0, "ko")).toBe("0");
    expect(formatMesos(0, "ja")).toBe("0");
    expect(formatMesos(12_345.4, "ja")).toBe("1万2345");
  });

  it("renders unset or off-table amounts as an empty string", () => {
    for (const locale of ["en", "ko", "ja", "zh-Hant", "zh-Hans"]) {
      expect(formatMesos(undefined, locale)).toBe("");
      expect(formatMesos(NaN, locale)).toBe("");
      expect(formatMesos(Infinity, locale)).toBe("");
      expect(formatMesos(-Infinity, locale)).toBe("");
    }
  });
});

describe("plural", () => {
  it("picks 'one' only for exactly 1 in English", () => {
    expect(plural(1, "day", "days")).toBe("day");
    expect(plural(2, "day", "days")).toBe("days");
    expect(plural(261, "day", "days")).toBe("days");
  });

  it("fixes the cases `n > 1` got wrong: 0, fractions and non-finite counts", () => {
    expect(plural(0, "day", "days")).toBe("days");
    expect(plural(0.5, "day", "days")).toBe("days");
    expect(plural(Infinity, "day", "days")).toBe("days");
    expect(plural(NaN, "day", "days")).toBe("days");
  });

  it("gives the CJK locales a single form", () => {
    for (const count of [0, 1, 2, 261]) {
      expect(plural(count, "day", "days", "ko")).toBe("days");
      expect(plural(count, "day", "days", "ja")).toBe("days");
      expect(plural(count, "day", "days", "zh-Hans")).toBe("days");
    }
  });
});

describe("formatDate", () => {
  it("renders an ISO day in the changelog's display form", () => {
    expect(formatDate("2023-07-25")).toBe("Jul 25, 2023");
    expect(formatDate("2024-03-01")).toBe("Mar 1, 2024");
  });

  it("reads the ISO day as a local calendar day, so it cannot shift in any time zone", () => {
    // new Date("2023-01-01") is UTC midnight: Dec 31, 2022 anywhere in the Americas.
    // The day boundaries are where that trap would show.
    expect(formatDate("2023-01-01")).toBe("Jan 1, 2023");
    expect(formatDate("2022-12-31")).toBe("Dec 31, 2022");
    const parsed = dayjs("2023-01-01");
    expect([parsed.year(), parsed.month(), parsed.date(), parsed.hour()]).toEqual([2023, 0, 1, 0]);
  });
});

describe("DEFAULT_LOCALE", () => {
  it("is the English tag every formatter falls back to", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });
});

describe("formatDay", () => {
  it("keeps the ISO day in English and any language without its own form", () => {
    expect(formatDay("2027-01-28")).toBe("2027-01-28");
    expect(formatDay("2027-01-28", "en")).toBe("2027-01-28");
    expect(formatDay("2027-01-28", "de")).toBe("2027-01-28");
  });

  it("writes the day the Korean, Japanese and Chinese way, with the weekday", () => {
    expect(formatDay("2027-01-28", "ko")).toBe("2027. 1. 28. (목)");
    expect(formatDay("2027-01-28", "ja")).toBe("2027/1/28(木)");
    expect(formatDay("2027-01-28", "zh-Hant")).toBe("2027/1/28（週四）");
    expect(formatDay("2027-01-28", "zh-Hans")).toBe("2027/1/28周四");
    expect(formatDay("2027-01-28", "zh-TW")).toBe("2027/1/28（週四）");
  });

  it("never shifts the day, whatever the visitor's zone (the day is already the game day)", () => {
    // 2027-01-01 is a Friday; formatted in UTC it cannot slip to the 31st.
    expect(formatDay("2027-01-01", "ko")).toBe("2027. 1. 1. (금)");
  });

  it("passes anything that is not an ISO day through unchanged", () => {
    expect(formatDay("Invalid Date", "ko")).toBe("Invalid Date");
    expect(formatDay("", "ja")).toBe("");
  });
});
