// ---------------------------------------------------------------------------
// Shared type definitions used across the entire application.
// ---------------------------------------------------------------------------

/**
 * The symbol families: Arcane, Sacred, and Grand Sacred (Tallahart, Geardock). Every
 * per-symbol rule reads `symbol.type`; src/lib/game.ts holds one value per family.
 */
export type SymbolType = "arcane" | "sacred" | "grand";

/**
 * The families the interface lists (the store's `mode`, the Arcane/Sacred toggle). Grand
 * Sacred symbols are in the data but not in the interface until the 2.0 design places them
 * (REGIONS D-18), so every list for a mode filters on `symbol.type === mode`.
 */
export type Mode = Exclude<SymbolType, "grand">;

/**
 * A single symbol entry as it lives in application state.
 *
 * Static fields (id, name, img, …) come from the initial data definition.
 * Dynamic fields (level, experience, quest flags, locked) are mutated by user
 * interaction. Everything else (symbols/days remaining, completion date, power)
 * is derived on read via src/lib; nothing derived is stored.
 *
 * Optional fields that only exist on certain symbols:
 *   - weeklyName / weekly  → arcane symbols only
 *   - extraName / extra    → VJ and ChuChu only
 *   - selector: false      → a symbol the Symbol Selector cannot level (Geardock)
 */
export interface SymbolData {
  // ── Identity ──────────────────────────────────────────────────────────────
  id: number;
  name: string;
  img: string;
  type: SymbolType;

  // ── Quest names ───────────────────────────────────────────────────────────
  dailyName: string;
  weeklyName?: string;
  extraName?: string;

  // ── User-controlled state ─────────────────────────────────────────────────
  level: number;
  experience: number;
  daily: boolean;
  weekly?: boolean;
  extra?: boolean;
  locked: boolean;

  // ── Tuning constants ──────────────────────────────────────────────────────
  dailySymbols: number;
  symbolsRequired: number[];
  mesosRequired: number[];
  /** `false` when Symbol Selector coupons cannot level this symbol; absent means they can. */
  selector?: false;
}
