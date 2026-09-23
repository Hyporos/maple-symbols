// ---------------------------------------------------------------------------
// useSymbolEditor.ts — The /next calculator card's rules for the selected symbol.
//
// A port of src/components/Calculator/Calculator.tsx, not a rewrite: the same derived
// values, the same input handlers and the same two store-writing effects (clamp and
// relock, ARCHITECTURE §5). Both effects are guarded by their condition and leave
// `symbols` out of their dependencies on purpose; adding it would loop (AGENTS gotcha 6).
// Every write goes through `updateSymbol` on the store's latest list, by id.
// ---------------------------------------------------------------------------

import { useEffect, useMemo } from "react";
import { track, trackOnce } from "../../lib/analytics";
import { getOverflow } from "../../lib/calculator";
import { maxLevelFor } from "../../lib/game";
import { expCapFor, experienceInputValue, levelInputPatch } from "../../lib/inputs";
import { gameToday, weeklySymbolsFor } from "../../lib/regions";
import type { SymbolData } from "../../lib/types";
import { calculateDaysRemaining, getDailySymbols, isMaxLevel, updateSymbol } from "../../lib/utils";
import { useAppStore, useSelectedSymbol } from "../../state/store";

export type Quest = "daily" | "weekly" | "extra";

export interface SymbolEditor {
  symbol: SymbolData;
  /** symbolsRequired[level]: NaN at max level or while the level is unset. */
  nextExperience: number;
  readyForUpgrade: boolean;
  /** getDailySymbols(symbol): 0 while the daily is off. */
  dailySymbols: number;
  /** The server's weekly while the weekly is on, else 0. */
  weeklySymbols: number;
  /** calculateDaysRemaining(...), or NaN when it cannot be computed. */
  daysToNextLevel: number;
  setLevel: (raw: string) => void;
  setExperience: (raw: string) => void;
  toggle: (quest: Quest) => void;
  unlockCap: () => void;
  lockCap: () => void;
  applyOverflow: () => void;
}

export function useSymbolEditor(): SymbolEditor {
  /* ――――――――――――――――――――― Declarations ――――――――――――――――――― */

  const setSymbols = useAppStore((s) => s.setSymbols);
  const selectedId = useAppStore((s) => s.selectedId);
  const mode = useAppStore((s) => s.mode);
  const region = useAppStore((s) => s.region);

  const symbol = useSelectedSymbol();

  const nextExperience = symbol.symbolsRequired[symbol.level] ?? NaN;

  const readyForUpgrade = symbol.experience >= nextExperience;

  /** Write a patch to the selected symbol on the store's latest list. */
  const write = (patch: Partial<SymbolData>) =>
    setSymbols(updateSymbol(useAppStore.getState().symbols, selectedId, patch));

  /* ―――――――――――――――――――― Calculations ――――――――――――――――――― */

  const dailySymbols = getDailySymbols(symbol);
  const weeklySymbols = symbol.weekly ? weeklySymbolsFor(region) : 0;

  // Derived: days remaining until the next level upgrade.
  const daysToNextLevel = useMemo(() => {
    try {
      return calculateDaysRemaining(
        nextExperience - symbol.experience,
        dailySymbols,
        !!symbol.weekly,
        gameToday(region),
        region
      );
    } catch {
      return NaN;
    }
  }, [nextExperience, symbol.experience, dailySymbols, symbol.weekly, region]);

  // Derived overflow state (cap unlocked): the levels the stored experience would buy and
  // the leftover.
  const { level: overflowLevel, experience: overflowExperience } = useMemo(
    () => getOverflow(symbol),
    [symbol]
  );

  // Clamp: while locked, experience never stays above the next level's requirement.
  useEffect(() => {
    if (readyForUpgrade && symbol.locked) {
      write({ experience: nextExperience });
    }
  }, [symbol.locked, readyForUpgrade, nextExperience, selectedId]);

  // Relock: a maxed symbol with no experience has nothing to overflow into.
  useEffect(() => {
    if (symbol.experience === 0 && isMaxLevel(symbol.level, symbol.type) && !symbol.locked) {
      write({ locked: true });
    }
  }, [symbol.experience, symbol.level, symbol.locked, mode, selectedId]);

  /* ―――――――――――――――――――― Handlers ――――――――――――――――――――――― */

  const setLevel = (raw: string) => {
    trackOnce("symbol_input:level", "symbol_input", { field: "level", mode: symbol.type });
    write(levelInputPatch(raw, maxLevelFor(symbol.type)));
  };

  const setExperience = (raw: string) => {
    trackOnce("symbol_input:experience", "symbol_input", {
      field: "experience",
      mode: symbol.type,
    });
    const experience = experienceInputValue(raw, symbol.level, expCapFor(symbol));
    // null: "00"/"000" above level 1, where nothing is stored.
    if (experience !== null) write({ experience });
  };

  const toggle = (quest: Quest) => {
    track("quest_toggle", { quest, state: symbol[quest] ? "off" : "on" });
    write({ [quest]: !symbol[quest] });
  };

  const unlockCap = () => {
    track("cap_unlocked");
    write({ locked: false });
  };

  const lockCap = () => write({ locked: true });

  const applyOverflow = () =>
    write({
      level: overflowLevel,
      experience: overflowLevel > symbol.level ? overflowExperience : 0,
      locked: true,
    });

  return {
    symbol,
    nextExperience,
    readyForUpgrade,
    dailySymbols,
    weeklySymbols,
    daysToNextLevel,
    setLevel,
    setExperience,
    toggle,
    unlockCap,
    lockCap,
    applyOverflow,
  };
}
