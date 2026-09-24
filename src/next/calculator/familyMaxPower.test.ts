import { describe, expect, it } from "vitest";
import { familyMaxPower } from "./familyMaxPower";
import { createInitialSymbols } from "../../lib/data";

describe("familyMaxPower", () => {
  it("is every Arcane symbol at max, whether its level is set or not", () => {
    expect(familyMaxPower(createInitialSymbols(), "arcane")).toBe(6 * 220);
  });
  it("counts the Grand Sacred symbols inside Sacred", () => {
    expect(familyMaxPower(createInitialSymbols(), "sacred")).toBe(8 * 110);
  });
});
