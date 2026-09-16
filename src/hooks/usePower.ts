import { useMemo } from "react";
import { isValid } from "../lib/utils";
import type { SymbolData } from "../lib/types";
import { ARCANE_BASE_POWER, POWER_PER_LEVEL } from "../lib/game";

// Calculate the current arcane/sacred power of the character
export function usePower(symbols: Array<Pick<SymbolData, "type" | "level">>, swapped: boolean) {
  return useMemo(() => {
    let tempCurrentPower = 0;

    for (const symbol of symbols) {
      if (!isValid(symbol.level)) continue;

      if (!swapped ? symbol.type === "arcane" : symbol.type === "sacred") {
        tempCurrentPower += symbol.level * POWER_PER_LEVEL + (!swapped ? ARCANE_BASE_POWER : 0);
      }
    }

    return tempCurrentPower;
  }, [symbols, swapped]);
}
