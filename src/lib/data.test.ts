import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createInitialSymbols } from "./data";
import { isMode, selectorWorksOn } from "./game";
import symbolsJson from "./symbols.json";

describe("createInitialSymbols", () => {
  const symbols = createInitialSymbols();

  it("yields 14 symbols: ids 1-14, arcane at indices 0-5, sacred at 6-11, grand at 12-13", () => {
    expect(symbols).toHaveLength(14);
    expect(symbols.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    expect(symbols.slice(0, 6).every((s) => s.type === "arcane")).toBe(true);
    expect(symbols.slice(6, 12).every((s) => s.type === "sacred")).toBe(true);
    expect(symbols.slice(12).map((s) => [s.name, s.type])).toEqual([
      ["Tallahart", "grand"],
      ["Geardock", "grand"],
    ]);
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

  it("attaches the per-type exp table as symbolsRequired (20 arcane steps, 11 sacred and grand)", () => {
    expect(symbols[0].symbolsRequired).toBe(symbolsJson.arcaneExpRequired);
    expect(symbols[6].symbolsRequired).toBe(symbolsJson.sacredExpRequired);
    // Grand Sacred levels on the Sacred table (confirmed in game, GAME §4).
    expect(symbols[12].symbolsRequired).toBe(symbolsJson.sacredExpRequired);
    expect(symbols[13].symbolsRequired).toBe(symbolsJson.sacredExpRequired);
    expect(symbols[0].symbolsRequired).toHaveLength(20);
    expect(symbols[6].symbolsRequired).toHaveLength(11);
    expect(symbols[0].mesosRequired).toHaveLength(20);
    expect(symbols[6].mesosRequired).toHaveLength(11);
    expect(symbols[12].mesosRequired).toHaveLength(11);
    expect(symbols[13].mesosRequired).toHaveLength(11);
  });

  it("gives the Grand Sacred symbols their confirmed data (GAME §4)", () => {
    const [tallahart, geardock] = symbols.slice(12);
    const total = (table: number[]) => table.reduce((a, b) => a + b, 0);
    // Brian saw both totals in game on 2026-09-22.
    expect(total(tallahart.mesosRequired)).toBe(16_072_800_000);
    expect(total(geardock.mesosRequired)).toBe(20_181_300_000);
    expect(tallahart).toMatchObject({
      dailyName: "Investigate the Tallahart Ancient God's Power",
      dailySymbols: 15,
    });
    expect(geardock).toMatchObject({ dailyName: "Cleaning Up Kronos", dailySymbols: 15 });
    for (const s of [tallahart, geardock]) {
      expect(s.weeklyName).toBeUndefined();
      expect(s.extraName).toBeUndefined();
    }
  });

  it("lets the Symbol Selector level every symbol but Geardock", () => {
    expect(symbols.filter((s) => !selectorWorksOn(s)).map((s) => s.name)).toEqual(["Geardock"]);
  });

  it("has an image for every symbol the interface lists (Grand Sacred has none yet, GAME §4)", () => {
    for (const s of symbols.filter((s) => isMode(s.type))) {
      expect(existsSync(`public${s.img}`), s.img).toBe(true);
    }
  });
});
