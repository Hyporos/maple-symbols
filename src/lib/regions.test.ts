import { describe, expect, it } from "vitest";
import { dayjs } from "./dayjs";
import { createInitialSymbols } from "./data";
import {
  DEFAULT_REGION,
  gameToday,
  localResetTime,
  REGION_PROFILES,
  REGIONS,
  weeklySymbolsFor,
  type DataKind,
} from "./regions";
import { calculateDaysRemaining } from "./utils";

const KINDS: DataKind[] = [
  "dailySymbols",
  "weekly",
  "mesosArcane",
  "mesosSacred",
  "resetDay",
  "resetHour",
  "classGains",
];
const STATUSES = ["confirmed", "sourced", "inferred", "unpublished"];

/** An instant, given in UTC, as the dayjs a browser anywhere would hold. */
const at = (iso: string) => dayjs(new Date(iso));
const gameDate = (region: (typeof REGIONS)[number], iso: string) =>
  gameToday(region, at(iso)).format("YYYY-MM-DD");

describe("region profiles (regions.json)", () => {
  it("covers every server, GMS first, with a status for every kind of number", () => {
    expect(Object.keys(REGION_PROFILES)).toEqual([...REGIONS]);
    expect(DEFAULT_REGION).toBe("gms");
    for (const region of REGIONS) {
      const { status } = REGION_PROFILES[region];
      expect(Object.keys(status).sort()).toEqual([...KINDS].sort());
      for (const kind of KINDS) expect(STATUSES).toContain(status[kind]);
    }
  });

  it("pays 240 a week everywhere, as one clear of 240 in KMS and three of 80 elsewhere", () => {
    for (const region of REGIONS) {
      expect(weeklySymbolsFor(region)).toBe(240);
      expect(REGION_PROFILES[region].weeklyResetDay).toBe(4);
    }
    expect(REGION_PROFILES.kms.weekly).toEqual({ perClear: 240, clears: 1 });
    expect(REGION_PROFILES.gms.weekly).toEqual({ perClear: 80, clears: 3 });
  });

  it("uses the reset offsets of each server's time zone", () => {
    const offsets = Object.fromEntries(
      REGIONS.map((r) => [r, REGION_PROFILES[r].resetUtcOffsetHours])
    );
    expect(offsets).toEqual({ gms: 0, msea: 8, kms: 9, jms: 9, tms: 8, cms: 8 });
  });

  it("only KMS has raised Xenon's gains (1.2.419); Demon Avenger is the same everywhere", () => {
    for (const region of REGIONS) {
      const { demonAvengerHp, xenonAllStat } = REGION_PROFILES[region].classGains;
      expect(demonAvengerHp).toEqual({ arcane: 2100, sacred: 4200 });
      expect(xenonAllStat).toEqual(
        region === "kms" ? { arcane: 66, sacred: 132 } : { arcane: 48, sacred: 96 }
      );
    }
  });

  it("marks the meso tables nobody has published as unpublished", () => {
    for (const region of ["jms", "cms"] as const) {
      expect(REGION_PROFILES[region].status.mesosArcane).toBe("unpublished");
      expect(REGION_PROFILES[region].status.mesosSacred).toBe("unpublished");
    }
  });
});

describe("createInitialSymbols(region)", () => {
  const gms = createInitialSymbols("gms");

  it("defaults to GMS, and GMS has no overrides", () => {
    expect(createInitialSymbols()).toEqual(gms);
    expect(REGION_PROFILES.gms.symbols).toEqual({});
  });

  it("gives KMS the arcane costs after its 30 % cut, rounded down to 10,000", () => {
    const kms = createInitialSymbols("kms");
    for (const symbol of kms) {
      const base = gms.find((s) => s.id === symbol.id)!;
      if (symbol.type === "sacred") {
        expect(symbol.mesosRequired).toEqual(base.mesosRequired);
        continue;
      }
      expect(symbol.mesosRequired).toHaveLength(base.mesosRequired.length);
      // In integers: 0.7 × 2,800,000 is 1,959,999.99… in floating point.
      symbol.mesosRequired.forEach((cost, level) => {
        const units = base.mesosRequired[level] / 10000;
        expect(cost).toBe(Math.floor((7 * units) / 10) * 10000);
      });
    }
    // Nexon's own screenshot: Vanishing Journey 1 → 2 costs 670,000; all six total 1,622,560,000.
    expect(kms[0].mesosRequired[1]).toBe(670000);
    const arcaneTotal = kms
      .filter((s) => s.type === "arcane")
      .reduce((sum, s) => sum + s.mesosRequired.reduce((a, b) => a + b, 0), 0);
    expect(arcaneTotal).toBe(1_622_560_000);
  });

  it("keeps every other field of the base symbol", () => {
    const kms = createInitialSymbols("kms");
    kms.forEach((symbol, i) => {
      const { mesosRequired: _a, ...rest } = symbol;
      const { mesosRequired: _b, ...base } = gms[i];
      expect(rest).toEqual(base);
    });
  });
});

describe("gameToday: the server's reset clock (KI-013)", () => {
  it("turns the GMS day over at 00:00 UTC, whatever the visitor's zone", () => {
    expect(gameDate("gms", "2026-09-23T23:59:00Z")).toBe("2026-09-23");
    expect(gameDate("gms", "2026-09-24T00:00:00Z")).toBe("2026-09-24");
  });

  it("turns KMS and JMS over at 15:00 UTC, and MSEA, TMS and CMS at 16:00 UTC", () => {
    for (const region of ["kms", "jms"] as const) {
      expect(gameDate(region, "2026-09-23T14:59:00Z")).toBe("2026-09-23");
      expect(gameDate(region, "2026-09-23T15:00:00Z")).toBe("2026-09-24");
    }
    for (const region of ["msea", "tms", "cms"] as const) {
      expect(gameDate(region, "2026-09-23T15:59:00Z")).toBe("2026-09-23");
      expect(gameDate(region, "2026-09-23T16:00:00Z")).toBe("2026-09-24");
    }
  });

  it("counts a weekly-only wait from the game day, not the visitor's calendar", () => {
    // Wednesday 21:00 in New York is 01:00 UTC on Thursday: GMS has already reset, so the
    // next weekly is a week away. Counting the local Wednesday said 1 day (KI-013).
    const newYorkWednesdayEvening = at("2026-09-24T01:00:00Z");
    const today = gameToday("gms", newYorkWednesdayEvening);
    expect(today.day()).toBe(4);
    expect(calculateDaysRemaining(240, 0, true, today)).toBe(7);
    // An hour before the reset it is still Wednesday in the game: one day to go.
    expect(calculateDaysRemaining(240, 0, true, gameToday("gms", at("2026-09-23T23:00:00Z")))).toBe(
      1
    );
  });

  it("credits a KMS weekly on the Korean Thursday", () => {
    // 15:30 UTC on Wednesday is already 00:30 Thursday in Seoul.
    const kmsToday = gameToday("kms", at("2026-09-23T15:30:00Z"));
    expect(kmsToday.format("YYYY-MM-DD")).toBe("2026-09-24");
    expect(calculateDaysRemaining(240, 0, true, kmsToday, "kms")).toBe(7);
  });
});

describe("localResetTime (REGIONS D-8)", () => {
  // Intl may put a narrow no-break space before AM/PM; compare with plain spaces.
  const reset = (offset: number, zone: string | undefined, locale: string, iso: string) =>
    localResetTime(offset, zone, locale, new Date(iso))?.replace(/\s/g, " ") ?? null;

  it("shows the GMS reset (00:00 UTC) on the visitor's clock, daylight saving included", () => {
    expect(reset(0, "America/New_York", "en", "2026-09-23T12:00:00Z")).toBe("8:00 PM");
    expect(reset(0, "America/New_York", "en", "2026-12-02T12:00:00Z")).toBe("7:00 PM");
    expect(reset(0, "America/Los_Angeles", "en", "2026-09-23T12:00:00Z")).toBe("5:00 PM");
    expect(reset(0, "Asia/Kolkata", "en", "2026-09-23T12:00:00Z")).toBe("5:30 AM");
  });

  it("takes the next reset, so the day it falls on is the right side of a clock change", () => {
    // New York leaves daylight saving on 2026-11-01 at 06:00 UTC. At 23:00 UTC on 31 October
    // the next GMS reset is 00:00 UTC on 1 November, still 8:00 PM EDT; an hour later it is
    // the reset of 2 November, 7:00 PM EST.
    expect(reset(0, "America/New_York", "en", "2026-10-31T23:00:00Z")).toBe("8:00 PM");
    expect(reset(0, "America/New_York", "en", "2026-11-01T00:30:00Z")).toBe("7:00 PM");
  });

  it("shows the Asian servers' resets too", () => {
    expect(reset(9, "America/New_York", "en", "2026-09-23T12:00:00Z")).toBe("11:00 AM"); // KMS
    expect(reset(8, "Europe/London", "en", "2026-09-23T12:00:00Z")).toBe("5:00 PM"); // MSEA
    expect(reset(8, "Asia/Seoul", "en", "2026-09-23T12:00:00Z")).toBe("1:00 AM"); // TMS
  });

  it("writes the time in the page's language", () => {
    expect(reset(0, "Asia/Seoul", "ko", "2026-09-23T12:00:00Z")).toBe("오전 9:00");
    expect(reset(0, "Asia/Tokyo", "ja", "2026-09-23T12:00:00Z")).toBe("9:00");
  });

  it("says nothing when the visitor's day turns over with the game's, or the zone is unknown", () => {
    expect(reset(0, "UTC", "en", "2026-09-23T12:00:00Z")).toBeNull();
    expect(reset(0, "Europe/London", "en", "2026-12-02T12:00:00Z")).toBeNull(); // GMT
    expect(reset(0, "Europe/London", "en", "2026-09-23T12:00:00Z")).toBe("1:00 AM"); // BST
    expect(reset(9, "Asia/Seoul", "en", "2026-09-23T12:00:00Z")).toBeNull();
    expect(reset(9, "Asia/Tokyo", "en", "2026-09-23T12:00:00Z")).toBeNull();
    expect(reset(8, "Asia/Singapore", "en", "2026-09-23T12:00:00Z")).toBeNull();
    expect(reset(0, undefined, "en", "2026-09-23T12:00:00Z")).toBeNull();
    expect(reset(0, "Not/AZone", "en", "2026-09-23T12:00:00Z")).toBeNull();
  });
});
