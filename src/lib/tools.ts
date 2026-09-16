// ---------------------------------------------------------------------------
// tools.ts — Symbol Selector and Catalyst preview maths behind the Tools card.
// ---------------------------------------------------------------------------

import type { SymbolData } from "./types";
import { isValid } from "./utils";

export interface Preview {
  level: number;
  experience: number;
}

/** Level/experience after applying `count` symbols to the symbol. */
export function selectorPreview(symbol: SymbolData, count: number): Preview {
  let levels = 0;
  let consumed = 0;
  symbol.symbolsRequired.forEach((required, index) => {
    if (index >= symbol.level && count >= required - symbol.experience + consumed) {
      levels++;
      consumed += required;
    }
  });
  return {
    level: symbol.level + levels,
    experience: count ? count - consumed + symbol.experience : symbol.experience,
  };
}

/**
 * Level/experience after a catalyst transfer that keeps `retention` (0.8 arcane / 0.6 sacred)
 * of the cumulative experience. Level is re-derived with a strict `>` per step, so an exact
 * threshold does not level (the first iteration compares against `undefined`, see KI-008).
 */
export function catalystPreview(symbol: SymbolData, retention: number): Preview {
  const table = symbol.symbolsRequired;
  const next = table[symbol.level];
  let invested = 0;
  table.forEach((required, index) => {
    if (index < symbol.level) invested += required;
  });

  let experience = (invested + (symbol.experience > next ? next : symbol.experience)) * retention;
  let level = NaN;
  table.forEach((_, index) => {
    if (experience > table[index - 1]) {
      experience -= table[index - 1];
      level = index;
    }
  });
  return { level, experience };
}

export interface PreviewContext {
  symbol: SymbolData;
  maxLevel: number;
  /** True while the catalyst tool is selected. */
  isCatalyst: boolean;
  /** The catalyst preview's experience, used to tell the two previews apart. */
  catalystExperience: number;
}

/** The "level / exp" text for a before or after preview, with the app's fallbacks. */
export function formatPreview(level: number, experience: number, ctx: PreviewContext): string {
  const { symbol, maxLevel, isCatalyst, catalystExperience } = ctx;
  const next = symbol.symbolsRequired[symbol.level];
  if (!isValid(level)) return "? / ?";
  if (level === symbol.level && level <= 1 && isCatalyst) return "? / ?";
  if (symbol.experience > next && experience !== catalystExperience) {
    return `${symbol.level} / ${next}`; // unlocked overflow disables the selector preview
  }
  if (level === maxLevel) return `${level} / 0`;
  if (!isValid(symbol.level)) return "? / ?";
  if (!isValid(symbol.experience)) return `${level} / ?`;
  return `${level} / ${Math.ceil(experience)}`;
}
