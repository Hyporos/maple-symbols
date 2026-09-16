// ---------------------------------------------------------------------------
// store.ts — Global application state via Zustand.
// Replaces the previous Redux + RTK setup.
//
// Persistence: only `symbols` is written to localStorage via the `persist`
// middleware.  UI state (swapped, selectedSymbol, selectedPage) intentionally
// resets to defaults on every page load.
//
// Version: bump STORAGE_VERSION whenever the SymbolData schema changes.
// The `migrate` function runs automatically when the stored version differs,
// resetting symbols to a clean initial state.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createInitialSymbols } from "../lib/data";
import type { SymbolData } from "../lib/types";

const STORAGE_VERSION = 2;

interface AppStore {
  // ── Symbol type toggle ────────────────────────────────────────────────────
  swapped: boolean;
  setSwapped: (v: boolean) => void;

  // ── Symbol data ───────────────────────────────────────────────────────────
  symbols: SymbolData[];
  setSymbols: (symbols: SymbolData[]) => void;

  // ── Selection state ───────────────────────────────────────────────────────
  selectedSymbol: number;
  setSelectedSymbol: (index: number) => void;

  // ── Per-type symbol memory (survives swaps; resets on full page reload) ────
  /** Index of the last-selected Arcane symbol. Restored when swapping back. */
  selectedArcane: number;
  setSelectedArcane: (index: number) => void;
  /** Index of the last-selected Sacred symbol. Restored when swapping back. */
  selectedSacred: number;
  setSelectedSacred: (index: number) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      swapped: false,
      setSwapped: (swapped) => set({ swapped }),

      symbols: createInitialSymbols(),
      setSymbols: (symbols) => set({ symbols }),

      selectedSymbol: 0,
      setSelectedSymbol: (selectedSymbol) => set({ selectedSymbol }),

      selectedArcane: 0,
      setSelectedArcane: (selectedArcane) => set({ selectedArcane }),
      selectedSacred: 6,
      setSelectedSacred: (selectedSacred) => set({ selectedSacred }),
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
      migrate: (_persistedState, _version) => ({
        swapped: false,
        symbols: createInitialSymbols(),
        selectedSymbol: 0,
      }),
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
