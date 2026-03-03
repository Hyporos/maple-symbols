import { useMemo } from "react";
import { isValid } from "../lib/utils";

interface Symbols {
  type: string;
  level: number;
}

// Calculate the current arcane/sacred power of the character
export function usePower(symbols: Array<Symbols>, swapped: boolean) {
  return useMemo(() => {
    let tempCurrentPower = 0;

    for (const symbol of symbols) {
      if (!isValid(symbol.level)) continue;

      if (!swapped ? symbol.type === "arcane" : symbol.type === "sacred") {
        tempCurrentPower += !swapped
          ? symbol.level * 10 + 20
          : symbol.level * 10;
      }
    }

    return tempCurrentPower;
  }, [symbols, swapped]);
}
