import { useMemo } from "react";
import { isValid } from "../lib/utils";
import type { SymbolData, SymbolType } from "../lib/types";
import { ARCANE_BASE_POWER, POWER_PER_LEVEL } from "../lib/game";

// Calculate the current arcane/sacred power of the character for one symbol type
export function usePower(symbols: Array<Pick<SymbolData, "type" | "level">>, type: SymbolType) {
  return useMemo(() => {
    let tempCurrentPower = 0;

    for (const symbol of symbols) {
      if (!isValid(symbol.level) || symbol.type !== type) continue;
      tempCurrentPower +=
        symbol.level * POWER_PER_LEVEL + (type === "arcane" ? ARCANE_BASE_POWER : 0);
    }

    return tempCurrentPower;
  }, [symbols, type]);
}
