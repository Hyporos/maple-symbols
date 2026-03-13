// ---------------------------------------------------------------------------
// data.ts — All static game data for the application.
// To update symbol exp tables or meso costs, edit src/lib/symbols.json.
// ---------------------------------------------------------------------------

import symbolsJson from "./symbols.json";
import type { SymbolData, SymbolType } from "./types";

/** Shape of a symbol definition as stored in symbols.json (immutable fields only). */
interface SymbolDefinition {
  id: number;
  name: string;
  img: string;
  type: SymbolType;
  dailyName: string;
  weeklyName?: string;
  extraName?: string;
  dailySymbols: number;
  mesosRequired: number[];
}

// ---------------------------------------------------------------------------
// Initial symbol state
// ---------------------------------------------------------------------------

/**
 * Returns the default SymbolData array used to initialise application state.
 * Static game data (experience tables, meso costs, symbol metadata) is read
 * from symbols.json — game patches only require editing that one JSON file.
 */
export function createInitialSymbols(): SymbolData[] {
  const { arcaneExpRequired, sacredExpRequired, symbols } = symbolsJson;

  return (symbols as SymbolDefinition[]).map((def) => ({
    ...def,
    symbolsRequired: def.type === "arcane" ? arcaneExpRequired : sacredExpRequired,
    level: NaN,
    experience: NaN,
    daily: false,
    ...(def.weeklyName !== undefined && { weekly: false }),
    ...(def.extraName !== undefined && { extra: false }),
    locked: true,
    daysRemaining: 0,
    symbolsRemaining: 0,
    completion: "",
  }));
}
