// ---------------------------------------------------------------------------
// familyMaxPower.ts — The most power a family can reach: every symbol of it at max level.
//
// The /next picker's "Arcane Power: x / max" and the Graph's "x / max" both read it, so the two
// always agree (Brian, 2026-09-23: the max is the whole family, set or not). Grand Sacred counts
// inside Sacred, like usePower. The current UI's Graph keeps its own set-symbols-only maximum.
// ---------------------------------------------------------------------------

import { inFamily, MAX_POWER_PER_SYMBOL } from "../../lib/game";
import type { Mode, SymbolData } from "../../lib/types";

/** The sum of every `family` symbol's max-level power (Grand Sacred inside Sacred). */
export function familyMaxPower(symbols: readonly SymbolData[], family: Mode): number {
  return symbols
    .filter((symbol) => inFamily(symbol.type, family))
    .reduce((sum, symbol) => sum + MAX_POWER_PER_SYMBOL[symbol.type], 0);
}
