// ---------------------------------------------------------------------------
// game.ts — Game constants that were hard-coded across components.
// symbols.json holds the tables; everything else about the rules lives here.
// ---------------------------------------------------------------------------

import type { SymbolType } from "./types";

/** Highest level per symbol type. */
export const MAX_LEVEL: Record<SymbolType, number> = { arcane: 20, sacred: 11 };

/** Max level for a symbol type (the former `!swapped ? 20 : 11` literal). */
export const maxLevelFor = (type: SymbolType): number => MAX_LEVEL[type];

/** Symbols from a week of weekly content, credited at each Monday reset (arcane only).
 *  The game pays 80 per clear with up to 3 clears a week; the calculator credits the week
 *  in one go (GAME §2). GMS v.271 raised it from 40 per clear. */
export const WEEKLY_SYMBOLS = 240;

/** Daily-rate multiplier when the extra quest is unlocked. */
export const EXTRA_MULTIPLIER: Record<SymbolType, number> = { arcane: 2, sacred: 1.5 };

/** Share of cumulative experience kept when transferring a symbol with a catalyst. */
export const CATALYST_RETENTION: Record<SymbolType, number> = { arcane: 0.8, sacred: 0.6 };

/** Power = level * POWER_PER_LEVEL (+ ARCANE_BASE_POWER for arcane symbols). */
export const POWER_PER_LEVEL = 10;
export const ARCANE_BASE_POWER = 20;
export const MAX_POWER_PER_SYMBOL: Record<SymbolType, number> = { arcane: 220, sacred: 110 };

/** Main stat gained per symbol level. */
export const MAIN_STAT_PER_LEVEL: Record<SymbolType, number> = { arcane: 100, sacred: 200 };

/** The `symbolsRequired`/`mesosRequired` entry for a level→level+1 step; `undefined` at max. */
export const nextRequirement = (table: number[], level: number): number => table[level];
