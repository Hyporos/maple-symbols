// ---------------------------------------------------------------------------
// calculator.ts — Pure maths behind the Calculator card.
// ---------------------------------------------------------------------------

import type { Dayjs } from "dayjs";
import { dayjs } from "./dayjs";
import { maxLevelFor } from "./game";
import type { SymbolData } from "./types";
import { calculateDaysRemaining, getDailySymbols, getRemainingSymbols } from "./utils";

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
export function progressToMax(symbol: SymbolData, now: Dayjs = dayjs()): Progress {
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
 * Bounded by the table, so it cannot exceed max; leftover is kept even at max (KI-005).
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
  return { level: symbol.level + levels, experience: symbol.experience - consumed };
}
