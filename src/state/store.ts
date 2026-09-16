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
// Version: bump STORAGE_VERSION whenever the SymbolData schema changes.
// The `migrate` function runs automatically when the stored version differs,
// resetting symbols to a clean initial state (KI-001).
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createInitialSymbols } from "../lib/data";
import type { SymbolData, SymbolType } from "../lib/types";

const STORAGE_VERSION = 2;

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
      // Only persist user symbol data — not ephemeral UI state.
      // Derived calculation fields (daysRemaining, symbolsRemaining, completion)
      // are intentionally zeroed-out on save; Calculator recomputes them on mount.
      partialize: (state) => ({
        symbols: state.symbols.map((s) => ({
          ...s,
          daysRemaining: 0,
          symbolsRemaining: 0,
          completion: "",
        })),
      }),
      // On schema change, reset symbols to defaults rather than loading stale data.
      migrate: () => ({ symbols: createInitialSymbols() }),
      // JSON.stringify converts NaN → null, so convert null back to NaN on rehydration.
      merge: (persisted, current) => {
        const p = persisted as Partial<AppStore>;
        return {
          ...current,
          ...p,
          symbols: (p.symbols ?? current.symbols).map(
            (s) =>
              ({
                ...s,
                level: s.level === null ? NaN : s.level,
                experience: s.experience === null ? NaN : s.experience,
              }) as SymbolData
          ),
        };
      },
    }
  )
);

/** The symbol the Calculator/Tools/Handbook operate on (falls back to the first symbol). */
export const useSelectedSymbol = (): SymbolData =>
  useAppStore((s) => s.symbols.find((x) => x.id === s.selectedId) ?? s.symbols[0]);
