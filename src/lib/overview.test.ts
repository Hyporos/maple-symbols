import { describe, expect, it } from "vitest";
import { BLANK, collapsedRowLabels, targetPanelLabels } from "./overview";
import { createInitialSymbols } from "./data";

const vj = (patch = {}) => ({ ...createInitialSymbols()[0], ...patch });
const active = (patch = {}) =>
  vj({
    level: 5,
    experience: 0,
    daily: true,
    daysRemaining: 12,
    completion: "2026-09-28",
    symbolsRemaining: 2500,
    ...patch,
  });

describe("collapsedRowLabels", () => {
  it("shows the stored values for an active symbol", () => {
    expect(collapsedRowLabels(active(), 20)).toEqual({
      target: "20",
      completion: "2026-09-28",
      days: "12 days",
      remaining: "2500",
    });
    expect(collapsedRowLabels(active({ daysRemaining: 1 }), 20).days).toBe("1 day");
  });

  it("blanks everything but the target column for unset and maxed symbols", () => {
    expect(collapsedRowLabels(vj(), 20)).toEqual({
      target: "0",
      completion: BLANK,
      days: BLANK,
      remaining: BLANK,
    });
    expect(collapsedRowLabels(active({ level: 20 }), 20).target).toBe("MAX");
    expect(collapsedRowLabels(active({ level: 20 }), 20).days).toBe(BLANK);
  });

  it("maps zeroed derived fields to Complete / Ready for upgrade / 0 (KI-002)", () => {
    expect(
      collapsedRowLabels(active({ daysRemaining: 0, completion: "", symbolsRemaining: 0 }), 20)
    ).toMatchObject({
      completion: "Complete",
      days: "Ready for upgrade",
      remaining: "0",
    });
  });

  it("shows Indefinite / ? days with no quests, NaN experience, or an unreachable date", () => {
    expect(collapsedRowLabels(active({ daily: false }), 20)).toMatchObject({
      completion: "Indefinite",
      days: "? days",
    });
    expect(collapsedRowLabels(active({ experience: NaN }), 20)).toMatchObject({
      completion: "Indefinite",
      days: "? days",
    });
    expect(
      collapsedRowLabels(active({ completion: "Invalid Date", daysRemaining: Infinity }), 20)
    ).toMatchObject({
      completion: "Indefinite",
      days: "? days",
    });
  });

  it("shows ? for NaN symbols remaining and 0 for negatives", () => {
    expect(collapsedRowLabels(active({ symbolsRemaining: NaN }), 20).remaining).toBe("?");
    expect(collapsedRowLabels(active({ symbolsRemaining: -5 }), 20).remaining).toBe("0");
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
