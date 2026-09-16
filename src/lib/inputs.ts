// ---------------------------------------------------------------------------
// inputs.ts — Rules for the app's number inputs, as pure functions.
// Components keep the DOM handling; the decisions live here.
// ---------------------------------------------------------------------------

import type { SymbolData } from "./types";
import { isValid } from "./utils";

/**
 * Shared clamp for the target-level, target-power and symbol-count inputs:
 * negative → unset (NaN), the literal "0" → 1, at or above `max` → `max`, else parseInt
 * (so "" → NaN and "00"/"0.5" → 0, see KI-010).
 */
export function clampNumberInput(raw: string, max: number): number {
  if (Number(raw) < 0) return NaN;
  if (raw === "0") return 1;
  if (Number(raw) >= max) return max;
  return parseInt(raw);
}

/** The level input: the shared clamp, plus experience resets to 0 when the level hits max. */
export function levelInputPatch(raw: string, maxLevel: number): Partial<SymbolData> {
  const level = clampNumberInput(raw, maxLevel);
  return level === maxLevel ? { level, experience: 0 } : { level };
}

/**
 * Experience cap: the next-level requirement while locked (undefined at max level, which
 * disables the cap, KI-004), or the whole table's total when unlocked.
 */
export function expCapFor(symbol: SymbolData): number {
  return symbol.locked
    ? symbol.symbolsRequired[symbol.level]
    : symbol.symbolsRequired.reduce((a, b) => a + b, 0);
}

/**
 * The experience input rule. Returns the value to store, or `null` when nothing should be
 * stored (the "00"/"000" case above level 1, where the handler rewrites the field to "0").
 */
export function experienceInputValue(raw: string, level: number, expCap: number): number | null {
  if (!isValid(level)) return NaN;
  if (Number(raw) >= expCap) return expCap;
  if (Number(raw) < 0) return NaN;
  if (raw === "0" && level === 1) return 1;
  if (raw === "00" || raw === "000") return level === 1 ? 1 : null;
  return parseInt(raw);
}
