import { describe, expect, it } from "vitest";
import { getOverflow, getRemainingToMax, progressToMax } from "./calculator";
import { createInitialSymbols } from "./data";
import { dayjs } from "./dayjs";
import { WED } from "../test/helpers";

const vj = (patch = {}) => ({ ...createInitialSymbols()[0], ...patch });
const cernium = (patch = {}) => ({ ...createInitialSymbols()[6], ...patch });

describe("getRemainingToMax", () => {
  it("sums the remaining table from the current level minus experience", () => {
    expect(getRemainingToMax(vj({ level: 1, experience: 0 }), 20)).toBe(2679);
    expect(getRemainingToMax(vj({ level: 19, experience: 100 }), 20)).toBe(272);
    expect(getRemainingToMax(cernium({ level: 1, experience: 0 }), 11)).toBe(4565);
    expect(getRemainingToMax(vj({ level: 20, experience: 0 }), 20)).toBe(0);
  });

  it("propagates NaN experience", () => {
    expect(getRemainingToMax(vj({ level: 3, experience: NaN }), 20)).toBeNaN();
  });
});

describe("progressToMax", () => {
  const NOW = dayjs(WED); // Wednesday 2026-09-16

  it("derives symbols, days and completion date from level/exp/quests", () => {
    expect(progressToMax(vj({ level: 1, experience: 0, daily: true }), NOW)).toEqual({
      symbolsRemaining: 2679,
      daysRemaining: 268,
      completion: "2027-06-11",
    });
    expect(progressToMax(cernium({ level: 1, experience: 0, daily: true }), NOW)).toMatchObject({
      symbolsRemaining: 4565,
      daysRemaining: 229, // 20/day
    });
  });

  it("is 0 days / today once max is covered, Infinity without quests, NaN when unset", () => {
    expect(progressToMax(vj({ level: 20, experience: 0 }), NOW)).toEqual({
      symbolsRemaining: 0,
      daysRemaining: 0,
      completion: "2026-09-16",
    });
    expect(progressToMax(vj({ level: 5, experience: 0 }), NOW)).toMatchObject({
      daysRemaining: Infinity,
      completion: "Invalid Date",
    });
    const unset = progressToMax(vj({ level: 5, experience: NaN, daily: true }), NOW);
    expect(unset.symbolsRemaining).toBeNaN();
    expect(unset.daysRemaining).toBeNaN();
    expect(unset.completion).toBe("Invalid Date");
  });
});

describe("getOverflow", () => {
  it("converts unlocked experience into levels with the leftover", () => {
    expect(getOverflow(vj({ level: 1, experience: 50 }))).toEqual({ level: 4, experience: 3 }); // 12+15+20 = 47
    expect(getOverflow(vj({ level: 1, experience: 11 }))).toEqual({ level: 1, experience: 11 });
    expect(getOverflow(vj({ level: 1, experience: 12 }))).toEqual({ level: 2, experience: 0 });
  });

  it("keeps leftover experience even when it reaches max (KI-005)", () => {
    expect(getOverflow(vj({ level: 19, experience: 2679 }))).toEqual({
      level: 20,
      experience: 2307,
    });
  });

  it("is a no-op for an unset level", () => {
    const result = getOverflow(vj({ level: NaN, experience: 40 }));
    expect(result.level).toBeNaN();
    expect(result.experience).toBe(40);
  });
});
