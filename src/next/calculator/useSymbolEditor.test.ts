import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSymbolEditor } from "./useSymbolEditor";
import { useAppStore } from "../../state/store";
import { seedSymbol } from "../../test/helpers";

describe("useSymbolEditor (the calculator card's rules, ported from src/components/Calculator)", () => {
  it("sets the level with the same clamping as today and caps experience at the next level while locked", () => {
    seedSymbol(1, { level: 5, experience: 0 });
    const { result } = renderHook(() => useSymbolEditor());
    act(() => result.current.setLevel("0"));
    expect(result.current.symbol.level).toBe(1);
    act(() => result.current.setLevel("12"));
    act(() => result.current.setExperience("9999"));
    expect(result.current.symbol.experience).toBe(result.current.nextExperience);
    expect(result.current.readyForUpgrade).toBe(true);
  });

  it("toggles quests and derives the day's symbols", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: false });
    const { result } = renderHook(() => useSymbolEditor());
    act(() => result.current.toggle("daily"));
    expect(result.current.dailySymbols).toBe(20);
    act(() => result.current.toggle("extra"));
    expect(result.current.dailySymbols).toBe(40);
  });

  it("credits the server's weekly only while the weekly is on", () => {
    seedSymbol(1, { level: 5, experience: 0, weekly: false });
    const { result } = renderHook(() => useSymbolEditor());
    expect(result.current.weeklySymbols).toBe(0);
    act(() => result.current.toggle("weekly"));
    expect(result.current.weeklySymbols).toBe(240);
  });

  it("unlocks the cap, and applying overflow turns spare experience into levels and relocks", () => {
    seedSymbol(1, { level: 1, experience: 12 });
    const { result } = renderHook(() => useSymbolEditor());
    act(() => result.current.unlockCap());
    act(() => result.current.setExperience("30"));
    act(() => result.current.applyOverflow());
    expect(result.current.symbol.level).toBe(3);
    expect(result.current.symbol.experience).toBe(3); // arcaneExpRequired: 12 (1→2) + 15 (2→3); 30 - 27 = 3
    expect(result.current.symbol.locked).toBe(true);
  });

  it("locks the cap again from its lock control", () => {
    seedSymbol(1, { level: 1, experience: 12, locked: false });
    const { result } = renderHook(() => useSymbolEditor());
    act(() => result.current.lockCap());
    expect(result.current.symbol.locked).toBe(true);
  });

  it("relocks a maxed symbol with no experience (the current Calculator's effect)", () => {
    seedSymbol(1, { level: 20, experience: 0, locked: false });
    renderHook(() => useSymbolEditor());
    expect(useAppStore.getState().symbols.find((s) => s.id === 1)!.locked).toBe(true);
  });

  it("clamps a locked symbol's stored experience to the next level (the current Calculator's effect)", () => {
    seedSymbol(1, { level: 1, experience: 500 }); // 12 buys level 2
    renderHook(() => useSymbolEditor());
    expect(useAppStore.getState().symbols.find((s) => s.id === 1)!.experience).toBe(12);
  });

  it("reads an unset symbol as NaN without throwing", () => {
    seedSymbol(1, { level: NaN, experience: NaN });
    const { result } = renderHook(() => useSymbolEditor());
    expect(result.current.nextExperience).toBeNaN();
    expect(result.current.readyForUpgrade).toBe(false);
    expect(result.current.daysToNextLevel).toBeNaN();
  });
});
