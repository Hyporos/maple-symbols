---
description: Cut a release — version bump, changelog, sitemap, README badge, PR to main, tag
argument-hint: <version, e.g. 1.5.0> [--dry-run]
allowed-tools: Bash(git *), Bash(pnpm *), Bash(gh *)
---

Release Maple Symbols. Target: $ARGUMENTS

Preconditions (stop and report if any fails):

- On branch `development`, clean tree, up to date with `origin/development`.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all pass.
- GitHub access: either `gh auth status` succeeds, or the GitHub MCP tools are available (use them for steps 2 and 7 when `gh` is not installed).

Steps. Ask me before each irreversible step (the commit, the push, the PR, the tag):

1. **Version**: set `"version"` in `package.json` to the target (no leading `v`). The footer renders this value.
2. **Changelog**: append a new entry at the **end** of `changelogEntries` in `src/lib/changelog.ts` (the UI treats the last entry as current). Fields: `version: "vX.Y.Z"`, `date` as `"MMM D, YYYY"` (today), `link` to the PR you will open (issues and PRs share one number sequence, so the next number is the highest existing issue-or-PR number + 1: `gh api 'repos/Hyporos/maple-symbols/issues?state=all&per_page=1' --jq '.[0].number'`, or the newest of the MCP `list_issues` / `list_pull_requests` results), `additions` and `fixes` written from `git log main..development --format=%s` as user-facing sentences; drop chores.
3. **Sitemap**: set `lastmod` in `public/sitemap.xml` to today (YYYY-MM-DD) for `/` and `/changelog`; `/handbook` only if handbook data changed.
4. **README**: update the version badge (`version-X.Y.Z-red` and its `alt`).
5. **Storage**: if `SymbolData` changed since the last tag, remind me that bumping `STORAGE_VERSION` wipes user data (see `docs/ARCHITECTURE.md`) and ask what to do.
6. Commit on `development` as `Release vX.Y.Z`, then push.
7. Open the PR `development → main` with `gh pr create --base main --title "Release vX.Y.Z"` (or the MCP `create_pull_request` on `Hyporos/maple-symbols`); body = the changelog entry as bullets.
8. After I confirm the PR is merged: `git checkout main && git pull`, `git tag vX.Y.Z && git push origin vX.Y.Z`, then `git checkout development && git merge main` so the branches stay level.

`--dry-run`: do steps 1–5 as a diff preview only; commit nothing.
