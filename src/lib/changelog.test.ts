import { describe, expect, it } from "vitest";
import { changelogEntries } from "./changelog";
import { dayjs } from "./dayjs";
import { formatDate } from "./format";
import { arcaneRatioData, sacredRatioData } from "./ratioData";
import packageJson from "../../package.json";

describe("changelog entries", () => {
  it("end with the current package.json version (the UI treats the last entry as current)", () => {
    expect(changelogEntries[changelogEntries.length - 1].version).toBe(`v${packageJson.version}`);
  });

  it("all have a version, an ISO date, a GitHub PR link, and at least one note", () => {
    for (const entry of changelogEntries) {
      expect(entry.version).toMatch(/^v\d+(\.\d+)+$/);
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Round-trips, so "2023-02-30" (which dayjs would roll into March) fails.
      expect(dayjs(entry.date).format("YYYY-MM-DD")).toBe(entry.date);
      expect(entry.link).toMatch(/^https:\/\/github\.com\/Hyporos\/maple-symbols\/pull\/\d+$/);
      expect((entry.additions?.length ?? 0) + (entry.fixes?.length ?? 0)).toBeGreaterThan(0);
    }
  });

  it("are unique and in chronological order", () => {
    const versions = changelogEntries.map((e) => e.version);
    expect(new Set(versions).size).toBe(versions.length);
    // ISO days sort lexically in calendar order.
    const dates = changelogEntries.map((e) => e.date);
    expect([...dates].sort()).toEqual(dates);
  });

  it("display exactly the English dates they carried before the ISO conversion", () => {
    // The literal strings changelog.ts stored until the dates became ISO (docs/I18N.md B-5).
    // Pinned so the conversion cannot have moved an entry by a day; new entries need no row.
    const before: Record<string, string> = {
      "v1.0.1": "Jul 25, 2023",
      "v1.1": "Aug 24, 2023",
      "v1.1.1": "Aug 25, 2023",
      "v1.1.2": "Aug 27, 2023",
      "v1.1.3": "Aug 31, 2023",
      "v1.1.4": "Nov 15, 2023",
      "v1.2": "Dec 13, 2023",
      "v1.2.1": "Dec 14, 2023",
      "v1.2.2": "Dec 17, 2023",
      "v1.3": "Mar 1, 2024",
      "v1.3.0.1": "Aug 22, 2025",
      "v1.3.0.2": "Mar 3, 2026",
      "v1.4.0": "Sep 16, 2026",
    };
    const shown = Object.fromEntries(
      changelogEntries
        .filter((e) => e.version in before)
        .map((e) => [e.version, formatDate(e.date)])
    );
    expect(shown).toEqual(before);
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
