// ---------------------------------------------------------------------------
// Docs-honesty test: the agent docs cite files, design tokens, and issue ids.
// This fails when any of them stop existing, so the docs cannot silently rot.
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const DOC_FILES = [
  "AGENTS.md",
  ...readdirSync("docs").map((f) => `docs/${f}`),
  ...readdirSync(".claude/commands").map((f) => `.claude/commands/${f}`),
];
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
