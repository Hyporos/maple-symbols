import { useMemo } from "react";
import { isValid } from "../lib/utils";
import type { SymbolData, SymbolType } from "../lib/types";
import { ARCANE_BASE_POWER, inFamily, POWER_PER_LEVEL } from "../lib/game";

// Calculate the current power of a family (Arcane, Sacred, or Grand Sacred, which also
// counts toward Sacred: inFamily, spec §1).
export function usePower(symbols: Array<Pick<SymbolData, "type" | "level">>, type: SymbolType) {
  return useMemo(() => {
    let tempCurrentPower = 0;

    for (const symbol of symbols) {
      if (!isValid(symbol.level) || !inFamily(symbol.type, type)) continue;
      tempCurrentPower +=
        symbol.level * POWER_PER_LEVEL + (symbol.type === "arcane" ? ARCANE_BASE_POWER : 0);
    }

    return tempCurrentPower;
  }, [symbols, type]);
}
