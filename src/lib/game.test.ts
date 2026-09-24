import { describe, expect, it } from "vitest";
import { createInitialSymbols } from "./data";
import {
  CATALYST_RETENTION,
  EXTRA_MULTIPLIER,
  inFamily,
  MAIN_STAT_PER_LEVEL,
  MAX_POWER_PER_SYMBOL,
  maxLevelFor,
} from "./game";
import { progressToMax } from "./calculator";
import { REGION_PROFILES, REGIONS, mesosKind } from "./regions";
import { getDailySymbols, isMaxLevel } from "./utils";
import { WED } from "../test/helpers";
import { dayjs } from "./dayjs";

const byId = (id: number) => createInitialSymbols().find((s) => s.id === id)!;

describe("Grand Sacred rules (GAME §2, §4)", () => {
  it("levels to 11 like Sacred, for 110 power at 10 a level", () => {
    expect(maxLevelFor("grand")).toBe(11);
    expect(isMaxLevel(11, "grand")).toBe(true);
    expect(isMaxLevel(10, "grand")).toBe(false);
    expect(MAX_POWER_PER_SYMBOL.grand).toBe(110);
  });

  it("models what does not exist as null: extra quest, Catalyst, main stat", () => {
    expect(EXTRA_MULTIPLIER.grand).toBeNull();
    expect(CATALYST_RETENTION.grand).toBeNull();
    expect(MAIN_STAT_PER_LEVEL.grand).toBeNull();
    // No class conversion without main stat: the server profiles only hold the other two.
    for (const region of REGIONS) {
      expect(Object.keys(REGION_PROFILES[region].classGains.demonAvengerHp)).toEqual([
        "arcane",
        "sacred",
      ]);
    }
  });

  it("pays the daily at ×1, even if an extra flag were somehow set", () => {
    const tallahart = { ...byId(13), daily: true };
    expect(getDailySymbols(tallahart)).toBe(15);
    expect(getDailySymbols({ ...tallahart, extra: true })).toBe(15);
    expect(getDailySymbols({ ...tallahart, daily: false })).toBe(0);
  });

  it("counts days to max on the Sacred table with no weekly", () => {
    // Level 1, 0 exp: 4565 symbols at 15 a day is 305 days (304.3, rounded up).
    const now = dayjs(WED);
    const { symbolsRemaining, daysRemaining } = progressToMax(
      { ...byId(14), level: 1, experience: 0, daily: true },
      now
    );
    expect(symbolsRemaining).toBe(4565);
    expect(daysRemaining).toBe(305);
  });

  it("has its own meso status per server", () => {
    expect(mesosKind("grand")).toBe("mesosGrand");
    expect(mesosKind("sacred")).toBe("mesosSacred");
    expect(mesosKind("arcane")).toBe("mesosArcane");
  });
});

describe("inFamily", () => {
  it("puts Grand Sacred inside the Sacred family, and nothing else across families", () => {
    expect(inFamily("grand", "sacred")).toBe(true);
    expect(inFamily("sacred", "sacred")).toBe(true);
    expect(inFamily("grand", "grand")).toBe(true);
    expect(inFamily("sacred", "grand")).toBe(false);
    expect(inFamily("arcane", "sacred")).toBe(false);
  });
});
