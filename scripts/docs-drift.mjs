#!/usr/bin/env node
// Pre-commit nudge: warn, never block, when doc-sensitive files are staged without any
// change under docs/ or AGENTS.md. Runs AFTER lint-staged in the simple-git-hooks pre-commit
// (not inside it: lint-staged swallows the output of tasks that exit 0).
// See AGENTS.md → "Keep the docs honest".
import { execFileSync } from "node:child_process";

const staged = execFileSync("git", ["diff", "--cached", "--name-only"], { encoding: "utf8" })
  .split("\n")
  .map((f) => f.trim())
  .filter(Boolean);

const docsTouched = staged.some((f) => f === "AGENTS.md" || f.startsWith("docs/"));
const sensitive = staged.filter(
  (f) =>
    !/\.test\.tsx?$/.test(f) &&
    /^(src\/lib\/|src\/state\/|src\/contexts\/|src\/global\.css$|src\/components\/SEO\.tsx$|index\.html$|vercel\.json$|public\/robots\.txt$|public\/manifest\.webmanifest$)/.test(
      f
    )
);

if (sensitive.length > 0 && !docsTouched) {
  console.warn(
    [
      "",
      "[docs-drift] Doc-sensitive files are staged but nothing under docs/ or AGENTS.md changed:",
      ...sensitive.map((f) => `  - ${f}`),
      "If behaviour, tokens, state shape, architecture, or anything search engines see changed, update the docs (docs/SEO.md included; or run /sync-docs).",
      "This is a reminder only; the commit proceeds.",
      "",
    ].join("\n")
  );
}
process.exit(0);
