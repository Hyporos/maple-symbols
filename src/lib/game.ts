// ---------------------------------------------------------------------------
// game.ts — Game constants that were hard-coded across components.
// symbols.json holds the tables; everything else about the rules lives here.
//
// One value per family (`SymbolType`). Where a rule does not exist for a family,
// the value is `null`, never a stand-in number: Grand Sacred symbols have no
// extra quest, no Catalyst and no main stat (GAME §4). Indexed with a `Mode`
// (a family the interface lists), those tables still give a number.
// ---------------------------------------------------------------------------

import { DEFAULT_REGION, weeklySymbolsFor } from "./regions";
import type { Mode, SymbolData, SymbolType } from "./types";

/** A number per listed family, and `null` for Grand Sacred, which lacks the rule. */
type NoneForGrand = Readonly<Record<Mode, number> & { grand: null }>;

/** Whether the interface can list this family as a mode: not Grand Sacred yet (REGIONS D-18). */
export const isMode = (type: SymbolType): type is Mode => type !== "grand";

/**
 * Whether a symbol of `type` counts toward `family`'s power and graph: its own family, and
 * Grand Sacred inside Sacred (their power adds to Sacred Power, Brian 2026-09-23).
 */
export const inFamily = (type: SymbolType, family: SymbolType): boolean =>
  type === family || (family === "sacred" && type === "grand");

/** Highest level per symbol type. */
export const MAX_LEVEL: Record<SymbolType, number> = { arcane: 20, sacred: 11, grand: 11 };

/** Max level for a symbol type (the former `!swapped ? 20 : 11` literal). */
export const maxLevelFor = (type: SymbolType): number => MAX_LEVEL[type];

/** Symbols from a week of weekly content on the default server, credited at each weekly
 *  reset (arcane only). GMS pays 80 per clear with up to 3 clears a week (KMS: one clear
 *  of 240); the calculator credits the week in one go (GAME §2). The structure per server
 *  lives in regions.json; use `weeklySymbolsFor(region)` where the server can differ. */
export const WEEKLY_SYMBOLS = weeklySymbolsFor(DEFAULT_REGION);

/** Daily-rate multiplier when the extra quest is unlocked; Grand Sacred has no extra quest. */
export const EXTRA_MULTIPLIER: NoneForGrand = { arcane: 2, sacred: 1.5, grand: null };

/** Share of cumulative experience a catalyst transfer keeps; no Catalyst for Grand Sacred (v.270). */
export const CATALYST_RETENTION: NoneForGrand = { arcane: 0.8, sacred: 0.6, grand: null };

/** Power = level * POWER_PER_LEVEL (+ ARCANE_BASE_POWER for arcane symbols). */
export const POWER_PER_LEVEL = 10;
export const ARCANE_BASE_POWER = 20;
export const MAX_POWER_PER_SYMBOL: Record<SymbolType, number> = {
  arcane: 220,
  sacred: 110,
  grand: 110,
};

/**
 * Main stat gained per symbol level. Grand Sacred gives none (EXP, meso and drop rate
 * instead, GAME §4), so it has no Demon Avenger or Xenon conversion either.
 */
export const MAIN_STAT_PER_LEVEL: NoneForGrand = { arcane: 100, sacred: 200, grand: null };

/**
 * Whether Symbol Selector coupons can level this symbol: every Arcane and Sacred symbol,
 * and Tallahart through the Sacred Symbol Selector (v.271), but not Geardock (`selector: false`).
 */
export const selectorWorksOn = (symbol: Pick<SymbolData, "selector">): boolean =>
  symbol.selector !== false;

/** The `symbolsRequired`/`mesosRequired` entry for a level→level+1 step; `undefined` at max. */
export const nextRequirement = (table: number[], level: number): number => table[level];
