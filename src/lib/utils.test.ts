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

  it("uses 20 for arcane and 11 for sacred", () => {
    expect(isMaxLevel(20, "arcane")).toBe(true);
    expect(isMaxLevel(11, "arcane")).toBe(false);
    expect(isMaxLevel(11, "sacred")).toBe(true);
    expect(isMaxLevel(NaN, "sacred")).toBe(false);
  });
});

describe("updateSymbol", () => {
  it("returns a new array, patching only the symbol with the given id", () => {
    const input = createInitialSymbols();
    const out = updateSymbol(input, 3, { level: 7 });
    expect(out).not.toBe(input);
    expect(out[2]).toMatchObject({ level: 7, name: "Lachelein" });
    expect(out[0]).toBe(input[0]);
    expect(input[2].level).toBeNaN();
  });

  it("leaves everything untouched for an unknown id", () => {
    const input = createInitialSymbols();
    expect(updateSymbol(input, 99, { level: 1 })).toEqual(input);
  });
});

describe("getDailySymbols", () => {
  it("is 0 while the daily quest is off, even with extra on", () => {
    expect(getDailySymbols({ ...vj(), daily: false, extra: true })).toBe(0);
  });

  it("doubles arcane and multiplies sacred by 1.5 when extra is on", () => {
    expect(getDailySymbols({ ...vj(), daily: true })).toBe(20);
    expect(getDailySymbols({ ...vj(), daily: true, extra: true })).toBe(40);
    expect(getDailySymbols({ ...cernium(), daily: true, extra: true })).toBe(45);
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

  // The weekly lands on the first Thursday counted, and counting starts tomorrow, so the
  // answer is the distance to the next Thursday (GMS moved the reset off Monday in v.264;
  // Brian confirmed it in game, GAME §3). Time must be frozen (docs/TESTING.md → Time).
  describe("weekly only, with time frozen", () => {
    it.each([
      ["Sunday", SUN, 4], // Sun 13 → Thu 17
      ["Monday", MON, 3], // Mon 14 → Thu 17
      ["Wednesday", WED, 1], // tomorrow is Thursday
      ["Saturday", SAT, 5], // Sat 19 → Thu 24, today's reset is spent
    ])("%s: one weekly's worth (240) takes %i days", (_day, date, expected) => {
      vi.setSystemTime(date);
      expect(calculateDaysRemaining(240, 0, true)).toBe(expected);
      expect(calculateDaysRemaining(1, 0, true)).toBe(expected);
    });

    it("needs a second reset once the first 240 is exceeded", () => {
      vi.setSystemTime(WED);
      expect(calculateDaysRemaining(241, 0, true)).toBe(8); // Thursdays at day 1 and day 8
    });
  });

  it("daily + weekly combine (Wednesday)", () => {
    vi.setSystemTime(WED);
    expect(calculateDaysRemaining(200, 20, true)).toBe(1); // 20 from tomorrow's daily + 240 on Thursday
    expect(calculateDaysRemaining(200, 20, false)).toBe(10);
  });
});

describe("advanceDayCount", () => {
  it("returns the same state object when nothing is needed", () => {
    expect(advanceDayCount(INITIAL_DAY_COUNT, 0, 10, false)).toBe(INITIAL_DAY_COUNT);
  });

  it("threads days and credit across calls without mutating its input (Graph usage)", () => {
    vi.setSystemTime(WED);
    // Each call takes the cumulative target, not a delta, and resumes where the last stopped.
    const first = advanceDayCount(INITIAL_DAY_COUNT, 12, 20, false);
    expect(first).toEqual({ days: 1, credited: 20 });
    const second = advanceDayCount(first, 27, 20, false);
    expect(second).toEqual({ days: 2, credited: 40 });
    expect(first).toEqual({ days: 1, credited: 20 });
    expect(INITIAL_DAY_COUNT).toEqual({ days: 0, credited: 0 });
  });

  it("credits the weekly on a counted Thursday, and keeps it across a threaded call", () => {
    vi.setSystemTime(WED); // tomorrow is Thursday
    const toThursday = advanceDayCount(INITIAL_DAY_COUNT, 200, 20, true);
    expect(toThursday).toEqual({ days: 1, credited: 260 }); // 1 × 20 + 240
    // Already past the new target, so the walk does not move.
    expect(advanceDayCount(toThursday, 150, 20, true)).toEqual(toThursday);
  });
});
