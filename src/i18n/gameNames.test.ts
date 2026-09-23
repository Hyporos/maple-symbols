import { describe, expect, it } from "vitest";
import { createInitialSymbols } from "../lib/data";
import { GAME_NAMES, symbolNames } from "./gameNames";

describe("symbolNames", () => {
  it("gives the GMS English names from symbols.json for the GMS name set", () => {
    for (const symbol of createInitialSymbols()) {
      expect(symbolNames(symbol, "en-gms")).toEqual({
        name: symbol.name,
        dailyName: symbol.dailyName,
        weeklyName: symbol.weeklyName,
        extraName: symbol.extraName,
      });
    }
  });

  it("never invents a weekly or extra quest name for a symbol that has none", () => {
    const cernium = createInitialSymbols().find((s) => s.id === 7)!;
    for (const nameSet of ["en-gms", "en-msea", "ja"] as const) {
      expect(symbolNames(cernium, nameSet).weeklyName).toBeUndefined();
      expect(symbolNames(cernium, nameSet).extraName).toBeUndefined();
    }
  });

  it("gives MSEA its own client's names and falls back to GMS English for the rest (D-19)", () => {
    const byId = new Map(createInitialSymbols().map((s) => [s.id, s]));
    expect(symbolNames(byId.get(1)!, "en-msea")).toEqual({
      name: "Road to Extinction",
      dailyName: "Vanishing Journey Research", // not published for MSEA yet
      weeklyName: "Erda Spectrum",
      extraName: "Reverse City",
    });
    expect(symbolNames(byId.get(5)!, "en-msea").weeklyName).toBe("Enheim Defense");
    expect(symbolNames(byId.get(8)!, "en-msea").name).toBe("Hotel Arcs");
    expect(symbolNames(byId.get(10)!, "en-msea").name).toBe("Shangri-La");
  });

  it("only names symbols that exist, and never a weekly or extra the symbol lacks", () => {
    const byId = new Map(createInitialSymbols().map((s) => [s.id, s]));
    for (const [nameSet, names] of Object.entries(GAME_NAMES)) {
      for (const [id, fields] of Object.entries(names)) {
        const symbol = byId.get(Number(id));
        expect(symbol, `${nameSet} ${id}`).toBeDefined();
        if (symbol!.weeklyName === undefined) expect(fields.weeklyName).toBeUndefined();
        if (symbol!.extraName === undefined) expect(fields.extraName).toBeUndefined();
      }
    }
  });
});
