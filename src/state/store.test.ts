import { describe, expect, it } from "vitest";
import { useAppStore } from "./store";
import { createInitialSymbols } from "../lib/data";
import { updateSymbol } from "../lib/utils";

const KEY = "maple-symbols-v2";
const readStorage = () => JSON.parse(window.localStorage.getItem(KEY) ?? "null");

describe("store persistence", () => {
  it("saves only `symbols`, and only id plus the player's fields per symbol (KI-001)", () => {
    useAppStore.setState({
      mode: "sacred",
      symbols: updateSymbol(createInitialSymbols(), 1, { level: 5 }),
    });

    const saved = readStorage();
    expect(saved.version).toBe(3);
    expect(Object.keys(saved.state)).toEqual(["symbols"]);
    expect(saved.state.symbols[0]).toEqual({
      id: 1,
      level: 5,
      experience: null, // NaN is written as null
      daily: false,
      weekly: false,
      extra: false,
      locked: true,
    });
    // No game data and nothing derived is written.
    expect(saved.state.symbols[0]).not.toHaveProperty("symbolsRequired");
    expect(saved.state.symbols[0]).not.toHaveProperty("name");
    expect(saved.state.symbols[0]).not.toHaveProperty("symbolsRemaining");
  });

  it("rebuilds from symbols.json and restores the saved player fields by id", async () => {
    const saved = [{ id: 3, level: 7, experience: null, daily: true, weekly: true, locked: false }];
    window.localStorage.setItem(KEY, JSON.stringify({ state: { symbols: saved }, version: 3 }));

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
});
