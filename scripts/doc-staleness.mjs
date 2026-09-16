#!/usr/bin/env node
// Session-start banner (Claude Code SessionStart hook, see .claude/settings.json):
// prints how much code changed since AGENTS.md / docs/ were last committed, so an
// agent knows whether to trust the docs or run /sync-docs first. Always exits 0.
import { execFileSync } from "node:child_process";

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const lines = (s) => s.split("\n").filter(Boolean);
const CODE_PATHS = [
  "src",
  "vite.config.ts",
  "vitest.config.ts",
  "package.json",
  "vercel.json",
  "index.html",
];

try {
  const docsCommit = git("log", "-1", "--format=%H", "--", "AGENTS.md", "docs");
  if (!docsCommit) {
    console.log("[docs] AGENTS.md/docs/ have never been committed; treat them as drafts.");
    process.exit(0);
  }
  const short = docsCommit.slice(0, 7);
  const range = `${docsCommit}..HEAD`;
  const commits = lines(git("log", "--format=%h", "--no-merges", range, "--", ...CODE_PATHS));
  const files = lines(git("diff", "--name-only", range, "--", ...CODE_PATHS));
  const dirty = lines(git("status", "--porcelain", "--", ...CODE_PATHS)).length;

  if (commits.length === 0 && dirty === 0) {
    console.log(`[docs] AGENTS.md and docs/ are current with the code (last doc commit ${short}).`);
  } else {
    const list = files.slice(0, 12).join(", ") + (files.length > 12 ? ", …" : "");
    console.log(
      `[docs] ${commits.length} commit(s) touched code since the docs last changed (${short})` +
        (files.length ? `; ${files.length} file(s): ${list}` : "") +
        (dirty ? `; ${dirty} uncommitted code change(s)` : "") +
        ". Re-verify affected doc sections against the code or run /sync-docs before relying on them."
    );
  }
} catch (err) {
  console.log(`[docs] staleness check skipped: ${String(err.message || err).split("\n")[0]}`);
}
