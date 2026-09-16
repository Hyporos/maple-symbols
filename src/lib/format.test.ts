import { describe, expect, it } from "vitest";
import { formatDate, formatNumber, plural } from "./format";
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
