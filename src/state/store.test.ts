import { describe, expect, it } from "vitest";
import { useAppStore } from "./store";
import { createInitialSymbols } from "../lib/data";
import { updateSymbol } from "../lib/utils";

const KEY = "maple-symbols-v2";
const readStorage = () => JSON.parse(window.localStorage.getItem(KEY) ?? "null");

describe("store persistence", () => {
  it("persists only `symbols` (no derived values) and serialises NaN as null", () => {
    useAppStore.setState({
      mode: "sacred",
      symbols: updateSymbol(createInitialSymbols(), 1, { level: 5 }),
    });

    const saved = readStorage();
    expect(saved.version).toBe(3);
    expect(Object.keys(saved.state)).toEqual(["symbols"]);
    expect(saved.state.symbols[0]).toMatchObject({ level: 5, locked: true });
    expect(saved.state.symbols[0]).not.toHaveProperty("symbolsRemaining");
    expect(saved.state.symbols[1].level).toBeNull();
  });

  it("rehydrates null level/experience back to NaN and adopts the persisted array wholesale", async () => {
    const one = { ...createInitialSymbols()[0], level: null, experience: null };
    window.localStorage.setItem(KEY, JSON.stringify({ state: { symbols: [one] }, version: 3 }));

    await useAppStore.persist.rehydrate();

    const { symbols, lastSelected } = useAppStore.getState();
    expect(symbols).toHaveLength(1); // persisted array wins, length included (see KNOWN_ISSUES)
    expect(symbols[0].level).toBeNaN();
    expect(symbols[0].experience).toBeNaN();
    expect(lastSelected.sacred).toBe(7); // non-persisted fields keep their defaults
  });

  it("resets symbols on a version mismatch (migrate discards user data)", async () => {
    const levelled = { ...createInitialSymbols()[0], level: 9, experience: 4 };
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ state: { symbols: [levelled] }, version: 2 })
    );

    await useAppStore.persist.rehydrate();

    expect(useAppStore.getState().symbols).toEqual(createInitialSymbols());
    expect(typeof useAppStore.getState().setSymbols).toBe("function");
  });
});
