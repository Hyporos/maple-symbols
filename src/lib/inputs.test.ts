import { describe, expect, it } from "vitest";
import { clampNumberInput, expCapFor, experienceInputValue, levelInputPatch } from "./inputs";
import { createInitialSymbols } from "./data";

const vj = (patch = {}) => ({ ...createInitialSymbols()[0], ...patch });

describe("clampNumberInput", () => {
  it.each([
    ["-3", 20, NaN],
    ["0", 20, 1],
    ["20", 20, 20],
    ["25", 20, 20],
    ["7", 20, 7],
    ["", 20, NaN],
    ["00", 20, 0], // KI-010: only the literal "0" is remapped
    ["0.5", 20, 0],
  ])("%s with max %i → %s", (raw, max, expected) => {
    const result = clampNumberInput(raw, max);
    if (Number.isNaN(expected)) expect(result).toBeNaN();
    else expect(result).toBe(expected);
  });
});

describe("levelInputPatch", () => {
  it("resets experience only when the level lands on max", () => {
    expect(levelInputPatch("25", 20)).toEqual({ level: 20, experience: 0 });
    expect(levelInputPatch("7", 20)).toEqual({ level: 7 });
    expect(levelInputPatch("15", 11)).toEqual({ level: 11, experience: 0 });
    expect(levelInputPatch("-1", 20).level).toBeNaN();
  });
});

describe("expCapFor", () => {
  it("is the next-level requirement while locked, the table total when unlocked", () => {
    expect(expCapFor(vj({ level: 1, locked: true }))).toBe(12);
    expect(expCapFor(vj({ level: 5, locked: true }))).toBe(36);
    expect(expCapFor(vj({ level: 5, locked: false }))).toBe(2679);
  });

  it("is undefined at max level while locked (KI-004: the cap is effectively off)", () => {
    expect(expCapFor(vj({ level: 20, locked: true }))).toBeUndefined();
  });
});

describe("experienceInputValue", () => {
  it("clears experience when the level is unset", () => {
    expect(experienceInputValue("50", NaN, 12)).toBeNaN();
  });

  it("caps at expCap, rejects negatives, and parses otherwise", () => {
    expect(experienceInputValue("50", 1, 12)).toBe(12);
    expect(experienceInputValue("12", 1, 12)).toBe(12);
    expect(experienceInputValue("-4", 1, 12)).toBeNaN();
    expect(experienceInputValue("7", 1, 12)).toBe(7);
    expect(experienceInputValue("", 1, 12)).toBeNaN();
  });

  it("treats 0 specially at level 1 (an owned symbol has at least 1 exp)", () => {
    expect(experienceInputValue("0", 1, 12)).toBe(1);
    expect(experienceInputValue("00", 1, 12)).toBe(1);
    expect(experienceInputValue("0", 5, 36)).toBe(0);
    expect(experienceInputValue("00", 5, 36)).toBeNull(); // handler rewrites the field instead
  });

  it("accepts anything when the cap is undefined (max level, KI-004)", () => {
    expect(experienceInputValue("999", 20, undefined as unknown as number)).toBe(999);
  });
});
