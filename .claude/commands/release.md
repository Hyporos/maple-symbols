---
description: Cut a release — version bump, changelog, sitemap, README badge, PR to main, tag, back-merge
argument-hint: <version, e.g. 1.5.0> [--dry-run]
allowed-tools: Bash(git *), Bash(pnpm *), Bash(gh *), Bash(curl *)
---

Release Maple Symbols. Target: $ARGUMENTS

Releases are cut from `development`. While the 2.0 branch `v2` exists, `development` and `v2` have different layouts, so every step below says how to tell which one you are on. Check by file, never by memory: `test -f src/lib/routes.ts` is true on the 2.0 layout and false on the 1.x layout.

**Where to run.** `git worktree list` first. The main checkout may be on `v2` with `development` in a separate worktree; run steps 1–7 in the `development` worktree (or check it out if none exists). Stage files by name, never `git add -A` or `git commit -a` (stray folders such as .claude/worktrees get swept in).

## Preconditions (stop and report if any fails)

- On `development`, clean tree, up to date with `origin/development`, and `git log origin/main..origin/development` is non-empty (otherwise there is nothing to release).
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all pass. On this machine Vitest workers time out under load: if a test fails with a ~15 s timeout, rerun that file alone (`pnpm test <name> --maxWorkers=1`) before treating it as real.
- GitHub access: `gh auth status`, or the GitHub MCP tools (`gh` is not installed on Brian's machine; use MCP for steps 2 and 7).

## Steps

Brian's request to release is the go-ahead for the commit, push and PR; still say what you are about to push. Claude cannot merge the PR (the permission classifier blocks it): Brian merges.

1. **Version**: `"version"` in `package.json` (no leading `v`). The footer renders it.
2. **Changelog**: append a new entry at the **end** of `changelogEntries` in `src/lib/changelog.ts` (the UI treats the last entry as current).
   - `version: "vX.Y.Z"`.
   - `date`: today, **in the same format as the entries already in the file** (1.x layout: `"Sep 16, 2026"`; 2.0 layout: ISO `"2026-09-16"`, formatted for display by `formatDate`). On 2.0 the changelog test rejects anything but ISO; on 1.x it only checks the date parses, so match the neighbours by eye.
   - `link`: the PR you are about to open. Issues and PRs share one number sequence, so it is the highest existing issue-or-PR number + 1 (`gh api 'repos/Hyporos/maple-symbols/issues?state=all&per_page=1' --jq '.[0].number'`, or the max of MCP `list_pull_requests` and `list_issues` with `state: all`). After opening the PR, check the number matches and fix the link if not.
   - 2.0 layout: `changelogEntries` holds only `version`, `date` and `link`; the notes go in the catalogue's `changelog` area under the same version key, in `src/i18n/en/changelog.ts` **and in every other language's catalogue** (REGIONS D-4: translated before release; typecheck fails on a language that lacks the version).
   - `additions` / `fixes`: written from `git log origin/main..development --format=%s`, **only what a player can see or feel** (MISTAKES M-010). Analytics, tooling, dependency, test, docs and refactor work stay out; if nothing player-facing is left, ask Brian whether this is worth a release.
3. **Sitemap `lastmod`** (today, `YYYY-MM-DD`) for `/` and `/changelog`; `/handbook` only if handbook data changed.
   - 2.0 layout: `sitemap.lastmod` in src/lib/routes.ts (`sitemap.xml` is generated at build).
   - 1.x layout: the `<lastmod>` lines in public/sitemap.xml (1.x only).
   - Already today? Leave it.
4. **README**: the version badge (`version-X.Y.Z-red` and its `alt`).
5. **Storage**: if a player field changed meaning since the last tag (2.0: src/lib/persistence.ts; 1.x: the persisted `SymbolData` in `src/state/store.ts`), check `STORAGE_VERSION` was bumped with a conversion in `migrate`. Confirm no existing symbol `id` changed (`git diff <last tag>..development -- src/lib/symbols.json`). On the 1.x layout any `symbols.json` change does not reach returning players without a version bump (KI-001 there); on 2.0 it needs nothing.
6. **Commit** on `development` as `Release vX.Y.Z` (stage the changed files by name), rerun the four checks, push.
7. **PR** `development → main`, title `Release vX.Y.Z`, body = the changelog entry as bullets plus the PR attribution line. Then stop and give Brian the link to merge.
8. **After Brian confirms the merge** (verify with `git fetch && git log -1 origin/main`):
   - `git tag vX.Y.Z origin/main && git push origin vX.Y.Z`.
   - In the `development` worktree: `git merge --ff-only origin/main && git push origin development`.
   - If `v2` exists: in its checkout, `git merge origin/development`. Resolve conflicts keeping `v2`'s layout; convert the new changelog `date` to ISO; run `pnpm test changelog seo docs`; commit and push `v2`.
9. **Live check (SEO-25)**, once Vercel has deployed `main` (a minute or two):
   - Every page URL returns 200: the `ROUTES` paths (2.0) or the `<loc>` entries of public/sitemap.xml (1.x); plus `/sitemap.xml` and `/robots.txt`.
   - The `vercel.json` redirects still 308 (`/calculator`, `/graph`, `/tools` → `/`; `www` → apex).
   - `https://maplesymbols.com/sitemap.xml` is identical to the build's (`dist/sitemap.xml` on 2.0, public/sitemap.xml on 1.x; strip `\r` before diffing).
   - The deployed bundle is the new one: the version string is in the entry script (`curl -s https://maplesymbols.com/ | grep -o '/assets/index-[^"]*\.js'`, then grep that file for `X.Y.Z`).
   - Report any mismatch; the release is not done until they agree.

`--dry-run`: do steps 1–5 as a diff preview only; commit nothing.
