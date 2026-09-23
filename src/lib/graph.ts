// ---------------------------------------------------------------------------
// graph.ts — Series, ticks and target-date maths behind the power Graph.
// Every function takes `now` so tests can freeze time without mocking Date.
// ---------------------------------------------------------------------------

import { dayjs } from "./dayjs";
import type { Dayjs } from "dayjs";
import type { SymbolData, SymbolType } from "./types";
import {
  advanceDayCount,
  getDailySymbols,
  getRemainingSymbols,
  INITIAL_DAY_COUNT,
  isValid,
} from "./utils";
import { inFamily, MAX_LEVEL, POWER_PER_LEVEL } from "./game";
import { DEFAULT_REGION, gameToday, type Region } from "./regions";

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

/** For every graphable symbol of one type, the date each future level is reached. */
export function buildDateSymbols(
  symbols: SymbolData[],
  type: SymbolType,
  now: Dayjs = gameToday(),
  region: Region = DEFAULT_REGION
): DateSymbols[] {
  return symbols
    .filter(
      (symbol) =>
        (symbol.weekly || symbol.daily) &&
        isValid(symbol.level) &&
        isValid(symbol.experience) &&
        inFamily(symbol.type, type)
    )
    .map((symbol) => {
      const maxLevel = MAX_LEVEL[symbol.type];
      const progress: DateSymbols["progress"] = [];
      let dayState = INITIAL_DAY_COUNT;
      const dailySymbols = getDailySymbols(symbol);

      for (let nextLevel = symbol.level + 1; nextLevel <= maxLevel; nextLevel++) {
        // Absolute symbols needed since today; the threaded state carries the weekly tracking.
        const remaining = getRemainingSymbols(nextLevel, symbol);
        dayState = advanceDayCount(dayState, remaining, dailySymbols, !!symbol.weekly, now, region);
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
  now: Dayjs = gameToday()
): GraphSeries {
  let power = currentPower;
  const maxPowerByDate: Record<string, number> = {};

  const flatDateSymbols = dateSymbols
    .flatMap((symbol) =>
      symbol.progress.map((entry) => {
        // Whole days from today to the entry date; both on today → 0. Comparing from the
        // start of each day keeps the offset exact at any clock time, midnight included.
        const diffDays = now.isSameOrAfter(entry.date, "day")
          ? 0
          : dayjs(entry.date).startOf("day").diff(now.startOf("day"), "day");
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

/**
 * Ascending ticks with the duplicates a short range produces collapsed away. A range that
 * yields a single value has no usable axis, so it returns [] and Recharts picks its own.
 */
function toAxisTicks(ticks: number[]): number[] {
  const distinct = [...new Set(ticks)].sort((a, b) => a - b);
  return distinct.length > 1 ? distinct : [];
}

/** Up to four Y ticks from current to max power, rounded to tens. */
export function yAxisTicks(currentPower: number, maxPower: number): number[] {
  if (!isValid(currentPower) || !isValid(maxPower) || currentPower === 0 || maxPower === 0)
    return [];
  const ticks = [currentPower];
  for (let i = 1; i < 3; i++) {
    ticks.push(Math.round((currentPower + (i * (maxPower - currentPower)) / 3) / 10) * 10);
  }
  ticks.push(maxPower);
  // A short range (a sacred series, say) rounds several ticks onto the same power.
  return toAxisTicks(ticks);
}

/** Up to eight X ticks over the day range (dynamic axis only). */
export function xAxisTicks(
  currentPower: number,
  maxPower: number,
  maxDays: number,
  graphDynamic: boolean
): number[] {
  if (!graphDynamic) return [];
  if (!isValid(currentPower) || !isValid(maxPower) || currentPower === 0 || maxPower === 0)
    return [];
  if (!isValid(maxDays)) return [];
  const ticks = [0];
  for (let i = 1; i < 7; i++) ticks.push(Math.ceil((i * maxDays) / 7));
  ticks.push(maxDays);
  // A range shorter than eight days rounds several ticks onto the same day.
  return toAxisTicks(ticks);
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
  now: Dayjs = gameToday()
): string {
  const rounded = Math.ceil(targetPower / 10) * 10;
  if (rounded <= currentPower) return "";

  let date = graphSymbols.find((entry) => entry.power >= rounded)?.date;
  if (graphDynamic) date = now.add(date as number, "day").format("YYYY-MM-DD");
  return dayjs(date).isValid() ? (date as string) : "";
}
