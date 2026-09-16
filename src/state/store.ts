// ---------------------------------------------------------------------------
// store.ts — Global application state via Zustand.
//
// Persistence: only `symbols` is written to localStorage via the `persist`
// middleware. UI state (mode, selection) intentionally resets on reload.
//
// Identity: symbols are addressed by `id` (from symbols.json), never by array
// index. `mode` is the type the UI is showing; `selectedId` is the symbol the
// Calculator/Tools/Handbook operate on; `lastSelected` remembers one id per type
// so switching modes restores the previous choice.
//
// Saved data: each symbol's `id` and the player's own fields only (lib/persistence).
// On load the list is rebuilt from symbols.json and those fields are laid on top by
// id, so game-data patches and new symbols reach returning players without a wipe.
// STORAGE_VERSION only needs a bump if the *player* fields change meaning; migrate
// passes any older save straight to that same by-id rebuild instead of resetting.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createInitialSymbols } from "../lib/data";
import { restoreSymbols, toSaved } from "../lib/persistence";
import type { SymbolData, SymbolType } from "../lib/types";

const STORAGE_VERSION = 3;

/** First symbol of each type in symbols.json (Vanishing Journey, Cernium). */
export const DEFAULT_SELECTION: Record<SymbolType, number> = { arcane: 1, sacred: 7 };

interface AppStore {
  // ── Mode (which symbol type the UI shows) ────────────────────────────────
  mode: SymbolType;
  /** Switch mode and restore the last symbol selected in that mode. */
  setMode: (mode: SymbolType) => void;

  // ── Symbol data ───────────────────────────────────────────────────────────
  symbols: SymbolData[];
  setSymbols: (symbols: SymbolData[]) => void;

  // ── Selection (by id) ─────────────────────────────────────────────────────
  selectedId: number;
  /** Remembered selection per type; resets on reload. */
  lastSelected: Record<SymbolType, number>;
  /** Select a symbol of the current mode by id and remember it for that type. */
  selectSymbol: (id: number) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      mode: "arcane",
      setMode: (mode) => set({ mode, selectedId: get().lastSelected[mode] }),

      symbols: createInitialSymbols(),
      setSymbols: (symbols) => set({ symbols }),

      selectedId: DEFAULT_SELECTION.arcane,
      lastSelected: { ...DEFAULT_SELECTION },
      selectSymbol: (id) => {
        const symbol = get().symbols.find((s) => s.id === id);
        if (!symbol) return;
        set((state) => ({
          selectedId: id,
          mode: symbol.type,
          lastSelected: { ...state.lastSelected, [symbol.type]: id },
        }));
      },
    }),
    {
      name: "maple-symbols-v2",
      version: STORAGE_VERSION,
      // Persist only the player's fields per symbol, never game data, UI state or anything
      // derived (lib/persistence). NaN is written as null because JSON cannot encode it.
      partialize: (state) => ({ symbols: toSaved(state.symbols) }),
      // Older saves (full SymbolData records in versions 2 and 3) carry the same player
      // fields by id, so they go through the same rebuild in merge; nothing is wiped.
      migrate: (persisted) => persisted,
      // Rebuild from symbols.json and lay the saved player fields on top, matched by id.
      merge: (persisted, current) => {
        const saved = (persisted as { symbols?: unknown } | undefined)?.symbols;
        return { ...current, symbols: restoreSymbols(saved, createInitialSymbols()) };
      },
    }
  )
);

/** The symbol the Calculator/Tools/Handbook operate on (falls back to the first symbol). */
export const useSelectedSymbol = (): SymbolData =>
  useAppStore((s) => s.symbols.find((x) => x.id === s.selectedId) ?? s.symbols[0]);
