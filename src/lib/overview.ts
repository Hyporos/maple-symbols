// ---------------------------------------------------------------------------
// overview.ts — The status strings shown in the Overview table.
// Pure functions over symbol state, so the wording is testable without a render.
// The wording itself comes from the caller's catalogue area (`m`, src/i18n/en/overview.ts).
// ---------------------------------------------------------------------------

import type { Dayjs } from "dayjs";
import { DEFAULT_REGION, gameToday, type Region } from "./regions";
import { progressToMax } from "./calculator";
import { formatDay } from "./format";
import { DEFAULT_LOCALE } from "./routes";
import { interpolate, pluralMessage } from "../i18n/interpolate";
import type { Messages } from "../i18n";
import type { SymbolData } from "./types";

type OverviewMessages = Messages["overview"];

const dayCount = (m: OverviewMessages, count: number): string =>
  interpolate(pluralMessage(m.days, count), { count });

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
 * The date reads in `locale` (`formatDay`).
 */
export function collapsedRowLabels(
  symbol: SymbolData,
  maxLevel: number,
  m: OverviewMessages,
  now: Dayjs = gameToday(),
  region: Region = DEFAULT_REGION,
  locale: string = DEFAULT_LOCALE
): CollapsedRowLabels {
  const { symbolsRemaining, daysRemaining, completion: date } = progressToMax(symbol, now, region);
  const atMax = symbol.level === maxLevel;
  const unset = isNaN(symbol.level);
  const noQuests = !symbol.daily && !symbol.weekly;
  const blank = atMax || unset;

  const target = atMax ? m.max : unset ? "0" : String(maxLevel);

  const completion = blank
    ? BLANK
    : date === "Invalid Date" || noQuests || isNaN(symbol.experience)
      ? m.indefinite
      : daysRemaining === 0
        ? m.complete
        : formatDay(date, locale);

  const days = blank
    ? BLANK
    : !isFinite(daysRemaining) || noQuests || isNaN(symbol.experience)
      ? m.unknownDays
      : daysRemaining === 0
        ? m.readyForUpgrade
        : dayCount(m, daysRemaining);

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
  /** The Overview catalogue area the labels are worded from. */
  m: OverviewMessages;
  /** The language the date reads in (`formatDay`); English keeps ISO. */
  locale?: string;
}

export interface TargetPanelLabels {
  completion: string;
  days: string;
  remaining: string;
}

/** The expanded target-level panel: completion date, days remaining, symbols remaining. */
export function targetPanelLabels(input: TargetPanelInput): TargetPanelLabels {
  const { rowLevel, current, targetLevel, targetSymbols, targetDays, targetDate, isTablet, m } =
    input;
  const locale = input.locale ?? DEFAULT_LOCALE;
  const noQuests = !current.daily && !current.weekly;
  const alreadyThere = targetSymbols === 0 && current.experience !== 0;

  const completion = alreadyThere
    ? m.complete
    : targetLevel <= rowLevel ||
        isNaN(current.experience) ||
        isNaN(targetLevel) ||
        noQuests ||
        targetDate === "Invalid Date"
      ? m.indefinite
      : targetDays <= 0
        ? m.complete
        : formatDay(targetDate, locale);

  const days = alreadyThere
    ? m.readyForUpgrade
    : targetLevel <= rowLevel
      ? isTablet
        ? m.levelTooLow
        : interpolate(m.levelMustBeOver, { level: rowLevel })
      : isNaN(targetLevel)
        ? isTablet
          ? m.enterLevel
          : m.enterTargetLevel
        : String(targetDays) === "Infinity" ||
            String(targetDays) === "-Infinity" ||
            isNaN(targetDays) ||
            noQuests ||
            isNaN(current.experience)
          ? m.unknownDays
          : // `targetDays` is a whole day count from advanceDayCount, so testing
            // "<= 0" before the plural reads the same as the old "> 1" chain did.
            targetDays <= 0
            ? m.readyForUpgrade
            : dayCount(m, targetDays);

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
