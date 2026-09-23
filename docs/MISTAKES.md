# Mistakes log

A record of what went wrong while working on this repo, so it is not repeated. Two tiers: **Distilled rules** (short, read every time; also mirrored into `AGENTS.md` when a pattern repeats) and the **Log** (one entry per incident, newest last).

**When to add an entry**: whenever Brian corrects you, or you discover after verifying that an assumption or claim was wrong, or a step failed for a reason you could have foreseen. Use `/log-mistake`. Keep entries to about six lines; the value is the rule, not the story.

## Distilled rules

- **Grep before asserting a repo fact**, even inside a brief or a question. Partial reading produces confident, wrong premises (M-002).
- **Check `engines` against the local Node before installing a package**; pnpm only warns on mismatch, so nothing stops you (M-001).
- **Config files may be JSONC.** `tsconfig.json`, `jsconfig.json`, and VS Code settings can contain comments; don't `JSON.parse` them, use the Edit tool (M-003).
- **`pnpm test <filter>`, never `pnpm test -- <filter>`.** pnpm forwards the `--` literally and Vitest then ignores the filter and runs everything (M-004).
- **lint-staged hides the output of tasks that exit 0.** A warn-only step must run outside lint-staged or nobody sees it (M-005).
- **Check peer ranges before proposing an upgrade version**; `pnpm outdated`'s latest column is not a compatibility claim (M-006).
- **Claims about hosting or search-engine behaviour get checked against the live site and the platform's current docs, not memory**; a second, independent review pass before shipping a reference doc pays for itself (M-007).
- **Platform config is validated by the platform, not by reading it.** `vercel.json` passed lint, tests and two reviews, and Vercel still rejected the deployment. Check syntax against the platform's docs before shipping config that CI cannot run, and deploy a preview before DNS moves (M-008).
- **Changelog entries are for players**: only what they can see or feel, never analytics, tooling or advisories (M-010).
- **Stage files by name, never `git add -A`**: leftover worktrees and scratch folders get swept in (M-011).
- **Agent worktrees start from `main`, not the current branch**: for work on `v2`, make them yourself from `v2` and give each agent its path (M-018).
- **Game facts need a source dated after the last relevant patch**, or they are recorded as unverified. When GMS changes something, KMS almost always changed it first (M-012). **Guide pages lag**: a number that patches change comes from the latest patch notes, never from an official guide page alone (M-014).
- **Verify hosting config on a real deployment** (a preview) before it merges; a test of `vercel.json` only proves the file says what we meant (M-016).
- **Recompute every total from its parts** before writing it down, and never call a number checked that nobody recomputed (M-013). **Quote the sentence that states the fact itself**: a reset time quoted from an event counter's line proves nothing about the symbol quests (M-015).

## Log

Format: `### M-NNN · YYYY-MM-DD · area` then **What**, **Root cause**, **Rule**, **Where**.

### M-001 · 2026-09-16 · tooling

- **What**: Installed `jsdom@30` for the test stack; its `engines` field requires Node ≥ 22.22 while this machine runs 22.12. pnpm printed a warning and continued, so it went unnoticed until a reader flagged it.
- **Root cause**: Took "latest" without reading the package's engine floor against the local runtime.
- **Rule**: Before adding a dev tool, check `engines` (and peer deps) against `node --version`; pin to the newest version that admits the local runtime and note the reason in the docs.
- **Where**: `package.json` (`jsdom` was pinned to 28.x until Node moved to 26 later that day; `engines` now guards the floor).

### M-002 · 2026-09-16 · process

- **What**: The briefs given to the analysis readers stated three repo "facts" that were wrong: that `ExpTable` uses `selectedSymbol < 6` (only `CostTable` does), that Selector/Handbook duplicate nav markup (only `Header` does, three times), and that the weekly count went 45→120 (the changelog says 40→120). The readers caught all three.
- **Root cause**: Wrote the briefs from memory of a partial first read instead of grepping.
- **Rule**: Any factual claim about this codebase, even in a prompt to a subagent, gets a grep or a file read first. Label anything unverified as a suspicion.
- **Where**: workflow briefs (session 2026-09-16); the corrected facts are in `docs/ARCHITECTURE.md`.

### M-003 · 2026-09-16 · tooling

- **What**: Tried to add `allowJs` to `tsconfig.json` with `JSON.parse` in a node one-liner; it threw because the file contains comments.
- **Root cause**: Assumed every `*.json` in the repo is strict JSON.
- **Rule**: Treat `tsconfig*.json` and editor settings as JSONC; edit them with the Edit tool or a JSONC-aware parser.
- **Where**: `tsconfig.json`.

### M-004 · 2026-09-16 · tooling

- **What**: Documented `pnpm test -- utils` as the way to filter tests, in three docs and two slash commands. A verifier ran it: pnpm 10 forwards the `--` verbatim, Vitest receives `run -- utils`, ignores the filter, and runs the whole suite.
- **Root cause**: Assumed npm's `--` convention applies to pnpm without running the command once.
- **Rule**: Any command written into a doc or a slash command gets executed once first, and its output checked, before it is documented.
- **Where**: `docs/TESTING.md`, `docs/ARCHITECTURE.md`, `.claude/commands/sync-docs.md`, `.claude/commands/new-component.md` (all corrected).

### M-005 · 2026-09-16 · tooling

- **What**: Wired the docs-drift reminder as a lint-staged task. It ran and exited 0 as designed, but lint-staged only prints task output when a task fails (or with `--verbose`), so the reminder was invisible. Caught by a verifier who reproduced it in a scratch repo.
- **Root cause**: Tested the script by running it directly, never through the hook that would actually invoke it.
- **Rule**: Test automation through the real entry point (the hook, the CI step), not just the script in isolation. Warn-only steps run outside lint-staged: `pre-commit: npx lint-staged && node scripts/docs-drift.mjs`.
- **Where**: `package.json` (`simple-git-hooks`), `scripts/docs-drift.mjs`.

### M-006 · 2026-09-16 · tooling

- **What**: Proposed and installed `@vitejs/plugin-react` 6 as part of the React 19 upgrade; its peer range is Vite `^8`, and the build failed on `vite/internal`. Pinned to 5.2 (supports Vite 7); later the same day Vite itself was upgraded to 8 and the plugin to 6.
- **Root cause**: Read the "latest" column of `pnpm outdated` as "compatible" without checking the package's peer dependencies against the installed Vite.
- **Rule**: Before proposing an upgrade version, check `pnpm view <pkg>@<ver> peerDependencies` against what is installed; "latest" is not "compatible".
- **Where**: `package.json` (`@vitejs/plugin-react` ^5.2.0).

### M-007 · 2026-09-16 · process

- **What**: The first draft of `docs/SEO.md` asserted that Vercel redirects trailing slashes, that the `.html` cache header applied to `/`, that a stale `SearchAction` risks a manual action, that a single `h1` is a ranking signal, and that Overview images lack `alt`; all wrong or outdated. It also never checked production: the domain still serves a Firebase build from March 2026 with three of four routes returning 404, which outranks everything else in the doc.
- **Root cause**: Wrote from general SEO knowledge and the repo's config files, treating "what the config says" as "what is live" and treating remembered guidance as current.
- **Rule**: For any doc that makes claims about hosting or search-engine behaviour, curl the live site and cite the platform's current documentation; then run an independent review pass against the code before committing.
- **Where**: `docs/SEO.md` §0 (production state) and §2 (corrected rules).

### M-008 · 2026-09-16 · tooling

- **What**: `vercel.json` shipped in v1.4.0 with header `source` patterns written as raw regex (an escaped dot and a non-capturing group for the file extensions, and an escaped dot for `.html`). Vercel matches `source` with path-to-regexp and rejected them, which failed validation for every deployment of `main` right after DNS had been pointed at Vercel. Two SEO audits that session read the file, one even noted that the `.html` rule "matches nothing useful", and neither checked whether the patterns were valid at all.
- **Root cause**: Treated the config as reviewed because it had been read. Nothing in lint, typecheck, tests or CI runs Vercel's own parser, so the error could only surface on a real deployment.
- **Rule**: Config that only the hosting platform parses gets checked against that platform's documented syntax before release, and a new host gets a preview deployment before DNS moves.
- **Where**: `vercel.json` (hotfix 99a926f on `main`).

### M-009 · 2026-09-16 · ui

- **What**: The Tailwind 4 upgrade was signed off on identical before/after screenshots, but v4's preflight gives buttons `cursor: default`, so every toggle, tab and pill lost its pointer cursor. Separately, the global `button, input` rule drew the accent outline on `:focus`, so a mouse click left an outline; the KI-011 fix patched only `RadioButton` instead of the global rule. Brian caught both on the live site.
- **Root cause**: Screenshots cannot show cursor or focus state, and the upgrade guide's "buttons use the default cursor" note was not checked against the app.
- **Rule**: A CSS framework upgrade gets its migration guide's behaviour changes checked one by one, plus a hover and click pass, not only screenshots. Fix a styling bug at the global rule that causes it, not in the one component that showed it.
- **Where**: `src/global.css` (`:focus-visible` outline, `button:not(:disabled)` pointer rule; 2e5a7c1).

### M-010 · 2026-09-16 · copy

- **What**: The v1.4.1 changelog listed internal work (test-build visits no longer counted in analytics, build-tool advisories) next to the one change players could notice. Brian: players don't care about those.
- **Root cause**: Wrote the entry from the commit list instead of from what a player sees.
- **Rule**: Changelog entries describe only what a player can see or feel; internal, tooling and analytics work stays in commits and PRs.
- **Where**: `src/lib/changelog.ts`.

### M-011 · 2026-09-16 · git

- **What**: Committed the merge with `git add -A`, which staged eight leftover agent worktrees under .claude/worktrees as embedded repositories. lint-staged then linted all of their files and blocked the commit, which was the only reason it did not land.
- **Root cause**: Staged everything instead of the files the change touched, in a tree known to hold untracked worktree folders.
- **Rule**: Stage files by name (`git add <paths>`), never `git add -A` or `commit -a`; clean up agent worktrees when their work is recovered.
- **Where**: `AGENTS.md` Conventions (commits), `.claude/commands/release.md`.

### M-012 · 2026-09-22 · research

- **What**: Told Brian, and wrote into `utils.ts`, `AGENTS.md`, GAME §3 and the reset sheet, that KMS, JMS and MSEA "still reset weekly quests on Monday". All three moved to Thursday in 2025 (KMS 2025-06-19, MSEA 2025-11-11, JMS 2025-12-11). Brian asked me to confirm and a targeted search overturned it in minutes.
- **Root cause**: Took a date-sensitive fact from research agents without checking how old their sources were. The Monday values came from a 2023 MSEA patch note and game-guide pages written before the change, and I repeated them as current. GMS usually follows KMS, so a GMS change was itself a hint that KMS had changed first.
- **Rule**: A game fact that can change by patch gets a source dated after the most recent relevant patch, or is recorded as unverified. When GMS changes something, check KMS first: it almost always got there earlier.
- **Where**: `src/lib/utils.ts` (`WEEKLY_RESET_DAY`), GAME §3 and §7, `docs/data-check/resets.csv`.

### M-013 · 2026-09-22 · research

- **What**: `docs/data-check/grand-sacred.csv` and GAME §4 gave Geardock's cost to max as 24,181,300,000. The per-level values on the same line add up to 20,181,300,000, which is what Brian saw in game. The provenance row even claimed the figures were "re-derived … and agree".
- **Root cause**: A total was written down (by a research agent, repeated by me) without adding up the numbers beside it, and then described as checked.
- **Rule**: Recompute any total, sum or derived figure from its parts before writing it down; never record "verified" for a number nobody recomputed.
- **Where**: `docs/data-check/grand-sacred.csv`, GAME §4.

### M-014 · 2026-09-22 · research

- **What**: Recorded, in GAME §5, KI-014, `server-differences.csv` and the fill-in page for Brian, that JMS "has not had the increase" and lacks Geardock. JMS got the doubled rates in ver4.43 (2026-07-02) and Geardock in ver4.44 (2026-08-26).
- **Root cause**: The source was Nexon Japan's force guide page, which is official but was never updated after the patch. Same family as M-012: a changeable number taken from an undated page.
- **Rule**: Rates, costs and rosters come from the region's latest patch notes; an official guide page only corroborates.
- **Where**: GAME §5, `docs/data-check/server-differences.csv`, KI-014.

### M-015 · 2026-09-22 · research

- **What**: Recorded "official" reset hours for GMS, KMS, TMS and CMS from quotes that belong to unrelated counters: the Frieren Adventure Journal (GMS v.271), the Momentum Pass and event coins (KMS 808/811/813), a GM support package (TMS V280) and Guild Noblesse SP (CMS V226). The review caught it. The GMS time was right anyway (v.264 states it for the Arcane weeklies, and Brian confirmed it in game).
- **Root cause**: Research agents matched the words "reset" and "Thursday 00:00" without checking what the sentence was about, and I recorded their quotes as official without reading them in context.
- **Rule**: A quoted source must be the sentence that states the fact about the thing itself. Read the quote in its paragraph before calling it official.
- **Where**: `docs/data-check/resets.csv`, GAME §3 and §7, `server-differences.csv`.

### M-016 · 2026-09-22 · deploy

- **What**: Phase 3 turned on `cleanUrls` in `vercel.json` and pointed the fallback rewrites at `.html` files (`/kms/(.*)` → `/kms.html`, `/(.*)` → `/index.html`). On a Vercel preview every unknown path (`/nope`, `/kms/nope`) returned 404 instead of the calculator, which breaks SEO-3. The repo tests only checked the shape of `vercel.json`, so they passed.
- **Root cause**: Assumed a rewrite destination behaves like a file path; with `cleanUrls` on, Vercel serves pages by their clean path and does not rewrite to a `.html` destination.
- **Rule**: Hosting behaviour (redirects, rewrites, clean URLs, headers) is verified against a real deployment before it merges; a test of the config file only proves the file says what we meant.
- **Where**: `vercel.json`, `src/lib/routes.test.ts`.

### M-017 · 2026-09-22 · ui

- **What**: "Apply the SEO quick wins" (f9300ec, v2) turned the Handbook and Extras tab labels in `SlideButton` from `<h1>` into `<span>` to stop them counting as headings. Every `<span>` is accent purple in `global.css`, so the labels turned purple; Brian spotted it.
- **Root cause**: Changed an element's tag for its semantics without checking the global element rules (AGENTS gotcha 5), and no test or screenshot compared the look.
- **Rule**: Changing an element's tag is a visual change too: check gotcha 5's global rules (`span`, `button`, `input`, `img`) and look at the result in a browser.
- **Where**: `src/components/ui/SlideButton.tsx`, pinned by `src/components/ui/primitives.test.tsx`.

### M-018 · 2026-09-22 · tooling

- **What**: Dispatched two phase-5 agents with `isolation: "worktree"` while working on `v2`. The worktrees were cut from `main` (the remote's default branch, 69 commits behind), so both agents started on code without editions, regions or prerendering. Caught from `git worktree list` before they changed anything; both were stopped and relaunched in worktrees made from `v2`.
- **Root cause**: Assumed the isolation worktree starts from the current branch; it starts from the remote's default branch.
- **Rule**: For parallel agents on `v2`, create the worktrees yourself (`git worktree add -b <name> <path> v2`) and point each agent at its path; check `git worktree list` before any agent writes.
- **Where**: agent dispatch; stale `.claude/worktrees/agent-*` folders were left for Brian to remove (removal needs his permission).

### M-019 · 2026-09-23 · tooling

- **What**: To check that a new test catches a leak, I broke `Selector.tsx` and `Graph.tsx` with `sed`, ran the test, then undid it with `git checkout <file>`. That also threw away the real, uncommitted edits in both files (a type change). Caught at once by `git diff --stat` and redone.
- **Root cause**: Treated `git checkout <file>` as "undo my last change" when it restores the committed file.
- **Rule**: Undo a mutation test with the inverse edit (or copy the file aside first), never `git checkout` on a file with uncommitted work; check `git diff` afterwards.
- **Where**: the Grand Sacred data model (`src/test/grandHidden.test.tsx`).

### M-020 · 2026-09-23 · search engines

- **What**: Told Brian that Naver's sitemap box already starts with the site's address, so he should type only `sitemap.xml`. His screenshot showed the box takes a full URL. The real cause of "사이트맵/RSS 형식이 올바르지 않습니다" was that he had submitted `/sitemaps/kms.xml`, which exists only on `v2` (and only once KMS is published); production answered with the calculator's HTML. My earlier reminder ("submit `/sitemaps/kms.xml` once KMS is published") read as "now".
- **Root cause**: Described a console I had not seen, and gave a 2.0 URL without saying plainly that production doesn't have it.
- **Rule**: Don't describe a third-party console's fields from memory; ask for a screenshot or say it's a guess. Any URL given for registration must be checked against production with `curl` first, and 2.0-only URLs labelled as such.
- **Where**: SEO §5.
