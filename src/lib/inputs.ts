// ---------------------------------------------------------------------------
// inputs.ts — Rules for the app's number inputs, as pure functions.
// Components keep the DOM handling; the decisions live here.
// ---------------------------------------------------------------------------

import type { SymbolData } from "./types";
import { isMaxLevel, isValid } from "./utils";

/**
 * Shared clamp for the target-level, target-power and symbol-count inputs: blank or
 * unparseable → unset (NaN), negative → unset, at or above `max` → `max`, otherwise the
 * value floored with a floor of 1.
 *
 * KI-003's sibling KI-010 was that only the *literal string* "0" was remapped, so "00",
 * "000", "0.5" and "-0" fell through to `parseInt` and stored a level of 0 (or -0) that
 * nothing else expects. Comparing the number, not the string, covers all of them.
 */
export function clampNumberInput(raw: string, max: number): number {
  const value = Number(raw);
  if (raw.trim() === "" || Number.isNaN(value)) return NaN;
  if (value < 0) return NaN;
  if (value >= max) return max;
  return Math.max(1, Math.floor(value));
}

/** The level input: the shared clamp, plus experience resets to 0 when the level hits max. */
export function levelInputPatch(raw: string, maxLevel: number): Partial<SymbolData> {
  const level = clampNumberInput(raw, maxLevel);
  return level === maxLevel ? { level, experience: 0 } : { level };
}

/**
 * Experience cap: 0 at max level, the next-level requirement while locked, the whole
 * table's total when unlocked.
 *
 * KI-004 was the max-level case: `symbolsRequired[max]` is `undefined`, and every
 * comparison against `undefined` is false, so the cap silently switched off and the field
 * accepted any number. A maxed symbol has no next level to save toward, so the cap is 0.
 */
export function expCapFor(symbol: SymbolData): number {
  if (isMaxLevel(symbol.level, symbol.type)) return 0;
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
