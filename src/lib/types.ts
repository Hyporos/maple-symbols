// ---------------------------------------------------------------------------
// Shared type definitions used across the entire application.
// ---------------------------------------------------------------------------

/** The two possible symbol archetypes. */
export type SymbolType = "arcane" | "sacred";

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
}
