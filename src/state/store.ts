// ---------------------------------------------------------------------------
// store.ts — Global application state via Zustand.
//
// Persistence: the player's symbols, one save per server, and the server they chose
// are written to localStorage via the `persist` middleware. UI state (mode,
// selection) intentionally resets on reload.
//
// Identity: symbols are addressed by `id` (from symbols.json), never by array
// index. `mode` is the type the UI is showing; `selectedId` is the symbol the
// Calculator/Tools/Handbook operate on; `lastSelected` remembers one id per type
// so switching modes restores the previous choice. Grand Sacred symbols are in
// `symbols` but never a mode or a selection until 2.0 places them (REGIONS D-18).
//
// Saved data: each symbol's `id` and the player's own fields only (lib/persistence).
// On load the list is rebuilt from symbols.json and those fields are laid on top by
// id, so game-data patches and new symbols reach returning players without a wipe.
// STORAGE_VERSION only needs a bump if the *player* fields change meaning; migrate
// passes any older save straight to that same by-id rebuild instead of resetting.
//
// Servers (docs/REGIONS.md): `symbols` is always the shown server's list, built from
// that server's game data. Version 4 made saves per server (a character on KMS is not
// the one on GMS), so `setRegion` stores the current list before loading the other.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createInitialSymbols } from "../lib/data";
import {
  isRegion,
  migrateSaved,
  readSaves,
  restoreSymbols,
  toSaved,
  type SavedState,
  type SavedSymbol,
} from "../lib/persistence";
import { type Region } from "../lib/regions";
import { editionFor } from "../lib/routes";
import { isMode } from "../lib/game";

/** The server of the site version being viewed (its URL prefix); GMS at the root. */
const pageRegion = (): Region =>
  typeof window === "undefined" ? "gms" : editionFor(window.location.pathname).region;
import type { Mode, SymbolData } from "../lib/types";

const STORAGE_VERSION = 4;

/** First symbol of each type in symbols.json (Vanishing Journey, Cernium). */
export const DEFAULT_SELECTION: Record<Mode, number> = { arcane: 1, sacred: 7 };

interface AppStore {
  // ── Mode (which symbol type the UI shows) ────────────────────────────────
  mode: Mode;
  /** Switch mode and restore the last symbol selected in that mode. */
  setMode: (mode: Mode) => void;

  // ── Symbol data ───────────────────────────────────────────────────────────
  /** The shown server's symbols: its game data plus the player's fields. */
  symbols: SymbolData[];
  setSymbols: (symbols: SymbolData[]) => void;

  // ── Server ────────────────────────────────────────────────────────────────
  /** The server whose numbers are shown: the player's choice, else the page's edition. */
  region: Region;
  /** The server the player picked, or null to follow the page's default (REGIONS D-2). */
  regionOverride: Region | null;
  /** Saved progress per server; the shown server's entry is refreshed on every write. */
  saves: Partial<Record<Region, SavedSymbol[]>>;
  /**
   * Show another server's numbers (the header's "Numbers from"): keep this server's
   * progress, load that server's data and save. Choosing the page's own server clears the
   * choice, so other site versions go back to their own numbers.
   */
  setRegion: (region: Region) => void;

  // ── Selection (by id) ─────────────────────────────────────────────────────
  selectedId: number;
  /** Remembered selection per type; resets on reload. */
  lastSelected: Record<Mode, number>;
  /**
   * Select a symbol by id, switching to its mode, and remember it for that type. An id
   * the interface does not list (unknown, or Grand Sacred) changes nothing.
   */
  selectSymbol: (id: number) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      mode: "arcane",
      setMode: (mode) => set({ mode, selectedId: get().lastSelected[mode] }),

      symbols: createInitialSymbols(pageRegion()),
      setSymbols: (symbols) => set({ symbols }),

      region: pageRegion(),
      regionOverride: null,
      saves: {},
      setRegion: (region) => {
        const { region: current, symbols, saves } = get();
        const regionOverride = region === pageRegion() ? null : region;
        if (region === current) return set({ regionOverride });
        const kept = { ...saves, [current]: toSaved(symbols) };
        // Symbol ids are the same on every server, so the selection carries over.
        set({
          region,
          regionOverride,
          saves: kept,
          symbols: restoreSymbols(kept[region], createInitialSymbols(region)),
        });
      },

      selectedId: DEFAULT_SELECTION.arcane,
      lastSelected: { ...DEFAULT_SELECTION },
      selectSymbol: (id) => {
        const symbol = get().symbols.find((s) => s.id === id);
        if (!symbol) return;
        const type = symbol.type;
        if (!isMode(type)) return;
        set((state) => ({
          selectedId: id,
          mode: type,
          lastSelected: { ...state.lastSelected, [type]: id },
        }));
      },
    }),
    {
      name: "maple-symbols-v2",
      version: STORAGE_VERSION,
      // Saves load after the first render (RestoreSaves in main.tsx), not at import, so a
      // prebuilt page and the browser's first render show the same, empty calculator.
      skipHydration: true,
      // Persist only the player's fields per symbol, per server, and their server choice;
      // never game data, UI state or anything derived (lib/persistence). NaN is written
      // as null because JSON cannot encode it.
      partialize: (state): SavedState => ({
        saves: { ...state.saves, [state.region]: toSaved(state.symbols) },
        regionOverride: state.regionOverride,
      }),
      // Versions 1–3 held one GMS list; it becomes the GMS save (lib/persistence).
      migrate: (persisted, version) => migrateSaved(persisted, version),
      // Rebuild the chosen server's list from its game data and lay the saved player
      // fields on top, matched by id. Unknown servers and unreadable entries are dropped.
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as { saves?: unknown; regionOverride?: unknown };
        const saves = readSaves(stored.saves);
        const regionOverride = isRegion(stored.regionOverride) ? stored.regionOverride : null;
        const region = regionOverride ?? pageRegion();
        const symbols = restoreSymbols(saves[region], createInitialSymbols(region));
        return {
          ...current,
          region,
          regionOverride,
          // Re-save each server's list through restoreSymbols so only readable fields persist.
          saves: Object.fromEntries(
            Object.entries(saves).map(([key, list]) => [
              key,
              toSaved(restoreSymbols(list, createInitialSymbols(key as Region))),
            ])
          ),
          symbols,
        };
      },
    }
  )
);

/** The symbol the Calculator/Tools/Handbook operate on (falls back to the first symbol). */
export const useSelectedSymbol = (): SymbolData =>
  useAppStore((s) => s.symbols.find((x) => x.id === s.selectedId) ?? s.symbols[0]);
