import { describe, expect, it } from "vitest";
import { catalystPreview, formatPreview, selectorPreview } from "./tools";
import { CATALYST_RETENTION } from "./game";
import { createInitialSymbols } from "./data";

const vj = (patch = {}) => ({ ...createInitialSymbols()[0], ...patch });
const cernium = (patch = {}) => ({ ...createInitialSymbols()[6], ...patch });

describe("selectorPreview", () => {
  it("adds symbols to the current experience and levels up through the table", () => {
    expect(selectorPreview(vj({ level: 1, experience: 0 }), 5)).toEqual({
      level: 1,
      experience: 5,
    });
    expect(selectorPreview(vj({ level: 1, experience: 0 }), 30)).toEqual({
      level: 3,
      experience: 3,
    });
    expect(selectorPreview(vj({ level: 1, experience: 10 }), 2)).toEqual({
      level: 2,
      experience: 0,
    });
  });

  it("with no count, previews the current state", () => {
    expect(selectorPreview(vj({ level: 4, experience: 9 }), NaN)).toEqual({
      level: 4,
      experience: 9,
    });
    expect(selectorPreview(vj({ level: 4, experience: 9 }), 0)).toEqual({
      level: 4,
      experience: 9,
    });
  });

  it("can reach max level with the whole table", () => {
    expect(selectorPreview(vj({ level: 1, experience: 0 }), 2679)).toEqual({
      level: 20,
      experience: 0,
    });
  });
});

describe("catalystPreview", () => {
  it("arcane keeps 80% of invested + current experience", () => {
    // level 5: invested 12+15+20+27 = 74 → 59.2 → level 4 with 12.2 left
    const result = catalystPreview(vj({ level: 5, experience: 0 }), CATALYST_RETENTION.arcane);
    expect(result.level).toBe(4);
    expect(result.experience).toBeCloseTo(12.2);
  });

  it("sacred keeps 60%", () => {
    // level 5: invested 29+76+141+224 = 470 → 282 → level 4 with 36 left
    expect(
      catalystPreview(cernium({ level: 5, experience: 0 }), CATALYST_RETENTION.sacred)
    ).toEqual({
      level: 4,
      experience: 36,
    });
  });

  it("counts current experience only up to the next requirement (overflow is ignored)", () => {
    const capped = catalystPreview(vj({ level: 5, experience: 36 }), CATALYST_RETENTION.arcane);
    const overflow = catalystPreview(vj({ level: 5, experience: 500 }), CATALYST_RETENTION.arcane);
    expect(overflow).toEqual(capped);
  });

  it("returns an unset level for level 1 (nothing invested, strict > never passes)", () => {
    expect(catalystPreview(vj({ level: 1, experience: 0 }), 0.8).level).toBeNaN();
  });
});

describe("formatPreview", () => {
  const ctx = (patch = {}, extra = {}) => ({
    symbol: vj({ level: 3, experience: 5, ...patch }),
    maxLevel: 20,
    isCatalyst: false,
    catalystExperience: -1,
    ...extra,
  });

  it("renders level / ceil(exp)", () => {
    expect(formatPreview(4, 12.2, ctx())).toBe("4 / 13");
  });

  it("falls back to ? / ? for an unset level, and level / ? for unset experience", () => {
    expect(formatPreview(NaN, 5, ctx())).toBe("? / ?");
    expect(formatPreview(3, 5, ctx({ level: NaN }))).toBe("? / ?");
    expect(formatPreview(3, 5, ctx({ experience: NaN }))).toBe("3 / ?");
  });

  it("shows max level as max / 0", () => {
    expect(formatPreview(20, 999, ctx())).toBe("20 / 0");
  });

  it("hides the catalyst preview at level 1", () => {
    expect(formatPreview(1, 0, ctx({ level: 1 }, { isCatalyst: true }))).toBe("? / ?");
  });

  it("freezes the selector preview while experience overflows the cap (unlocked)", () => {
    const c = ctx({ level: 3, experience: 50 }, { catalystExperience: 7 });
    expect(formatPreview(5, 9, c)).toBe("3 / 20"); // level 3 → 4 needs 20
    expect(formatPreview(5, 7, c)).toBe("5 / 7"); // the catalyst preview itself is exempt
  });
});
