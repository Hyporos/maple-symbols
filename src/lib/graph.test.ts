import { describe, expect, it } from "vitest";
import { buildDateSymbols, buildGraphSeries, dateToPower, xAxisTicks, yAxisTicks } from "./graph";
import { createInitialSymbols } from "./data";
import { dayjs } from "./dayjs";
import { WED } from "../test/helpers";

const now = dayjs(WED); // Wednesday 2026-09-16, 10:00 local
const vj = (patch = {}) => ({ ...createInitialSymbols()[0], ...patch });

describe("buildDateSymbols", () => {
  it("skips symbols without quests, level or experience, and the other mode", () => {
    const symbols = [
      vj({ level: 5, experience: 0 }), // no quest
      vj({ level: NaN, experience: 0, daily: true }),
      { ...createInitialSymbols()[6], level: 3, experience: 0, daily: true }, // sacred while arcane mode
    ];
    expect(buildDateSymbols(symbols, "arcane", now)).toEqual([]);
  });

  it("dates every future level from the daily rate (VJ level 18, 20/day)", () => {
    const [entry] = buildDateSymbols(
      [vj({ level: 18, experience: 0, daily: true })],
      "arcane",
      now
    );
    expect(entry.name).toBe("Vanishing Journey");
    expect(entry.progress).toEqual([
      { level: 19, date: "2026-10-03" }, // 335 symbols → 17 days
      { level: 20, date: "2026-10-22" }, // 335 + 372 = 707 → 36 days
    ]);
  });
});

describe("buildGraphSeries", () => {
  const dateSymbols = [
    {
      name: "A",
      level: 1,
      progress: [
        { level: 2, date: "2026-09-18" },
        { level: 3, date: "2026-09-25" },
      ],
    },
    { name: "B", level: 1, progress: [{ level: 2, date: "2026-09-18" }] },
  ];

  it("adds 10 power per level-up, in date order, keeping one point per date (dynamic axis)", () => {
    const series = buildGraphSeries(dateSymbols, 60, true, now);
    // Day offsets are whole calendar days from today: 09-18 → 2, 09-25 → 9.
    expect(series.flatDateSymbols.map((e) => [e.name, e.date, e.power])).toEqual([
      ["A", 2, 70],
      ["B", 2, 80],
      ["A", 9, 90],
    ]);
    expect(series.graphSymbols.map((e) => [e.date, e.power])).toEqual([
      [0, 60], // today's base entry
      [2, 80], // the higher of the two same-day entries
      [9, 90],
    ]);
    expect(series.maxPower).toBe(90);
    expect(series.maxDays).toBe(9);
  });

  it("uses date strings on the linear axis", () => {
    const series = buildGraphSeries(dateSymbols, 60, false, now);
    expect(series.graphSymbols.map((e) => e.date)).toEqual([
      "2026-09-16",
      "2026-09-18",
      "2026-09-25",
    ]);
  });

  it("gives the same day offsets at local midnight as later in the day", () => {
    // Was diff(now, "day") + 1, which overshot by one when now was exactly 00:00.
    const midnight = dayjs("2026-09-16T00:00:00");
    const series = buildGraphSeries(dateSymbols, 60, true, midnight);
    expect(series.graphSymbols.map((e) => e.date)).toEqual([0, 2, 9]);
    expect(series.maxDays).toBe(9);
  });

  it("with no level-ups, has only the base entry and NaN max days", () => {
    const series = buildGraphSeries([], 0, true, now);
    expect(series.graphSymbols).toHaveLength(1);
    expect(series.maxPower).toBe(0);
  });
});

describe("axis ticks", () => {
  it("y: four ticks from current to max, rounded to tens", () => {
    expect(yAxisTicks(70, 220)).toEqual([70, 120, 170, 220]);
  });

  it("x: eight ticks across the day range, dynamic axis only", () => {
    expect(xAxisTicks(70, 220, 14, true)).toEqual([0, 2, 4, 6, 8, 10, 12, 14]);
    expect(xAxisTicks(70, 220, 14, false)).toEqual([]);
  });

  it("are empty for a missing or flat range", () => {
    expect(yAxisTicks(0, 0)).toEqual([]);
    expect(yAxisTicks(NaN, 100)).toEqual([]);
    expect(yAxisTicks(70, 70)).toEqual([]);
    expect(xAxisTicks(70, 220, 0, true)).toEqual([]);
    expect(xAxisTicks(70, 220, NaN, true)).toEqual([]);
  });

  it("collapse the duplicates a short range rounds onto the same value", () => {
    // Was returned as [70, 70, 80, 80] and [0, 1, 1, 2, 2, 3, 3, 3].
    expect(yAxisTicks(70, 80)).toEqual([70, 80]);
    expect(xAxisTicks(70, 80, 3, true)).toEqual([0, 1, 2, 3]);
  });
});

describe("dateToPower", () => {
  const graphSymbols = buildGraphSeries(
    [
      {
        name: "A",
        level: 1,
        progress: [
          { level: 2, date: "2026-09-18" },
          { level: 3, date: "2026-09-25" },
        ],
      },
    ],
    60,
    true,
    now
  ).graphSymbols;

  it("finds the first date the series reaches the target rounded up to tens", () => {
    expect(dateToPower(65, 60, graphSymbols, true, now)).toBe("2026-09-18"); // 70 → day 2
    expect(dateToPower(80, 60, graphSymbols, true, now)).toBe("2026-09-25"); // 80 → day 9
  });

  it("is empty when the target is not above the current power or is unreachable", () => {
    expect(dateToPower(60, 60, graphSymbols, true, now)).toBe("");
    expect(dateToPower(NaN, 60, graphSymbols, true, now)).toBe("");
    expect(dateToPower(500, 60, graphSymbols, true, now)).toBe("");
  });
});
