// ---------------------------------------------------------------------------
// overview.ts — The status strings shown in the Overview table.
// Pure functions over symbol state, so the wording is testable without a render.
// ---------------------------------------------------------------------------

import type { Dayjs } from "dayjs";
import { dayjs } from "./dayjs";
import { progressToMax } from "./calculator";
import type { SymbolData } from "./types";

/** Invisible placeholder that keeps a row's height when there is nothing to show. */
export const BLANK = "‎";

export interface CollapsedRowLabels {
  target: string;
  completion: string;
  days: string;
  remaining: string;
}

/**
 * The collapsed (desktop) row: target column, completion date, days and symbols remaining,
 * derived from the symbol's level/experience/quests as of `now` (every row is fresh).
 */
export function collapsedRowLabels(
  symbol: SymbolData,
  maxLevel: number,
  now: Dayjs = dayjs()
): CollapsedRowLabels {
  const { symbolsRemaining, daysRemaining, completion: date } = progressToMax(symbol, now);
  const atMax = symbol.level === maxLevel;
  const unset = isNaN(symbol.level);
  const noQuests = !symbol.daily && !symbol.weekly;
  const blank = atMax || unset;

  const target = atMax ? "MAX" : unset ? "0" : String(maxLevel);

  const completion = blank
    ? BLANK
    : date === "Invalid Date" || noQuests || isNaN(symbol.experience)
      ? "Indefinite"
      : daysRemaining === 0
        ? "Complete"
        : date;

  const days = blank
    ? BLANK
    : !isFinite(daysRemaining) || noQuests || isNaN(symbol.experience)
      ? "? days"
      : daysRemaining === 0
        ? "Ready for upgrade"
        : daysRemaining > 1
          ? `${daysRemaining} days`
          : `${daysRemaining} day`;

  const remaining = blank
    ? BLANK
    : isNaN(symbolsRemaining)
      ? "?"
      : symbolsRemaining <= 0
        ? "0"
        : String(symbolsRemaining);

  return { target, completion, days, remaining };
}

export interface TargetPanelInput {
  /** The row's own level (the panel is rendered for every row). */
  rowLevel: number;
  /** The symbol whose panel is open (`symbols[targetSymbol]`); supplies experience and quests. */
  current: SymbolData;
  targetLevel: number;
  targetSymbols: number;
  targetDays: number;
  targetDate: string;
  isTablet: boolean;
}

export interface TargetPanelLabels {
  completion: string;
  days: string;
  remaining: string;
}

/** The expanded target-level panel: completion date, days remaining, symbols remaining. */
export function targetPanelLabels(input: TargetPanelInput): TargetPanelLabels {
  const { rowLevel, current, targetLevel, targetSymbols, targetDays, targetDate, isTablet } = input;
  const noQuests = !current.daily && !current.weekly;
  const alreadyThere = targetSymbols === 0 && current.experience !== 0;

  const completion = alreadyThere
    ? "Complete"
    : targetLevel <= rowLevel ||
        isNaN(current.experience) ||
        isNaN(targetLevel) ||
        noQuests ||
        targetDate === "Invalid Date"
      ? "Indefinite"
      : targetDays <= 0
        ? "Complete"
        : targetDate;

  const days = alreadyThere
    ? "Ready for upgrade"
    : targetLevel <= rowLevel
      ? isTablet
        ? "Level too low"
        : `Level must be over ${rowLevel}`
      : isNaN(targetLevel)
        ? isTablet
          ? "Enter a level"
          : "Enter a target level"
        : String(targetDays) === "Infinity" ||
            String(targetDays) === "-Infinity" ||
            isNaN(targetDays) ||
            noQuests ||
            isNaN(current.experience)
          ? "? days"
          : targetDays > 1
            ? `${targetDays} days`
            : targetDays <= 0
              ? "Ready for upgrade"
              : `${targetDays} day`;

  const remaining =
    isNaN(targetSymbols) ||
    targetSymbols < 0 ||
    (current.experience === 0 && (targetLevel <= current.level || isNaN(targetLevel)))
      ? targetSymbols <= 0
        ? "0"
        : "?"
      : String(targetSymbols);

  return { completion, days, remaining };
}
