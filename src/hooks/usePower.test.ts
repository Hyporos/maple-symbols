import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePower } from "./usePower";

const symbols = [
  { type: "arcane" as const, level: 5 },
  { type: "arcane" as const, level: NaN },
  { type: "sacred" as const, level: 3 },
  { type: "grand" as const, level: 4 },
];

describe("usePower", () => {
  it("arcane mode: level*10 + 20 per valid arcane symbol", () => {
    const { result } = renderHook(() => usePower(symbols, "arcane"));
    expect(result.current).toBe(70);
  });

  // Grand Sacred counts toward the Sacred total (spec §1, Brian 2026-09-23): sacred(3)*10 = 30
  // plus grand(4)*10 = 40.
  it("sacred mode: level*10 per valid sacred symbol, plus Grand Sacred, no base bonus", () => {
    const { result } = renderHook(() => usePower(symbols, "sacred"));
    expect(result.current).toBe(70);
  });

  it("grand: level*10, no base bonus (spec §1)", () => {
    expect(renderHook(() => usePower(symbols, "grand")).result.current).toBe(40);
  });

  it("is 0 with no valid symbols", () => {
    const { result } = renderHook(() => usePower([{ type: "arcane", level: NaN }], "arcane"));
    expect(result.current).toBe(0);
  });

  it("counts Grand Sacred toward the Sacred Power total (spec §1)", () => {
    const symbols = [
      { type: "sacred" as const, level: 5 },
      { type: "grand" as const, level: 2 },
      { type: "arcane" as const, level: 3 },
    ];
    const { result } = renderHook(() => usePower(symbols, "sacred"));
    expect(result.current).toBe(70); // 50 + 20
    const { result: grand } = renderHook(() => usePower(symbols, "grand"));
    expect(grand.current).toBe(20);
  });
});
