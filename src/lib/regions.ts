// ---------------------------------------------------------------------------
// regions.ts — The six MapleStory servers the site will serve (docs/REGIONS.md).
//
// Every server shares the GMS base in symbols.json; regions.json holds what
// differs per server (reset clock, weekly structure, class stat gains, per-symbol
// overrides) and how far each kind of number can be trusted. GAME §5 and
// docs/data-check/ are the evidence; update them and regions.json together.
// ---------------------------------------------------------------------------

import type { Dayjs } from "dayjs";
import { dayjs } from "./dayjs";
import regionsJson from "./regions.json";
import type { SymbolType } from "./types";

/** The servers, GMS first. Their order is the order a server picker lists them in. */
export const REGIONS = ["gms", "msea", "kms", "jms", "tms", "cms"] as const;
export type Region = (typeof REGIONS)[number];

/** The server every page uses until the site has per-server editions (REGIONS §8). */
export const DEFAULT_REGION: Region = "gms";

/**
 * How far a kind of number can be trusted on a server (REGIONS D-6):
 * confirmed in game, sourced from a dated source, inferred without one, or
 * unpublished (nobody has published it; the site hides it).
 */
export type DataStatus = "confirmed" | "sourced" | "inferred" | "unpublished";

/** The kinds of number whose trust differs by server. */
export type DataKind =
  | "dailySymbols"
  | "weekly"
  | "mesosArcane"
  | "mesosSacred"
  | "resetDay"
  | "resetHour"
  | "classGains";

/** Fields a server may override on a symbol, keyed by symbol id in `symbols`. */
export interface SymbolOverride {
  dailySymbols?: number;
  mesosRequired?: number[];
}

export interface RegionProfile {
  /** The server's reset time zone as a whole-hour UTC offset; no server observes DST. */
  resetUtcOffsetHours: number;
  /** dayjs weekday index of the weekly reset (0 is Sunday). Thursday on every server. */
  weeklyResetDay: number;
  /** The weekly as the game pays it; the calculator credits the total in one go (GAME §2). */
  weekly: { perClear: number; clears: number };
  /** Per-level gains shown in the next-level tooltip for the two classes without main stat. */
  classGains: {
    demonAvengerHp: Record<SymbolType, number>;
    xenonAllStat: Record<SymbolType, number>;
  };
  status: Record<DataKind, DataStatus>;
  /** Where the numbers come from, in one line; the detail is in GAME §7. */
  sources: string;
  symbols: Partial<Record<string, SymbolOverride>>;
}

export const REGION_PROFILES: Readonly<Record<Region, RegionProfile>> = regionsJson as Record<
  Region,
  RegionProfile
>;

/**
 * Whether a server's number of this kind may be shown: everything except "unpublished"
 * (REGIONS D-6; inferred numbers are shown, Brian 2026-09-22).
 */
export const isPublished = (region: Region, kind: DataKind): boolean =>
  REGION_PROFILES[region].status[kind] !== "unpublished";

/** The status kind that covers a symbol type's meso costs. */
export const mesosKind = (type: SymbolType): DataKind =>
  type === "arcane" ? "mesosArcane" : "mesosSacred";

/** Symbols one week of weekly content pays on a server (240 everywhere today). */
export const weeklySymbolsFor = (region: Region): number => {
  const { perClear, clears } = REGION_PROFILES[region].weekly;
  return perClear * clears;
};

/**
 * Today's date on the server's reset clock, as a local-midnight dayjs, so day
 * arithmetic, `.day()` and `format("YYYY-MM-DD")` all read in game days. The game
 * day turns over at 00:00 in the server's zone (00:00 UTC for GMS), wherever the
 * visitor is: this is what fixed KI-013, where a player far from UTC counted from
 * their own calendar and could be a day off.
 */
export function gameToday(region: Region = DEFAULT_REGION, now: Dayjs = dayjs()): Dayjs {
  const shifted = new Date(now.valueOf() + REGION_PROFILES[region].resetUtcOffsetHours * 3_600_000);
  return dayjs(new Date(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
}

/**
 * The server's daily reset as the visitor's clock reads it, for the hint beside a day count
 * (REGIONS D-8): "8:00 PM" for the GMS reset (00:00 UTC) in New York in summer, "11:00 AM"
 * for KMS (00:00 KST) there. Takes the *next* reset after `now`, so a daylight-saving change
 * in the visitor's zone reads right. Null when the reset is midnight on the visitor's clock
 * too (nothing worth saying: their day and the game's turn over together) or when the zone
 * is unknown or unreadable. `locale` is the page's, never the browser's (I18N-12). Called
 * after mount only: the visitor's zone is not known when the page is prerendered.
 */
export function localResetTime(
  offsetHours: number,
  timeZone: string | undefined,
  locale: string,
  now: Date = new Date()
): string | null {
  if (!timeZone) return null;
  const offset = offsetHours * 3_600_000;
  const shifted = new Date(now.valueOf() + offset);
  const reset = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() + 1) - offset
  );
  try {
    const clock = new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    }).format(reset);
    if (clock === "00:00") return null;
    return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone }).format(
      reset
    );
  } catch {
    return null; // an unknown zone name
  }
}
