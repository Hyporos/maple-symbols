import { describe, expect, it } from "vitest";
import { BLANK, collapsedRowLabels, targetPanelLabels } from "./overview";
import { createInitialSymbols } from "./data";
import { dayjs } from "./dayjs";
import { WED } from "../test/helpers";
import { en } from "../i18n/en";

const vj = (patch = {}) => ({ ...createInitialSymbols()[0], ...patch });
const active = (patch = {}) => vj({ level: 5, experience: 0, daily: true, ...patch });
const NOW = dayjs(WED); // Wednesday 2026-09-16
const m = en.overview;
const ARCANE = createInitialSymbols()[0].symbolsRequired;

describe("collapsedRowLabels", () => {
  it("derives date, days and symbols remaining from level/exp/quests (frozen Wednesday)", () => {
    // 2605 symbols to max at 20/day → 131 days → 2027-01-25
    expect(collapsedRowLabels(active(), 20, m, NOW)).toEqual({
      target: "20",
      completion: "2027-01-25",
      days: "131 days",
      remaining: "2605",
    });
    // level 19 with 10 short of the last step → 1 day
    const almost = active({ level: 19, experience: ARCANE[19] - 10 });
    expect(collapsedRowLabels(almost, 20, m, NOW)).toMatchObject({
      completion: "2026-09-17",
      days: "1 day",
      remaining: "10",
    });
  });

  it("is fresh for every symbol, not just the selected one (KI-002 resolved)", () => {
    const lachelein = { ...createInitialSymbols()[2], level: 5, experience: 0, daily: true };
    expect(collapsedRowLabels(lachelein, 20, m, NOW).days).toBe("66 days"); // 2605 at 40/day
  });

  it("blanks everything but the target column for unset and maxed symbols", () => {
    expect(collapsedRowLabels(vj(), 20, m, NOW)).toEqual({
      target: "0",
      completion: BLANK,
      days: BLANK,
      remaining: BLANK,
    });
    expect(collapsedRowLabels(active({ level: 20 }), 20, m, NOW).target).toBe("MAX");
    expect(collapsedRowLabels(active({ level: 20 }), 20, m, NOW).days).toBe(BLANK);
  });

  it("says Complete / Ready for upgrade / 0 once the experience covers max", () => {
    const ready = active({ level: 19, experience: ARCANE[19] });
    expect(collapsedRowLabels(ready, 20, m, NOW)).toMatchObject({
      completion: "Complete",
      days: "Ready for upgrade",
      remaining: "0",
    });
    const overflow = active({ level: 19, experience: ARCANE[19] + 5 }); // negative remaining
    expect(collapsedRowLabels(overflow, 20, m, NOW).remaining).toBe("0");
  });

  it("shows Indefinite / ? days with no quests, and ? symbols with NaN experience", () => {
    expect(collapsedRowLabels(active({ daily: false }), 20, m, NOW)).toMatchObject({
      completion: "Indefinite",
      days: "? days",
      remaining: "2605",
    });
    expect(collapsedRowLabels(active({ experience: NaN }), 20, m, NOW)).toMatchObject({
      completion: "Indefinite",
      days: "? days",
      remaining: "?",
    });
  });
});

describe("targetPanelLabels", () => {
  const base = {
    rowLevel: 5,
    current: vj({ level: 5, experience: 0, daily: true }),
    targetLevel: 6,
    targetSymbols: 36,
    targetDays: 4,
    targetDate: "2026-09-20",
    isTablet: false,
    m,
  };

  it("reports the target's symbols, days and date", () => {
    expect(targetPanelLabels(base)).toEqual({
      completion: "2026-09-20",
      days: "4 days",
      remaining: "36",
    });
    expect(targetPanelLabels({ ...base, targetDays: 1 }).days).toBe("1 day");
  });

  it("explains a target at or below the current level, with shorter copy on tablets", () => {
    const low = { ...base, targetLevel: 3, targetSymbols: -74 };
    expect(targetPanelLabels(low)).toEqual({
      completion: "Indefinite",
      days: "Level must be over 5",
      remaining: "0",
    });
    expect(targetPanelLabels({ ...low, isTablet: true }).days).toBe("Level too low");
  });

  it("asks for a target when none is set", () => {
    const empty = {
      ...base,
      targetLevel: NaN,
      targetSymbols: NaN,
      targetDays: NaN,
      targetDate: "Invalid Date",
    };
    expect(targetPanelLabels(empty)).toEqual({
      completion: "Indefinite",
      days: "Enter a target level",
      remaining: "?",
    });
    expect(targetPanelLabels({ ...empty, isTablet: true }).days).toBe("Enter a level");
  });

  it("shows ? days without quests even for a valid target", () => {
    const noQuests = {
      ...base,
      current: vj({ level: 5, experience: 0 }),
      targetDays: Infinity,
      targetDate: "Invalid Date",
    };
    expect(targetPanelLabels(noQuests)).toEqual({
      completion: "Indefinite",
      days: "? days",
      remaining: "36",
    });
  });

  it("says Complete / Ready for upgrade when the experience already covers the target", () => {
    const done = {
      ...base,
      current: vj({ level: 5, experience: 36, daily: true }),
      targetSymbols: 0,
      targetDays: 0,
    };
    expect(targetPanelLabels(done)).toMatchObject({
      completion: "Complete",
      days: "Ready for upgrade",
    });
  });
});
