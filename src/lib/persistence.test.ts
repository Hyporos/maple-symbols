import { describe, expect, it } from "vitest";
import { restoreSymbols, toSaved } from "./persistence";
import { createInitialSymbols } from "./data";
import { updateSymbol } from "./utils";

const fresh = () => createInitialSymbols();

describe("toSaved", () => {
  it("keeps only id and the player's fields, with NaN as null", () => {
    const symbols = updateSymbol(fresh(), 1, { level: 5, experience: NaN, daily: true });
    const [vj, , , , , , cernium] = toSaved(symbols);
    expect(vj).toEqual({
      id: 1,
      level: 5,
      experience: null,
      daily: true,
      weekly: false,
      extra: false,
      locked: true,
    });
    // Cernium has no weekly or extra quest, so neither key is written.
    expect(cernium).toEqual({ id: 7, level: null, experience: null, daily: false, locked: true });
  });

  it("round-trips through JSON and restoreSymbols unchanged", () => {
    const symbols = updateSymbol(updateSymbol(fresh(), 1, { level: 5, experience: 12 }), 7, {
      level: 3,
      daily: true,
      locked: false,
    });
    const reloaded = JSON.parse(JSON.stringify(toSaved(symbols)));
    expect(restoreSymbols(reloaded, fresh())).toEqual(symbols);
  });
});

describe("restoreSymbols (KI-001)", () => {
  it("takes game data from symbols.json even when the save holds stale values", () => {
    const stale = [
      { ...fresh()[0], level: 9, dailySymbols: 999, name: "Old Name", mesosRequired: [1] },
    ];
    const [vj] = restoreSymbols(stale, fresh());
    expect(vj.level).toBe(9);
    expect(vj.dailySymbols).toBe(fresh()[0].dailySymbols);
    expect(vj.name).toBe("Vanishing Journey");
    expect(vj.mesosRequired).toBe(fresh()[0].mesosRequired);
  });

  it("returns every current symbol, in symbols.json order, even from a partial save", () => {
    const restored = restoreSymbols([{ id: 3, level: 7 }], fresh());
    expect(restored.map((s) => s.id)).toEqual(fresh().map((s) => s.id));
    expect(restored[2].level).toBe(7);
    expect(restored[0].level).toBeNaN(); // not in the save: fresh default
  });

  it("ignores records for symbols that no longer exist", () => {
    const restored = restoreSymbols([{ id: 99, level: 20 }], fresh());
    expect(restored).toEqual(fresh());
  });

  it("reads null and unreadable numbers as unset, and ignores wrongly typed flags", () => {
    const [vj] = restoreSymbols(
      [{ id: 1, level: null, experience: "12", daily: "yes", locked: 0 }],
      fresh()
    );
    expect(vj.level).toBeNaN();
    expect(vj.experience).toBeNaN();
    expect(vj.daily).toBe(false);
    expect(vj.locked).toBe(true);
  });

  it("only restores weekly and extra on symbols that still have that quest", () => {
    const [, chuchu, lachelein, , , , cernium] = restoreSymbols(
      [
        { id: 2, extra: true, weekly: true },
        { id: 3, extra: true, weekly: true },
        { id: 7, extra: true, weekly: true },
      ],
      fresh()
    );
    expect(chuchu).toMatchObject({ extra: true, weekly: true });
    expect(lachelein.weekly).toBe(true);
    expect(lachelein).not.toHaveProperty("extra");
    expect(cernium).not.toHaveProperty("weekly");
    expect(cernium).not.toHaveProperty("extra");
  });

  it("falls back to fresh symbols for anything that is not a list of records", () => {
    for (const junk of [undefined, null, "symbols", 42, { 1: { level: 5 } }, [null, 5, "x"]]) {
      expect(restoreSymbols(junk, fresh())).toEqual(fresh());
    }
  });
});
