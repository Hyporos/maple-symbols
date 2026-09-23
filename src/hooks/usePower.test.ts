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

  it("sacred mode: level*10 per valid sacred symbol, no base bonus", () => {
    const { result } = renderHook(() => usePower(symbols, "sacred"));
    expect(result.current).toBe(30);
  });

  it("grand: level*10, no base bonus, and never counted in the sacred total", () => {
    expect(renderHook(() => usePower(symbols, "grand")).result.current).toBe(40);
  });

  it("is 0 with no valid symbols", () => {
    const { result } = renderHook(() => usePower([{ type: "arcane", level: NaN }], "arcane"));
    expect(result.current).toBe(0);
  });
});
