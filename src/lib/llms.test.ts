import { describe, expect, it } from "vitest";
import {
  llmsFullTxt,
  llmsTxt,
  markdownEditions,
  markdownFiles,
  markdownPath,
  pageMarkdown,
} from "./llms";
import { createInitialSymbols } from "./data";
import { formatNumber } from "./format";
import { EDITIONS } from "./routes";
import { REGION_PROFILES } from "./regions";

const DAY = "2026-09-23";
const byRegion = (region: string) => EDITIONS.find((e) => e.region === region)!;
const gms = byRegion("gms");
const msea = byRegion("msea");

describe("the Markdown copies of the pages (docs/AI_SEARCH.md)", () => {
  it("sit beside each page as <path>.md, the site root as /index.md", () => {
    expect(markdownPath("/", gms)).toBe("/index.md");
    expect(markdownPath("/handbook", gms)).toBe("/handbook.md");
    expect(markdownPath("/", msea)).toBe("/msea.md");
    expect(markdownPath("/credits", msea)).toBe("/msea/credits.md");
  });

  it("exist for every page of every edition served in English, and only those", () => {
    expect(markdownEditions().map((e) => e.region)).toEqual(["gms", "msea"]);
    expect(Object.keys(markdownFiles(DAY))).toEqual([
      "/index.md",
      "/handbook.md",
      "/changelog.md",
      "/credits.md",
      "/msea.md",
      "/msea/handbook.md",
      "/msea/changelog.md",
      "/msea/credits.md",
    ]);
  });

  it("state the same numbers the site computes, for the edition's own server", () => {
    const calculator = pageMarkdown("/", gms, DAY);
    expect(calculator).toContain("2,679 symbols take one from level 1 to max");
    expect(calculator).toContain(
      "| Vanishing Journey | Arcane Symbols | 20 | 40 (with Reverse City) | 240 |"
    );
    expect(calculator).toContain("dailies reset at 00:00 UTC and the weekly on Thursday");

    const handbook = pageMarkdown("/handbook", gms, DAY);
    for (const symbol of createInitialSymbols("gms")) {
      const total = symbol.mesosRequired.reduce((a, b) => a + b, 0);
      expect(handbook).toContain(`Total to max: ${formatNumber(total)} mesos.`);
    }
  });

  it("use the edition's own words and names, with no placeholder left", () => {
    const page = pageMarkdown("/", msea, DAY);
    expect(page).toContain("Authentic Symbols");
    expect(page).toContain("Road to Extinction");
    expect(page).toContain("dailies reset at 00:00 UTC+8");
    for (const text of Object.values(markdownFiles(DAY))) expect(text).not.toMatch(/\{\w+\}/);
  });

  it("say a cost is not published rather than show one (REGIONS D-6)", () => {
    // No server's table is unpublished today, so mark one for the test.
    const status = REGION_PROFILES.msea.status;
    const saved = status.mesosArcane;
    status.mesosArcane = "unpublished";
    try {
      expect(pageMarkdown("/handbook", msea, DAY)).toContain(
        "Meso costs are not published yet for MSEA."
      );
    } finally {
      status.mesosArcane = saved;
    }
  });
});

describe("llms.txt (llmstxt.org)", () => {
  const txt = llmsTxt(DAY);

  it("opens with the site's name as the only h1 and a one-line summary", () => {
    expect(txt.startsWith("# Maple Symbols\n\n> ")).toBe(true);
    expect(txt.match(/^# /gm)).toHaveLength(1);
  });

  it("links every Markdown copy, and the full file", () => {
    for (const path of Object.keys(markdownFiles(DAY)))
      expect(txt).toContain(`(https://maplesymbols.com${path})`);
    expect(txt).toContain("(https://maplesymbols.com/llms-full.txt)");
  });

  it("has a full version holding every page", () => {
    const full = llmsFullTxt(DAY);
    for (const text of Object.values(markdownFiles(DAY))) expect(full).toContain(text);
  });
});
