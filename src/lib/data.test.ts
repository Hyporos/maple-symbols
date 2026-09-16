import { describe, expect, it } from "vitest";
import { createInitialSymbols } from "./data";
import symbolsJson from "./symbols.json";

describe("createInitialSymbols", () => {
  const symbols = createInitialSymbols();

  it("yields 12 symbols: ids 1-12, arcane at indices 0-5, sacred at 6-11", () => {
    expect(symbols).toHaveLength(12);
    expect(symbols.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(symbols.slice(0, 6).every((s) => s.type === "arcane")).toBe(true);
    expect(symbols.slice(6).every((s) => s.type === "sacred")).toBe(true);
  });

  it("starts every symbol unset (NaN level/exp), quests off, cap locked, nothing derived", () => {
    for (const s of symbols) {
      expect(s.level).toBeNaN();
      expect(s.experience).toBeNaN();
      expect(s).toMatchObject({ daily: false, locked: true });
      expect(s).not.toHaveProperty("symbolsRemaining");
    }
  });

  it("creates weekly only on arcane symbols and extra only on VJ and Chu Chu", () => {
    expect(symbols.slice(0, 6).every((s) => s.weekly === false)).toBe(true);
    expect(symbols.slice(6).every((s) => !("weekly" in s))).toBe(true);
    expect(symbols.filter((s) => "extra" in s).map((s) => s.name)).toEqual([
      "Vanishing Journey",
      "Chu Chu Island",
    ]);
  });

  it("attaches the per-type exp table as symbolsRequired (20 arcane steps, 11 sacred)", () => {
    expect(symbols[0].symbolsRequired).toBe(symbolsJson.arcaneExpRequired);
    expect(symbols[6].symbolsRequired).toBe(symbolsJson.sacredExpRequired);
    expect(symbols[0].symbolsRequired).toHaveLength(20);
    expect(symbols[6].symbolsRequired).toHaveLength(11);
    expect(symbols[0].mesosRequired).toHaveLength(20);
    expect(symbols[6].mesosRequired).toHaveLength(11);
  });
});
