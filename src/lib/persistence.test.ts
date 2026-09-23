import { describe, expect, it } from "vitest";
import { isRegion, migrateSaved, readSaves, restoreSymbols, toSaved } from "./persistence";
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

describe("per-server saves (STORAGE_VERSION 4)", () => {
  it("knows the six servers and nothing else", () => {
    for (const region of ["gms", "msea", "kms", "jms", "tms", "cms"])
      expect(isRegion(region)).toBe(true);
    for (const other of ["GMS", "europe", "", null, 3]) expect(isRegion(other)).toBe(false);
  });

  it("keeps only known servers' slots", () => {
    expect(readSaves({ gms: [1], kms: [2], europe: [3] })).toEqual({ gms: [1], kms: [2] });
    expect(readSaves(null)).toEqual({});
    expect(readSaves([1, 2])).toEqual({});
  });

  it("turns an older single list into the GMS save and leaves version 4 alone", () => {
    const list = [{ id: 1, level: 3 }];
    expect(migrateSaved({ symbols: list }, 3)).toEqual({
      saves: { gms: list },
      regionOverride: null,
    });
    expect(migrateSaved({ symbols: list }, 2)).toEqual({
      saves: { gms: list },
      regionOverride: null,
    });
    const current = { saves: { kms: list }, regionOverride: "kms" };
    expect(migrateSaved(current, 4)).toBe(current);
  });
});

describe("Grand Sacred (ids 13 and 14) and existing saves", () => {
  it("restores a save made before they existed, and adds them unset with no version bump", () => {
    // A version 4 save from the 12-symbol site: every symbol levelled.
    const before = toSaved(fresh().filter((s) => s.id <= 12)).map((s) => ({ ...s, level: 4 }));
    expect(before).toHaveLength(12);
    const restored = restoreSymbols(JSON.parse(JSON.stringify(before)), fresh());
    expect(restored.map((s) => s.id)).toEqual(fresh().map((s) => s.id));
    expect(restored.filter((s) => s.id <= 12).every((s) => s.level === 4)).toBe(true);
    for (const id of [13, 14]) {
      const grand = restored.find((s) => s.id === id)!;
      expect(grand.level).toBeNaN();
      expect(grand).toMatchObject({ type: "grand", daily: false, locked: true });
    }
  });

  it("saves and restores their player fields like any other symbol, with no weekly or extra", () => {
    const symbols = updateSymbol(fresh(), 13, { level: 6, experience: 100, daily: true });
    const saved = toSaved(symbols).find((s) => s.id === 13);
    expect(saved).toEqual({ id: 13, level: 6, experience: 100, daily: true, locked: true });
    expect(restoreSymbols(JSON.parse(JSON.stringify(toSaved(symbols))), fresh())).toEqual(symbols);
  });
});
