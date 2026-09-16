// ---------------------------------------------------------------------------
// Docs-honesty test: the agent docs cite files, design tokens, and issue ids.
// This fails when any of them stop existing, so the docs cannot silently rot.
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import tailwindConfig from "../../tailwind.config.js";

const DOC_FILES = [
  "AGENTS.md",
  ...readdirSync("docs").map((f) => `docs/${f}`),
  ...readdirSync(".claude/commands").map((f) => `.claude/commands/${f}`),
];
const read = (path: string) => readFileSync(path, "utf8");

// Backticked strings that look like repo paths. Globs and JSX snippets are skipped.
const PATH_LIKE =
  /^(?:(?:src|docs|public|scripts|\.claude|\.github)\/[\w.\-/]+|(?:AGENTS|CLAUDE|README)\.md|tailwind\.config\.js|vite\.config\.ts|vitest\.config\.ts|package\.json|index\.html|vercel\.json|tsconfig\.json|eslint\.config\.js|\.gitattributes|\.prettierrc)$/;

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

  it("every token in DESIGN_SYSTEM.md's token table exists in tailwind.config.js", () => {
    const region = read("docs/DESIGN_SYSTEM.md").match(
      /<!-- tokens:start -->([\s\S]*?)<!-- tokens:end -->/
    );
    expect(region, "tokens:start / tokens:end markers").toBeTruthy();

    const extend = (tailwindConfig.theme?.extend ?? {}) as unknown as Record<
      string,
      Record<string, unknown>
    >;
    const missing: string[] = [];
    let rows = 0;
    for (const line of region![1].split("\n")) {
      const row = line.match(/^\|\s*`([^`]+)`\s*\|\s*([\w-]+)\s*\|/);
      if (!row) continue;
      rows++;
      const [, name, namespace] = row;
      if (extend[namespace]?.[name] === undefined) missing.push(`${namespace}.${name}`);
    }
    expect(rows).toBeGreaterThan(10);
    expect(missing).toEqual([]);
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
