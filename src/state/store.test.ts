import { describe, expect, it } from "vitest";
import { useAppStore } from "./store";
import { createInitialSymbols } from "../lib/data";
import { updateSymbol } from "../lib/utils";

const KEY = "maple-symbols-v2";
const readStorage = () => JSON.parse(window.localStorage.getItem(KEY) ?? "null");

describe("store persistence", () => {
  it("saves one list per server plus the server choice, and only id plus the player's fields per symbol (KI-001)", () => {
    useAppStore.setState({
      mode: "sacred",
      symbols: updateSymbol(createInitialSymbols(), 1, { level: 5 }),
    });

    const saved = readStorage();
    expect(saved.version).toBe(4);
    expect(Object.keys(saved.state)).toEqual(["saves", "regionOverride"]);
    expect(saved.state.regionOverride).toBeNull();
    expect(Object.keys(saved.state.saves)).toEqual(["gms"]);
    const gms = saved.state.saves.gms;
    expect(gms[0]).toEqual({
      id: 1,
      level: 5,
      experience: null, // NaN is written as null
      daily: false,
      weekly: false,
      extra: false,
      locked: true,
    });
    // No game data and nothing derived is written.
    expect(gms[0]).not.toHaveProperty("symbolsRequired");
    expect(gms[0]).not.toHaveProperty("name");
    expect(gms[0]).not.toHaveProperty("symbolsRemaining");
  });

  it("rebuilds from symbols.json and restores the saved player fields by id", async () => {
    const saved = [{ id: 3, level: 7, experience: null, daily: true, weekly: true, locked: false }];
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ state: { saves: { gms: saved }, regionOverride: null }, version: 4 })
    );

    await useAppStore.persist.rehydrate();

    const { symbols, lastSelected } = useAppStore.getState();
    expect(symbols.map((s) => s.id)).toEqual(createInitialSymbols().map((s) => s.id));
    expect(symbols[2]).toMatchObject({ id: 3, level: 7, daily: true, weekly: true, locked: false });
    expect(symbols[2].experience).toBeNaN();
    expect(symbols[0].level).toBeNaN(); // not in the save
    expect(lastSelected.sacred).toBe(7); // non-persisted fields keep their defaults
  });

  it("keeps a player's levels through a version change and refreshes stale game data", async () => {
    // A version 2 save, as production writes today: full SymbolData records.
    const levelled = { ...createInitialSymbols()[0], level: 9, experience: 4, dailySymbols: 999 };
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ state: { symbols: [levelled] }, version: 2 })
    );

    await useAppStore.persist.rehydrate();

    const { symbols, setSymbols } = useAppStore.getState();
    expect(symbols).toHaveLength(createInitialSymbols().length);
    expect(symbols[0]).toMatchObject({ level: 9, experience: 4 });
    expect(symbols[0].dailySymbols).toBe(createInitialSymbols()[0].dailySymbols);
    expect(typeof setSymbols).toBe("function");
  });

  it("moves a version 3 save, written while the site was GMS-only, into the GMS slot", async () => {
    const saved = [{ id: 1, level: 12, experience: 30, daily: true, locked: true }];
    window.localStorage.setItem(KEY, JSON.stringify({ state: { symbols: saved }, version: 3 }));

    await useAppStore.persist.rehydrate();

    const state = useAppStore.getState();
    expect(state.region).toBe("gms");
    expect(state.symbols[0]).toMatchObject({ level: 12, experience: 30, daily: true });
    expect(readStorage().state.saves.gms[0]).toMatchObject({ id: 1, level: 12 });
    expect(readStorage().version).toBe(4);
  });

  it("ignores an unknown server and unknown save slots", async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        state: {
          saves: { gms: [{ id: 2, level: 4 }], europe: [{ id: 2, level: 9 }] },
          regionOverride: "europe",
        },
        version: 4,
      })
    );

    await useAppStore.persist.rehydrate();

    const state = useAppStore.getState();
    expect(state.region).toBe("gms");
    expect(state.regionOverride).toBeNull();
    expect(Object.keys(state.saves)).toEqual(["gms"]);
    expect(state.symbols[1].level).toBe(4);
  });
});

describe("setRegion: one save per server (REGIONS D-7)", () => {
  it("keeps each server's progress separately and loads that server's game data", () => {
    const { setRegion } = useAppStore.getState();
    useAppStore.setState({ symbols: updateSymbol(createInitialSymbols(), 1, { level: 8 }) });

    setRegion("kms");
    let state = useAppStore.getState();
    expect(state.region).toBe("kms");
    expect(state.regionOverride).toBe("kms");
    expect(state.symbols[0].level).toBeNaN(); // a new server starts empty
    expect(state.symbols[0].mesosRequired).toEqual(createInitialSymbols("kms")[0].mesosRequired);

    useAppStore.setState({ symbols: updateSymbol(state.symbols, 1, { level: 3 }) });
    setRegion("gms");
    state = useAppStore.getState();
    expect(state.symbols[0].level).toBe(8);
    expect(state.symbols[0].mesosRequired).toEqual(createInitialSymbols("gms")[0].mesosRequired);

    const saves = readStorage().state.saves;
    expect(saves.gms[0].level).toBe(8);
    expect(saves.kms[0].level).toBe(3);
  });

  it("keeps the selected symbol, since ids are the same on every server", () => {
    const { selectSymbol, setRegion } = useAppStore.getState();
    selectSymbol(9);
    setRegion("jms");
    expect(useAppStore.getState()).toMatchObject({ selectedId: 9, mode: "sacred" });
  });

  it("restores the chosen server and its save on the next visit", async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        state: {
          saves: { gms: [{ id: 1, level: 2 }], msea: [{ id: 1, level: 6 }] },
          regionOverride: "msea",
        },
        version: 4,
      })
    );

    await useAppStore.persist.rehydrate();

    const state = useAppStore.getState();
    expect(state.region).toBe("msea");
    expect(state.symbols[0].level).toBe(6);
    expect(state.saves.gms?.[0].level).toBe(2);
  });
});

describe("Grand Sacred selection (spec §1)", () => {
  it("selects a Grand Sacred symbol and remembers it for the grand family", () => {
    useAppStore.getState().selectSymbol(13);
    expect(useAppStore.getState().selectedId).toBe(13);
    expect(useAppStore.getState().mode).toBe("grand");
    useAppStore.getState().setMode("arcane");
    useAppStore.getState().setMode("grand");
    expect(useAppStore.getState().selectedId).toBe(13);
  });

  it("starts the grand family on Tallahart", () => {
    useAppStore.getState().setMode("grand");
    expect(useAppStore.getState().selectedId).toBe(13);
  });
});

describe("the page's edition decides the server (REGIONS D-2)", () => {
  it("shows the edition's own server unless the player chose another", async () => {
    window.history.replaceState(null, "", "/kms/handbook");
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        state: { saves: { kms: [{ id: 1, level: 4 }] }, regionOverride: null },
        version: 4,
      })
    );

    await useAppStore.persist.rehydrate();

    const state = useAppStore.getState();
    expect(state.region).toBe("kms");
    expect(state.symbols[0].level).toBe(4);
    expect(state.symbols[0].mesosRequired[1]).toBe(670000);
  });

  it("clears the choice when the player picks the page's own server", () => {
    window.history.replaceState(null, "", "/kms");
    const { setRegion } = useAppStore.getState();
    setRegion("gms");
    expect(useAppStore.getState().regionOverride).toBe("gms");
    setRegion("kms");
    expect(useAppStore.getState()).toMatchObject({ region: "kms", regionOverride: null });
  });
});
