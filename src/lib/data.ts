// ---------------------------------------------------------------------------
// data.ts — All static game data for the application.
// To update symbol exp tables or meso costs, edit src/lib/symbols.json.
// ---------------------------------------------------------------------------

import symbolsJson from "./symbols.json";
import { DEFAULT_REGION, REGION_PROFILES, type Region } from "./regions";
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
  selector?: false;
}

// ---------------------------------------------------------------------------
// Initial symbol state
// ---------------------------------------------------------------------------

/**
 * Returns the default SymbolData array used to initialise application state, for one
 * server. Static game data (experience tables, meso costs, symbol metadata) is read from
 * symbols.json, the GMS base; regions.json overrides what differs on `region` (for
 * example KMS's arcane meso costs), by symbol id. A GMS patch only edits symbols.json.
 */
export function createInitialSymbols(region: Region = DEFAULT_REGION): SymbolData[] {
  const { arcaneExpRequired, sacredExpRequired, symbols } = symbolsJson;
  const overrides = REGION_PROFILES[region].symbols;
  // Grand Sacred symbols level on the Sacred table (confirmed in game, GAME §4).
  const expTable: Record<SymbolType, number[]> = {
    arcane: arcaneExpRequired,
    sacred: sacredExpRequired,
    grand: sacredExpRequired,
  };

  return (symbols as SymbolDefinition[]).map((def) => ({
    ...def,
    ...overrides[String(def.id)],
    symbolsRequired: expTable[def.type],
    level: NaN,
    experience: NaN,
    daily: false,
    ...(def.weeklyName !== undefined && { weekly: false }),
    ...(def.extraName !== undefined && { extra: false }),
    locked: true,
  }));
}
