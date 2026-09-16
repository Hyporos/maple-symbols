// ---------------------------------------------------------------------------
// calculator.ts — Pure maths behind the Calculator card.
// ---------------------------------------------------------------------------

import type { SymbolData } from "./types";
import { getRemainingSymbols } from "./utils";

/** Symbols still needed to reach `maxLevel` (the store's `symbolsRemaining`). */
export function getRemainingToMax(symbol: SymbolData, maxLevel: number): number {
  return getRemainingSymbols(maxLevel, symbol);
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
