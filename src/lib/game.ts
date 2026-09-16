// ---------------------------------------------------------------------------
// game.ts — Game constants that were hard-coded across components.
// symbols.json holds the tables; everything else about the rules lives here.
// ---------------------------------------------------------------------------

import type { SymbolType } from "./types";

/** Highest level per symbol type. */
export const MAX_LEVEL: Record<SymbolType, number> = { arcane: 20, sacred: 11 };

/** The mode the UI is in: `swapped` false = arcane, true = sacred. */
export const modeType = (swapped: boolean): SymbolType => (swapped ? "sacred" : "arcane");

/** Max level for the current mode (the former `!swapped ? 20 : 11` literal). */
export const maxLevelFor = (swapped: boolean): number => MAX_LEVEL[modeType(swapped)];

/** Symbols granted by a weekly quest at each Monday reset (arcane only). */
export const WEEKLY_SYMBOLS = 120;

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
