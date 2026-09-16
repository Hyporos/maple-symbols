import { describe, expect, it, vi } from "vitest";
import {
  advanceDayCount,
  calculateDaysRemaining,
  cn,
  getDailySymbols,
  getRemainingSymbols,
  INITIAL_DAY_COUNT,
  isMaxLevel,
  isValid,
  updateSymbol,
} from "./utils";
import { createInitialSymbols } from "./data";
import { MON, SAT, SUN, WED } from "../test/helpers";

// Fixtures: index 0 = Vanishing Journey (arcane, 10/day, weekly + extra);
// index 6 = Cernium (sacred, 20/day, no weekly/extra).
const vj = () => createInitialSymbols()[0];
const cernium = () => createInitialSymbols()[6];

describe("cn", () => {
  it("merges Tailwind conflicts so the last class wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-accent", "text-secondary", "text-primary")).toBe("text-primary");
    expect(cn("text-sm", "md:text-base")).toBe("text-sm md:text-base");
  });

  it("drops falsy values", () => {
    const isOpen = false as boolean;
    expect(cn("hidden", isOpen && "block", undefined, null, "")).toBe("hidden");
  });
});

describe("isValid / isMaxLevel", () => {
  it("treats NaN as the only invalid level", () => {
    expect(isValid(NaN)).toBe(false);
    expect(isValid(0)).toBe(true);
    expect(isValid(20)).toBe(true);
  });

  it("uses 20 for arcane (swapped=false) and 11 for sacred (swapped=true)", () => {
    expect(isMaxLevel(20, false)).toBe(true);
    expect(isMaxLevel(11, false)).toBe(false);
    expect(isMaxLevel(11, true)).toBe(true);
    expect(isMaxLevel(NaN, true)).toBe(false);
  });
});

describe("updateSymbol", () => {
  it("returns a new array, patching only the given index", () => {
    const input = createInitialSymbols();
    const out = updateSymbol(input, 2, { level: 7 });
    expect(out).not.toBe(input);
    expect(out[2]).toMatchObject({ level: 7, name: "Lachelein" });
    expect(out[0]).toBe(input[0]);
    expect(input[2].level).toBeNaN();
  });

  it("leaves everything untouched for an out-of-range index", () => {
    const input = createInitialSymbols();
    expect(updateSymbol(input, 99, { level: 1 })).toEqual(input);
  });
});

describe("getDailySymbols", () => {
  it("is 0 while the daily quest is off, even with extra on", () => {
    expect(getDailySymbols({ ...vj(), daily: false, extra: true })).toBe(0);
  });

  it("doubles arcane and multiplies sacred by 1.5 when extra is on", () => {
    expect(getDailySymbols({ ...vj(), daily: true })).toBe(10);
    expect(getDailySymbols({ ...vj(), daily: true, extra: true })).toBe(20);
    expect(getDailySymbols({ ...cernium(), daily: true, extra: true })).toBe(30);
  });
});

describe("getRemainingSymbols", () => {
  it("sums symbolsRequired[level..nextLevel) minus current experience", () => {
    const s = { ...vj(), level: 1, experience: 0 };
    expect(getRemainingSymbols(2, s)).toBe(12);
    expect(getRemainingSymbols(3, s)).toBe(27);
    expect(getRemainingSymbols(2, { ...s, experience: 5 })).toBe(7);
  });

  it("knows the full-table totals (the unlocked exp caps)", () => {
    expect(getRemainingSymbols(20, { ...vj(), level: 1, experience: 0 })).toBe(2679);
    expect(getRemainingSymbols(11, { ...cernium(), level: 1, experience: 0 })).toBe(4565);
  });

  it("goes negative when the target is at or below the current level", () => {
    expect(getRemainingSymbols(5, { ...vj(), level: 5, experience: 3 })).toBe(-3);
  });
});

describe("calculateDaysRemaining", () => {
  it("handles the sentinels: nothing needed → 0, NaN → NaN, no progress possible → Infinity", () => {
    expect(calculateDaysRemaining(0, 10, false)).toBe(0);
    expect(calculateDaysRemaining(-5, 0, false)).toBe(0);
    expect(calculateDaysRemaining(NaN, 10, true)).toBeNaN();
    expect(calculateDaysRemaining(50, 0, false)).toBe(Infinity);
  });

  it("daily only: ceil(needed / daily)", () => {
    expect(calculateDaysRemaining(1, 10, false)).toBe(1);
    expect(calculateDaysRemaining(10, 10, false)).toBe(1);
    expect(calculateDaysRemaining(12, 10, false)).toBe(2);
    expect(calculateDaysRemaining(95, 10, false)).toBe(10);
    expect(calculateDaysRemaining(100, 10, false)).toBe(10);
  });

  // The weekly (+120) is credited relative to dayjs().day(8), so results depend on
  // the weekday "today" is. Time must be frozen (see docs/TESTING.md → Time).
  // These values pin the algorithm as it is today, including the known
  // one-day-late credit (docs/KNOWN_ISSUES.md).
  describe("weekly only, with time frozen", () => {
    it.each([
      ["Wednesday", WED, 6],
      ["Monday", MON, 8],
      ["Saturday", SAT, 3],
      ["Sunday", SUN, 9], // KI-003: the very next Monday is skipped from a Sunday start
    ])("%s: one weekly's worth (120) takes %i days", (_day, date, expected) => {
      vi.setSystemTime(date);
      expect(calculateDaysRemaining(120, 0, true)).toBe(expected);
      expect(calculateDaysRemaining(1, 0, true)).toBe(expected);
    });

    it("needs a second reset once the first 120 is exceeded", () => {
      vi.setSystemTime(WED);
      expect(calculateDaysRemaining(121, 0, true)).toBe(13);
    });
  });

  it("daily + weekly combine (Wednesday)", () => {
    vi.setSystemTime(WED);
    expect(calculateDaysRemaining(200, 20, true)).toBe(6);
    expect(calculateDaysRemaining(200, 20, false)).toBe(10);
  });
});

describe("advanceDayCount", () => {
  it("returns the same state object when nothing is needed", () => {
    expect(advanceDayCount(INITIAL_DAY_COUNT, 0, 10, false)).toBe(INITIAL_DAY_COUNT);
  });

  it("threads Monday/weekly tracking across calls without mutating its input (Graph usage)", () => {
    vi.setSystemTime(WED);
    const first = advanceDayCount(INITIAL_DAY_COUNT, 12, 20, true);
    expect(first).toEqual({ days: 1, countToMonday: 1, weeklyResets: 0, mondayReached: false });
    const second = advanceDayCount(first, 27, 20, true);
    expect(second).toEqual({ days: 2, countToMonday: 2, weeklyResets: 0, mondayReached: false });
    expect(first.days).toBe(1);
    expect(INITIAL_DAY_COUNT).toEqual({
      days: 0,
      countToMonday: 0,
      weeklyResets: 0,
      mondayReached: false,
    });
  });
});
