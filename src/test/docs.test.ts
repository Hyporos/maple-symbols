// ---------------------------------------------------------------------------
// Docs-honesty test: the agent docs cite files, design tokens, and issue ids.
// This fails when any of them stop existing, so the docs cannot silently rot.
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import symbolsJson from "../lib/symbols.json";
import {
  ARCANE_BASE_POWER,
  CATALYST_RETENTION,
  EXTRA_MULTIPLIER,
  MAIN_STAT_PER_LEVEL,
  MAX_LEVEL,
  MAX_POWER_PER_SYMBOL,
  POWER_PER_LEVEL,
  WEEKLY_SYMBOLS,
} from "../lib/game";

// Every markdown doc, including the ones in subfolders such as docs/data-check.
const markdownIn = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return markdownIn(path);
    return entry.name.endsWith(".md") ? [path] : [];
  });

const DOC_FILES = ["AGENTS.md", ...markdownIn("docs"), ...markdownIn(".claude/commands")];
const read = (path: string) => readFileSync(path, "utf8");

// Backticked strings that look like repo paths. Globs and JSX snippets are skipped.
const PATH_LIKE =
  /^(?:(?:src|docs|public|scripts|\.claude|\.github)\/[\w.\-/]+|(?:AGENTS|CLAUDE|README)\.md|vite\.config\.ts|vitest\.config\.ts|postcss\.config\.js|package\.json|index\.html|vercel\.json|tsconfig\.json|eslint\.config\.js|\.gitattributes|\.prettierrc)$/;

describe("docs stay honest", () => {
  it("every file path cited in backticks exists", () => {
    const missing: string[] = [];
    for (const doc of DOC_FILES) {
      for (const [, raw] of read(doc).matchAll(/`([^`\n]+)`/g)) {
        const candidate = raw.replace(/:\d+(?:-\d+)?$/, ""); // strip a trailing :line ref
        if (!PATH_LIKE.test(candidate) || /[*<>{}]/.test(candidate)) continue;
        if (!existsSync(candidate)) missing.push(`${doc} → ${raw}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("every token in DESIGN_SYSTEM.md's token table is defined in the @theme block of global.css", () => {
    const region = read("docs/DESIGN_SYSTEM.md").match(
      /<!-- tokens:start -->([\s\S]*?)<!-- tokens:end -->/
    );
    expect(region, "tokens:start / tokens:end markers").toBeTruthy();

    const theme = read("src/global.css").match(/@theme\s*\{([\s\S]*?)\n\}/);
    expect(theme, "@theme block in src/global.css").toBeTruthy();
    const defined = new Set([...theme![1].matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

    const cited: string[] = [];
    for (const line of region![1].split("\n")) {
      const row = line.match(/^\|\s*`(--[\w-]+)`\s*\|/);
      if (row) cited.push(row[1]);
    }
    expect(cited.length).toBeGreaterThan(10);
    expect(cited.filter((v) => !defined.has(v))).toEqual([]);
    // and the table is complete: every theme variable is documented
    expect([...defined].filter((v) => !cited.includes(v))).toEqual([]);
  });

  it("GAME.md's symbol and constants tables match symbols.json and game.ts", () => {
    const game = read("docs/GAME.md");
    const rows = (name: string) => {
      const region = game.match(
        new RegExp(`<!-- ${name}:start -->([\\s\\S]*?)<!-- ${name}:end -->`)
      );
      expect(region, `${name}:start / ${name}:end markers`).toBeTruthy();
      return region![1]
        .split("\n")
        .filter((line) => line.startsWith("|") && !/^\|\s*-/.test(line))
        .slice(1) // header
        .map((line) =>
          line
            .split("|")
            .slice(1, -1)
            .map((cell) => cell.trim())
        );
    };
    const sum = (table: number[]) => table.reduce((a, b) => a + b, 0);
    const dash = (value: string | undefined) => value ?? "–";

    const expected = symbolsJson.symbols.map((s) => [
      String(s.id),
      s.name,
      s.type,
      s.dailyName,
      String(s.dailySymbols),
      dash(s.weeklyName),
      dash(s.extraName),
      sum(s.mesosRequired).toLocaleString("en-US"),
    ]);
    expect(rows("symbols")).toEqual(expected);

    const constants = Object.fromEntries(rows("constants").map(([rule, a, s]) => [rule, [a, s]]));
    const pair = (a: number | string, s: number | string) => [String(a), String(s)];
    expect(constants).toEqual({
      "Max level": pair(MAX_LEVEL.arcane, MAX_LEVEL.sacred),
      "Symbols from level 1 to max": pair(
        sum(symbolsJson.arcaneExpRequired),
        sum(symbolsJson.sacredExpRequired)
      ),
      "Weekly quest symbols (per weekly reset)": pair(WEEKLY_SYMBOLS, "–"),
      "Extra quest daily multiplier": pair(EXTRA_MULTIPLIER.arcane, EXTRA_MULTIPLIER.sacred),
      "Catalyst keeps this share of total EXP": pair(
        CATALYST_RETENTION.arcane,
        CATALYST_RETENTION.sacred
      ),
      "Power per level": pair(POWER_PER_LEVEL, POWER_PER_LEVEL),
      "Base power at level 1 (on top)": pair(ARCANE_BASE_POWER, 0),
      "Max power per symbol": pair(MAX_POWER_PER_SYMBOL.arcane, MAX_POWER_PER_SYMBOL.sacred),
      "Main stat per level": pair(MAIN_STAT_PER_LEVEL.arcane, MAIN_STAT_PER_LEVEL.sacred),
    });
  });

  it("every KI-nnn referenced in the docs is defined in KNOWN_ISSUES.md", () => {
    const defined = new Set(
      [...read("docs/KNOWN_ISSUES.md").matchAll(/^### (KI-\d{3})/gm)].map((m) => m[1])
    );
    const dangling = new Set<string>();
    for (const doc of DOC_FILES) {
      for (const [, id] of read(doc).matchAll(/\b(KI-\d{3})\b/g)) {
        if (!defined.has(id)) dangling.add(`${doc} → ${id}`);
      }
    }
    expect([...dangling]).toEqual([]);
  });
});
