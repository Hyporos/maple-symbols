import { describe, expect, it } from "vitest";
import { createInitialSymbols } from "../lib/data";
import { symbolNames } from "./gameNames";

describe("symbolNames", () => {
  it("gives the English names from symbols.json for the default language", () => {
    for (const symbol of createInitialSymbols()) {
      expect(symbolNames(symbol, "en")).toEqual({
        name: symbol.name,
        dailyName: symbol.dailyName,
        weeklyName: symbol.weeklyName,
        extraName: symbol.extraName,
      });
    }
  });

  it("never invents a weekly or extra quest name for a symbol that has none", () => {
    const cernium = createInitialSymbols().find((s) => s.id === 7)!;
    expect(symbolNames(cernium, "en").weeklyName).toBeUndefined();
    expect(symbolNames(cernium, "en").extraName).toBeUndefined();
  });
});
