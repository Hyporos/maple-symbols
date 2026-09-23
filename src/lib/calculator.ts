// ---------------------------------------------------------------------------
// calculator.ts — Pure maths behind the Calculator card.
// ---------------------------------------------------------------------------

import type { Dayjs } from "dayjs";
import { gameToday } from "./regions";
import { maxLevelFor } from "./game";
import type { SymbolData } from "./types";
import { calculateDaysRemaining, getDailySymbols, getRemainingSymbols, isMaxLevel } from "./utils";

/** Symbols still needed to reach `maxLevel`. */
export function getRemainingToMax(symbol: SymbolData, maxLevel: number): number {
  return getRemainingSymbols(maxLevel, symbol);
}

export interface Progress {
  /** Symbols still needed to reach max level (negative when experience overflows). */
  symbolsRemaining: number;
  /** Days until max at the current quest rate: 0 when done, Infinity with no quests, NaN when unset. */
  daysRemaining: number;
  /** `now` + `daysRemaining` as YYYY-MM-DD, or "Invalid Date" when days is NaN/Infinity. */
  completion: string;
}

/**
 * Progress towards max level, derived from level/experience/quests at read time.
 * Replaces the fields the store used to cache for the selected symbol only (KI-002).
 */
export function progressToMax(symbol: SymbolData, now: Dayjs = gameToday()): Progress {
  const symbolsRemaining = getRemainingToMax(symbol, maxLevelFor(symbol.type));
  const daysRemaining = calculateDaysRemaining(
    symbolsRemaining,
    getDailySymbols(symbol),
    !!symbol.weekly,
    now
  );
  return {
    symbolsRemaining,
    daysRemaining,
    completion: now.add(daysRemaining, "day").format("YYYY-MM-DD"),
  };
}

/**
 * With the cap unlocked, how many levels the stored experience would buy, and the leftover.
 * Bounded by the table, so it cannot exceed max.
 *
 * At max the leftover is dropped. KI-005 was keeping it: applying overflow from level 19
 * with 2679 experience landed on level 20 holding 2307 more, which no longer buys anything,
 * reads as a negative "symbols remaining", and combined with KI-004 left the field uncapped.
 */
export function getOverflow(symbol: SymbolData): { level: number; experience: number } {
  let levels = 0;
  let consumed = 0;
  symbol.symbolsRequired.forEach((required, index) => {
    if (index >= symbol.level && symbol.experience >= required + consumed) {
      levels++;
      consumed += required;
    }
  });
  const level = symbol.level + levels;
  if (isMaxLevel(level, symbol.type)) return { level, experience: 0 };
  return { level, experience: symbol.experience - consumed };
}
