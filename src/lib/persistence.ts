// ---------------------------------------------------------------------------
// persistence.ts — What the store saves, and how a save is turned back into symbols.
//
// Only the player's own fields are saved, keyed by symbol `id`. Game data (names,
// quest names, daily counts, exp and meso tables) always comes from symbols.json,
// so a patch to that file reaches returning players on their next visit, a new
// symbol appears for them, and a removed one drops out, without wiping anyone's
// levels (KI-001). `restoreSymbols` accepts any older save shape, including the
// full records that STORAGE_VERSION 2 and 3 wrote, and ignores anything it cannot
// read rather than trusting it. Since version 4 there is one such list per server.
// ---------------------------------------------------------------------------

import { REGIONS, type Region } from "./regions";
import type { SymbolData } from "./types";

/**
 * What the store writes (STORAGE_VERSION 4): one list of saved symbols per server,
 * since a character on one server is a different account on another (REGIONS D-7),
 * and the server the player chose, if they chose one.
 */
export interface SavedState {
  saves: Partial<Record<Region, SavedSymbol[]>>;
  regionOverride: Region | null;
}

export const isRegion = (v: unknown): v is Region =>
  typeof v === "string" && (REGIONS as readonly string[]).includes(v);

/**
 * The per-server saves of a stored state, keeping only known servers. The lists stay
 * unchecked here; `restoreSymbols` reads each one defensively when its server loads.
 */
export function readSaves(saves: unknown): Partial<Record<Region, unknown>> {
  if (!isRecord(saves)) return {};
  return Object.fromEntries(Object.entries(saves).filter(([key]) => isRegion(key)));
}

/**
 * Brings any older stored state up to version 4. Versions 1 to 3 held one `symbols`
 * list, written while the site showed GMS only, so it becomes the GMS save; nothing
 * is wiped (the per-symbol fields are read by `restoreSymbols` as before).
 */
export function migrateSaved(persisted: unknown, version: number): unknown {
  if (version >= 4 || !isRecord(persisted)) return persisted;
  return { saves: { gms: persisted.symbols }, regionOverride: null };
}

/** The fields a player controls; everything else is game data from symbols.json. */
export interface SavedSymbol {
  id: number;
  /** `null` stands for NaN ("unset"), since JSON cannot encode NaN. */
  level: number | null;
  experience: number | null;
  daily: boolean;
  weekly?: boolean;
  extra?: boolean;
  locked: boolean;
}

const toJsonNumber = (n: number): number | null => (Number.isNaN(n) ? null : n);

/** The slim record written to localStorage for each symbol. */
export function toSaved(symbols: SymbolData[]): SavedSymbol[] {
  return symbols.map((s) => ({
    id: s.id,
    level: toJsonNumber(s.level),
    experience: toJsonNumber(s.experience),
    daily: s.daily,
    ...(s.weekly !== undefined && { weekly: s.weekly }),
    ...(s.extra !== undefined && { extra: s.extra }),
    locked: s.locked,
  }));
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** A saved number, `null` (unset) or anything unreadable (also unset). */
const readNumber = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : NaN);

/**
 * Rebuild the symbol list from fresh game data plus whatever player fields a save holds.
 * `fresh` is `createInitialSymbols(region)`: its order, length and game data always win.
 * For each fresh symbol with a saved record of the same `id`, the player fields are
 * copied over when they have the right type; `weekly`/`extra` are only restored on
 * symbols that still have that quest. Saved records for unknown ids are ignored.
 */
export function restoreSymbols(saved: unknown, fresh: SymbolData[]): SymbolData[] {
  const byId = new Map<number, Record<string, unknown>>();
  if (Array.isArray(saved)) {
    for (const entry of saved) {
      if (isRecord(entry) && typeof entry.id === "number") byId.set(entry.id, entry);
    }
  }

  return fresh.map((symbol) => {
    const record = byId.get(symbol.id);
    if (!record) return symbol;

    const restored: SymbolData = { ...symbol };
    if ("level" in record) restored.level = readNumber(record.level);
    if ("experience" in record) restored.experience = readNumber(record.experience);
    if (typeof record.daily === "boolean") restored.daily = record.daily;
    if (typeof record.locked === "boolean") restored.locked = record.locked;
    if (symbol.weekly !== undefined && typeof record.weekly === "boolean") {
      restored.weekly = record.weekly;
    }
    if (symbol.extra !== undefined && typeof record.extra === "boolean") {
      restored.extra = record.extra;
    }
    return restored;
  });
}
