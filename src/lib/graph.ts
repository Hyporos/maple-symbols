// ---------------------------------------------------------------------------
// graph.ts — Series, ticks and target-date maths behind the power Graph.
// Every function takes `now` so tests can freeze time without mocking Date.
// ---------------------------------------------------------------------------

import { dayjs } from "./dayjs";
import type { Dayjs } from "dayjs";
import type { SymbolData } from "./types";
import {
  advanceDayCount,
  getDailySymbols,
  getRemainingSymbols,
  INITIAL_DAY_COUNT,
  isValid,
} from "./utils";
import { POWER_PER_LEVEL } from "./game";

export type DateSymbols = {
  name: string;
  level: number;
  progress: Array<{ level: number; date: string }>;
};

export type GraphSymbols = {
  name: string;
  level: number;
  entryLevel: number;
  /** Day offset from today (dynamic axis) or a YYYY-MM-DD string (linear axis). */
  date: string | number;
  power: number;
};

export interface GraphSeries {
  /** One entry per level-up, sorted by date, with the cumulative power. */
  flatDateSymbols: GraphSymbols[];
  /** Today's base entry plus the highest-power entry per date. */
  graphSymbols: GraphSymbols[];
  maxPower: number;
  maxDays: number;
}

/** For every graphable symbol of the current mode, the date each future level is reached. */
export function buildDateSymbols(
  symbols: SymbolData[],
  swapped: boolean,
  maxLevel: number,
  now: Dayjs = dayjs()
): DateSymbols[] {
  return symbols
    .filter(
      (symbol) =>
        (symbol.weekly || symbol.daily) &&
        isValid(symbol.level) &&
        isValid(symbol.experience) &&
        (!swapped ? symbol.type === "arcane" : symbol.type === "sacred")
    )
    .map((symbol) => {
      const progress: DateSymbols["progress"] = [];
      let dayState = INITIAL_DAY_COUNT;
      const dailySymbols = getDailySymbols(symbol);

      for (let nextLevel = symbol.level + 1; nextLevel <= maxLevel; nextLevel++) {
        // Absolute symbols needed since today; the threaded state carries the Monday tracking.
        const remaining = getRemainingSymbols(nextLevel, symbol);
        dayState = advanceDayCount(dayState, remaining, dailySymbols, !!symbol.weekly, now);
        progress.push({
          level: nextLevel,
          date: now.add(dayState.days, "day").format("YYYY-MM-DD"),
        });
      }

      return { name: symbol.name, level: symbol.level, progress };
    });
}

/** Flatten per-symbol dates into one series: +10 power per level-up, one point per date. */
export function buildGraphSeries(
  dateSymbols: DateSymbols[],
  currentPower: number,
  graphDynamic: boolean,
  now: Dayjs = dayjs()
): GraphSeries {
  let power = currentPower;
  const maxPowerByDate: Record<string, number> = {};

  const flatDateSymbols = dateSymbols
    .flatMap((symbol) =>
      symbol.progress.map((entry) => {
        // Days from today to the entry date; both on today → 0, not 1.
        const diffDays = now.isSameOrAfter(entry.date, "day")
          ? 0
          : dayjs(entry.date).diff(now, "day") + 1;
        return {
          name: symbol.name,
          level: symbol.level,
          entryLevel: entry.level,
          date: graphDynamic ? diffDays : entry.date,
          power: NaN,
        };
      })
    )
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
    .map((entry) => {
      power += POWER_PER_LEVEL;
      entry.power = power;
      maxPowerByDate[entry.date] = Math.max(maxPowerByDate[entry.date] || 0, entry.power);
      return entry;
    });

  const graphSymbols = flatDateSymbols.filter(
    (entry) => entry.power === maxPowerByDate[entry.date]
  );

  graphSymbols.unshift({
    name: "",
    level: NaN,
    entryLevel: NaN,
    date: graphDynamic ? 0 : now.format("YYYY-MM-DD"),
    power: currentPower,
  });

  return {
    flatDateSymbols,
    graphSymbols,
    maxPower: graphSymbols[graphSymbols.length - 1]?.power ?? NaN,
    maxDays: (graphSymbols[graphSymbols.length - 1]?.date ?? NaN) as number,
  };
}

/** Four Y ticks from current to max power, rounded to tens; empty for a degenerate range. */
export function yAxisTicks(currentPower: number, maxPower: number): number[] {
  if (!isValid(currentPower) || !isValid(maxPower) || currentPower === 0 || maxPower === 0)
    return [];
  const ticks = [currentPower];
  for (let i = 1; i < 3; i++) {
    ticks.push(Math.round((currentPower + (i * (maxPower - currentPower)) / 3) / 10) * 10);
  }
  ticks.push(maxPower);
  // Bandaid: a sacred series could pin ticks[1] mid-axis; drop the ticks when the range is flat.
  return ticks[0] !== ticks[2] ? ticks : [];
}

/** Eight X ticks over the day range (dynamic axis only); empty for a degenerate range. */
export function xAxisTicks(
  currentPower: number,
  maxPower: number,
  maxDays: number,
  graphDynamic: boolean
): number[] {
  if (!isValid(currentPower) || !isValid(maxPower) || currentPower === 0 || maxPower === 0)
    return [];
  const ticks = [0];
  for (let i = 1; i < 7; i++) ticks.push(Math.ceil((i * maxDays) / 7));
  ticks.push(maxDays);
  return ticks[0] !== ticks[2] && graphDynamic ? ticks : [];
}

/**
 * The date the series first reaches `targetPower` rounded up to the nearest ten, as
 * YYYY-MM-DD, or "" when the target is not above the current power or is unreachable.
 */
export function dateToPower(
  targetPower: number,
  currentPower: number,
  graphSymbols: GraphSymbols[],
  graphDynamic: boolean,
  now: Dayjs = dayjs()
): string {
  const rounded = Math.ceil(targetPower / 10) * 10;
  if (rounded <= currentPower) return "";

  let date = graphSymbols.find((entry) => entry.power >= rounded)?.date;
  if (graphDynamic) date = now.add(date as number, "day").format("YYYY-MM-DD");
  return dayjs(date).isValid() ? (date as string) : "";
}
