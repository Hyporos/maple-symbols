import { describe, expect, it } from "vitest";
import { changelogEntries } from "./changelog";
import { arcaneRatioData, sacredRatioData } from "./ratioData";
import packageJson from "../../package.json";

describe("changelog entries", () => {
  it("end with the current package.json version (the UI treats the last entry as current)", () => {
    expect(changelogEntries[changelogEntries.length - 1].version).toBe(`v${packageJson.version}`);
  });

  it("all have a version, a parseable date, a GitHub PR link, and at least one note", () => {
    for (const entry of changelogEntries) {
      expect(entry.version).toMatch(/^v\d+(\.\d+)+$/);
      expect(Number.isNaN(Date.parse(entry.date))).toBe(false);
      expect(entry.link).toMatch(/^https:\/\/github\.com\/Hyporos\/maple-symbols\/pull\/\d+$/);
      expect((entry.additions?.length ?? 0) + (entry.fixes?.length ?? 0)).toBeGreaterThan(0);
    }
  });

  it("are unique and in chronological order", () => {
    const versions = changelogEntries.map((e) => e.version);
    expect(new Set(versions).size).toBe(versions.length);
    const dates = changelogEntries.map((e) => Date.parse(e.date));
    expect([...dates].sort((a, b) => a - b)).toEqual(dates);
  });
});

describe("damage ratio data", () => {
  it("arcane has 9 bands ending at 150%+ with 0% damage taken", () => {
    expect(arcaneRatioData).toHaveLength(9);
    expect(arcaneRatioData[8]).toEqual({ arcanePower: "150% +", damageDealt: 150, damageTaken: 0 });
  });

  it("sacred has 16 bands centred on 0 = 100% / 100%", () => {
    expect(sacredRatioData).toHaveLength(16);
    expect(sacredRatioData[10]).toEqual({ sacredPower: 0, damageDealt: 100, damageTaken: 100 });
  });
});
