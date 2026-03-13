// ---------------------------------------------------------------------------
// utils.ts — Shared utility functions.
// ---------------------------------------------------------------------------

import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { dayjs } from "./dayjs";
import type { SymbolData } from "./types";

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

/** Returns true when the symbol is at its maximum level for the current mode. */
export function isMaxLevel(level: number, swapped: boolean): boolean {
  return level === (swapped ? 11 : 20);
}

// ---------------------------------------------------------------------------
// Symbol state helpers
// ---------------------------------------------------------------------------

/**
 * Immutably updates a single symbol in the array by array index.
 *
 * Replaces the common pattern:
 *   symbols.map((s) => s.id === selectedSymbol + 1 ? { ...s, ...patch } : s)
 */
export function updateSymbol(
  symbols: SymbolData[],
  index: number,
  patch: Partial<SymbolData>
): SymbolData[] {
  return symbols.map((s, i) => (i === index ? { ...s, ...patch } : s));
}

// ---------------------------------------------------------------------------
// Daily symbol count
// ---------------------------------------------------------------------------

/**
 * Returns the effective daily symbol count for a symbol, accounting for the
 * extra-quest multiplier:
 *   - Arcane symbols with extra: ×2
 *   - Sacred symbols with extra: ×1.5
 *   - No daily quest enabled:   0
 */
export function getDailySymbols(symbol: SymbolData): number {
  if (!symbol.daily) return 0;

  const extraMultiplier = symbol.extra ? (symbol.type === "arcane" ? 2 : 1.5) : 1;

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
 * Mutable state snapshot used by the day-counting algorithm.
 * Exporting this lets Graph.tsx call advanceDayCount level-by-level,
 * accumulating state across iterations instead of resetting each time.
 */
export interface DayCountState {
  days: number;
  countToMonday: number;
  weeklyResets: number;
  mondayReached: boolean;
}

/** Fresh starting state for a new calculation starting from today. */
export const INITIAL_DAY_COUNT: DayCountState = {
  days: 0,
  countToMonday: 0,
  weeklyResets: 0,
  mondayReached: false,
};

/**
 * Advances an existing DayCountState until the cumulative symbol total
 * reaches `symbolsNeeded` (absolute, not relative to the current state).
 *
 * This design lets Graph.tsx thread a single state across level iterations:
 * each call passes the cumulative symbols needed since today (from
 * getRemainingSymbols), and the shared Monday/weekly tracking carries over.
 *
 * For a fresh calculation, start with INITIAL_DAY_COUNT (days=0, etc.),
 * which makes `symbolsNeeded` behave as a simple absolute target.
 *
 * @returns A new state object with updated `days`, `countToMonday`,
 *          `weeklyResets`, and `mondayReached`.
 */
export function advanceDayCount(
  state: DayCountState,
  symbolsNeeded: number,
  dailySymbols: number,
  hasWeekly: boolean
): DayCountState {
  if (isNaN(symbolsNeeded)) return { ...state, days: NaN };
  if (symbolsNeeded <= 0) return state;
  if (dailySymbols === 0 && !hasWeekly) return { ...state, days: Infinity };

  let { days, countToMonday, weeklyResets, mondayReached } = state;
  // `symbolsNeeded` is the absolute cumulative target from today.
  const target = symbolsNeeded;

  // Safety cap: 1000 iterations covers ~2.7 years of daily progress.
  for (let i = 0; i < 1000; i++) {
    if (days * dailySymbols + (hasWeekly ? weeklyResets * 120 : 0) >= target) break;

    if (!mondayReached && dayjs().add(countToMonday, "day").isBefore(dayjs().day(8))) {
      countToMonday++;
      if (dayjs().add(countToMonday, "day").isSame(dayjs().day(8))) {
        mondayReached = true;
      }
    } else if ((days - countToMonday) % 7 === 0) {
      weeklyResets++;
    }

    days++;
  }

  return { days, countToMonday, weeklyResets, mondayReached };
}

/**
 * Calculates the number of days required to accumulate `symbolsNeeded`
 * symbols, given a daily rate and an optional weekly reset (+120 symbols).
 *
 * The function accounts for the fact that the first upcoming Monday resets
 * weekly quests before settling into the regular 7-day cadence.
 *
 * Returns 0 when no symbols are needed, and Infinity when no daily progress
 * is possible (dailySymbols === 0 and no weekly enabled).
 */
export function calculateDaysRemaining(
  symbolsNeeded: number,
  dailySymbols: number,
  hasWeekly: boolean
): number {
  return advanceDayCount(INITIAL_DAY_COUNT, symbolsNeeded, dailySymbols, hasWeekly).days;
}
