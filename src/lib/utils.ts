// ---------------------------------------------------------------------------
// utils.ts — Shared utility functions.
// ---------------------------------------------------------------------------

import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import type { Dayjs } from "dayjs";
import type { SymbolData, SymbolType } from "./types";
import { EXTRA_MULTIPLIER, maxLevelFor } from "./game";
import {
  DEFAULT_REGION,
  gameToday,
  REGION_PROFILES,
  weeklySymbolsFor,
  type Region,
} from "./regions";

// ---------------------------------------------------------------------------
// Tailwind class merging helper
// ---------------------------------------------------------------------------

/** Merge Tailwind classes safely, resolving conflicts via tailwind-merge. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/** Returns true when value is a real, non-NaN number. */
export function isValid(value: number): boolean {
  return !isNaN(value);
}

/** Returns true when the level is the maximum for that symbol type. */
export function isMaxLevel(level: number, type: SymbolType): boolean {
  return level === maxLevelFor(type);
}

// ---------------------------------------------------------------------------
// Symbol state helpers
// ---------------------------------------------------------------------------

/** Immutably updates the symbol with the given id. */
export function updateSymbol(
  symbols: SymbolData[],
  id: number,
  patch: Partial<SymbolData>
): SymbolData[] {
  return symbols.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

// ---------------------------------------------------------------------------
// Daily symbol count
// ---------------------------------------------------------------------------

/**
 * Returns the effective daily symbol count for a symbol, accounting for the
 * extra-quest multiplier:
 *   - Arcane symbols with extra: ×2
 *   - Sacred symbols with extra: ×1.5
 *   - Grand Sacred symbols:      no extra quest, so ×1
 *   - No daily quest enabled:   0
 */
export function getDailySymbols(symbol: SymbolData): number {
  if (!symbol.daily) return 0;

  const extraMultiplier = symbol.extra ? (EXTRA_MULTIPLIER[symbol.type] ?? 1) : 1;

  return symbol.dailySymbols * extraMultiplier;
}

// ---------------------------------------------------------------------------
// Remaining symbols calculation
// ---------------------------------------------------------------------------

/**
 * Returns the total number of symbols still needed to reach `nextLevel` from
 * the symbol's current level and experience.
 */
export function getRemainingSymbols(nextLevel: number, symbol: SymbolData): number {
  return (
    symbol.symbolsRequired.slice(symbol.level, nextLevel).reduce((acc, req) => acc + req, 0) -
    symbol.experience
  );
}

// ---------------------------------------------------------------------------
// Day-counting algorithm (previously duplicated 4× across components)
// ---------------------------------------------------------------------------

/**
 * Progress of the day-counting walk. Exported so Graph can thread one walk across a
 * symbol's levels instead of restarting it per level.
 */
export interface DayCountState {
  /** Days counted forward from `now`. */
  days: number;
  /** Symbols credited over those days. */
  credited: number;
}

/** Fresh starting state for a walk that begins today. */
export const INITIAL_DAY_COUNT: DayCountState = { days: 0, credited: 0 };

/**
 * Advances an existing DayCountState until `credited` reaches `symbolsNeeded`, which is
 * an absolute cumulative target rather than a delta. Graph relies on that: it passes the
 * running total from `getRemainingSymbols` for each level and threads the state through.
 *
 * The walk starts tomorrow, because the Calculator's tooltip promises the estimate assumes
 * today's quests are already done. Each counted day pays the daily rate, and a counted
 * weekly reset day (Thursday on every server) also pays the server's weekly.
 *
 * `now` is a day on the server's reset clock, `gameToday(region)`, not the visitor's
 * calendar (KI-013, resolved): counting local days put the reset a day off for players
 * far from the server's time zone.
 *
 * KI-003 was the previous version: it located "next Monday" with `dayjs().day(8)`, which is
 * Monday of the *following* week in dayjs's Sunday-start weeks, and credited the reset one
 * iteration late. A single weekly took 9 days from a Sunday (skipping tomorrow's Monday
 * entirely) and 6 from a Wednesday; it now takes 1 and 5.
 *
 * @returns A new state object; the input is never mutated.
 */
export function advanceDayCount(
  state: DayCountState,
  symbolsNeeded: number,
  dailySymbols: number,
  hasWeekly: boolean,
  now: Dayjs = gameToday(),
  region: Region = DEFAULT_REGION
): DayCountState {
  if (isNaN(symbolsNeeded)) return { ...state, days: NaN };
  if (symbolsNeeded <= 0) return state;
  if (dailySymbols === 0 && !hasWeekly) return { ...state, days: Infinity };

  const resetDay = REGION_PROFILES[region].weeklyResetDay;
  const weekly = weeklySymbolsFor(region);
  let { days, credited } = state;

  // Safety cap: 1000 iterations covers ~2.7 years of daily progress.
  for (let i = 0; i < 1000 && credited < symbolsNeeded; i++) {
    days++;
    credited += dailySymbols;
    if (hasWeekly && now.add(days, "day").day() === resetDay) credited += weekly;
  }

  return { days, credited };
}

/**
 * Calculates the number of days required to accumulate `symbolsNeeded`
 * symbols, given a daily rate and an optional weekly reset (the server's weekly).
 *
 * The function accounts for the fact that the first upcoming Thursday resets
 * weekly quests before settling into the regular 7-day cadence. `now` is the
 * server's game day (`gameToday(region)`), as in `advanceDayCount`.
 *
 * Returns 0 when no symbols are needed, and Infinity when no daily progress
 * is possible (dailySymbols === 0 and no weekly enabled).
 */
export function calculateDaysRemaining(
  symbolsNeeded: number,
  dailySymbols: number,
  hasWeekly: boolean,
  now: Dayjs = gameToday(),
  region: Region = DEFAULT_REGION
): number {
  return advanceDayCount(INITIAL_DAY_COUNT, symbolsNeeded, dailySymbols, hasWeekly, now, region)
    .days;
}
