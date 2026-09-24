# Maple Symbols — Agent Guide

MapleStory Arcane/Sacred **symbol calculator**: a single-page React app (no backend) where a player enters each symbol's level and experience, toggles daily/weekly quests, and gets completion dates, meso costs, a power graph, and reference tables. Live at maplesymbols.com, deployed by Vercel from `main` since 2026-09-16 (Firebase before that). The apex is the primary domain and `www` 308s to it (SEO §0). Analytics only records on production (ANALYTICS AN-6).

Auto-loaded every session (via `CLAUDE.md`). Only what most tasks need lives here; the deep docs in `docs/` are read on demand (see "Which doc when"). Keep it under ~120 lines: anything longer than two lines that a deep doc covers belongs there, with a pointer here.

## Rules for working here

1. **Ask before deciding.** Configuration, design, and architecture choices that matter are Brian's to make. Use the question tool: give two or three alternatives that are genuinely as good, say which you recommend and why, then wait. Don't assume, and don't quietly narrow or widen scope. Small, conventional, reversible calls (a variable name, a test case) you make yourself and mention.
2. **Log mistakes.** Whenever Brian corrects you, or you find after verifying that you were wrong, add an entry to `docs/MISTAKES.md` (`/log-mistake`). If a root cause repeats or costs real time, promote a one-line rule into this section. Read the **Distilled rules** at the top of that file before non-trivial work.
3. **Verify before claiming.** Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` for anything beyond docs. Report failures with the output; never say "done" on an assumption.
4. **Keep the docs honest.** After changing code, update the docs the table at the bottom points to. The pre-commit hook prints a reminder when `src/lib`, `src/state`, `src/contexts`, or `global.css` change without a docs change; `/sync-docs` does the reconciliation.
5. **Be creative when asked for ideas**, and offer better alternatives when you see them. Otherwise deliver the requested scope, whole.
6. **Real bugs you find go in `docs/KNOWN_ISSUES.md`**, not silently fixed or worked around. Fixing one is a scoped decision (rule 1).
7. **Propose a new doc, don't just write one.** When a new topic comes up that no doc covers and you think it is worth recording, ask Brian whether to create a new `docs/*.md` for it (say what it would hold and why); otherwise add to the closest existing doc.

## Commands

| Command                                        | What it does                                                                                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`                                     | Vite dev server (no type-check in dev)                                                                                                                 |
| `pnpm build`                                   | `tsc` type-gate (src incl. tests), Vite build to `dist/`, then every page prerendered into its HTML and the AI files written (ARCHITECTURE §7)         |
| `pnpm lint`, `pnpm typecheck`                  | ESLint over `src/` (Prettier violations are errors, any warning fails); `tsc --noEmit`                                                                 |
| `pnpm test [filter]`                           | Vitest single run; `pnpm test utils` filters (never `pnpm test -- utils`: pnpm passes the `--` through). Also `test:watch`, `test:coverage`            |
| `pnpm check:data`                              | Compares every server's numbers that have moved before with its own sources (GAME §6); the weekly workflow opens, updates or closes an issue           |
| `/release X.Y.Z`                               | Whole release: version, changelog entry (newest entry goes **last**), sitemap, README badge, PR `development → main`, tag, back-merge, `pnpm indexnow` |
| `/sync-docs`, `/log-mistake`, `/new-component` | Reconcile docs with code; log a mistake; scaffold a component in the house style with a test. Full list: `docs/COMMANDS.md`                            |

Package manager is **pnpm** (never npm/yarn). Node 26 locally and in CI (`engines`: ^22.22 || ^24.15 || >=26). Pre-commit (simple-git-hooks) runs lint-staged (ESLint, related Vitest tests, Prettier on staged files) and then `scripts/docs-drift.mjs`. CI (`.github/workflows/ci.yml`) runs lint, typecheck, test, build on pushes and PRs to `main`/`development`.

**Stack:** React 19 + TypeScript 5 (strict) + Vite 8 (rolldown) · Tailwind 4 (`cn()` = clsx + tailwind-merge) · Zustand 5 with `persist` · custom History-API router (no react-router) · @floating-ui/react tooltips · Recharts 3 · dayjs (import from `src/lib/dayjs.ts` only) · react-icons · Vitest 5 + Testing Library + jsdom.

## Map

```
src/
  main.tsx, App.tsx            entry: RouterProvider > App > BreakpointProvider; PageContent switches on path
  contexts/  RouterContext (pushState: { path, navigate }), BreakpointContext (isMobile <768, isTablet <1150)
  state/store.ts               the one Zustand store (useSelectedSymbol) · hooks/ usePower (power total), useBreakpoint
  lib/       symbols.json + data.ts + types.ts   game data → createInitialSymbols(region) → SymbolData[]
             regions.json + regions.ts            per-server profiles and overrides; gameToday() = the server's reset clock
             game.ts, utils.ts, inputs.ts         constants; core maths (updateSymbol, calculateDaysRemaining); input clamping
             calculator.ts, tools.ts, overview.ts, graph.ts   pure maths + labels behind each card
             routes.ts (pages, SEO, sitemap) · llms.ts (llms.txt + Markdown copies) · persistence.ts (saves) · format.ts (locale numbers/mesos/dates/plurals)
             analytics.ts (typed Umami events) · suggestion.ts (edition to suggest) · changelog.ts (versions; notes in i18n) · ratioData.ts · dayjs.ts (the only dayjs import)
  components/  Header, ServerMenu (site version + "Numbers from"), SuggestionBanner (D-9), Footer, Selector (symbol picker + Arcane/Sacred toggle), SEO (head tags), Tooltip, CreditText
    Calculator/  Calculator (inputs + next level), Tools (Selector/Catalyst previews), Overview (targets), Graph
    Handbook/, Extras/  TabLayout pages (ExpTable, CostTable, RatioTable; Changelog, Credits) · ui/ RadioButton, SlideButton, TabLayout
  next/      the 2.0 redesign at /next (ARCHITECTURE §2): a deletable UI copy sharing lib/state/i18n/hooks; routing.ts (NEXT_UI), NextApp.tsx, ui/ (kit), shell/, pages/, calculator/, handbook/, extras/
  i18n/      en/*.ts (English catalogue = every language's contract, incl. next.ts for /next-only copy) · index.ts (useMessages, interpolate) ·
             Message.tsx (renders <b>…</b>) · terms.ts (game terms per name set) · gameNames.ts (official names, GMS fallback)
  test/      setup.ts (mocks), helpers.ts (store/viewport/time/head), docs + seo meta-tests
docs/ (see below) · scripts/ docs-drift.mjs (pre-commit reminder), doc-staleness.mjs (session banner)
```

## Architecture in brief

- **Routes**: `/` (calculator page: Selector, Calculator, Tools, Overview, Graph), `/handbook`, `/changelog`, `/credits`. Unknown paths fall through to `/`. Calculator/Tools/Overview/Graph are `React.lazy`; the page sits in `ErrorBoundary` > `Suspense fallback={null}`.
- **Pages are declared once** in `src/lib/routes.ts` (path, title, description, nav entry, sitemap fields), and exist once per server edition (`EDITIONS`: GMS at `/`, others at `/msea`, `/kms`…; `splitPath`, `hrefFor(path, edition)`, `useEdition()`; ARCHITECTURE §2). `pageMetaFor(path, edition)` gives a page's title and description in the edition's own terms. `App.tsx`, `Header`, `Extras` and `SEO.tsx` read it; the routes plugin in `vite.config.ts` fills the `__PLACEHOLDER__` tokens in `index.html` and emits `sitemap.xml` (no file under `public/`). `src/test/seo.test.tsx` checks the generated output; ARCHITECTURE §2 explains the double head write.
- **State**: one store. What persists (localStorage key `maple-symbols-v2`, `STORAGE_VERSION` 4) is one save per server plus the server the player chose, and per symbol only its `id` and the player's fields (`src/lib/persistence.ts`); UI state resets on reload. `symbols` is always the shown server's list (`region`); `setRegion(region)` stores it and loads the other server's data and save. On load, `merge` rebuilds the chosen server's list from its game data and restores those fields by id; `migrate` turns an older single list into the GMS save, so nothing is wiped.
- **Data flow**: `symbols.json` → `createInitialSymbols()` → store → components read via selectors; inputs write with `updateSymbol(symbols, id, patch)`. Nothing derived is stored: symbols/days remaining and the completion date come from `progressToMax` (`src/lib/calculator.ts`) at read time, Graph builds its own series, power from `usePower`.

## Conventions

- Components: `const Name = () => { … }; export default Name;` with `interface NameProps` above and the three-line `―――` banner comment (copy one from a sibling). Lib files use the `// ---` banner with `file.ts — purpose`. PascalCase component files, camelCase lib/hooks.
- Store access is one selector per line: `const symbols = useAppStore((s) => s.symbols);`. Imperative reads inside handlers/effects use `useAppStore.getState()`.
- Conditional classes go through `cn()`; template-literal classNames exist in older files but don't add more. Never hand-order Tailwind classes (Prettier sorts them). Responsive: `md:` for style-only differences, `useBreakpoint()` when markup, props or copy differ.
- Reusable primitives live in `components/ui/`; feature components take store state directly rather than props.
- **No English literal in JSX.** Copy is a whole sentence in `src/i18n/en/<area>.ts`, `<b>…</b>` for accent words and `{name}` placeholders, never `<br>`; a game term (Sacred Symbol, Arcane Power, Catalyst…) is a term placeholder such as `{sacredSymbol}`, filled per edition (I18N §10); read it with `const m = useMessages().<area>;`, render markup with `<Message text={m.key} values={…} count={…} />`, plain strings with `m.key`/`interpolate()`. Analytics values and anything keyed on a name stay English (I18N §5).
- Tooltips: `<Tooltip placement="…"><TooltipTrigger>…</TooltipTrigger><TooltipContent className="tooltip">…</TooltipContent></Tooltip>`; the trigger form depends on what it wraps (gotcha 4).
- Prettier: 100 columns, double quotes, semicolons, LF. ESLint: `_`-prefixed unused vars allowed; `any` fails lint; the react-hooks dependency rules are **off**, so effect deps are curated by hand and on purpose.
- Tests are colocated `Name.test.ts(x)` with explicit `import { … } from "vitest"` (no globals). See `docs/TESTING.md`.
- Commits: short capitalised imperative subject, no prefix, no period ("Add weekly toggle to Cernium"). Stage files by name, never `git add -A`. 1.x fixes on `development` (PR into `main`), 2.0 work on `v2`.

## Domain cheat sheet

- 14 symbols: **arcane ids 1–6 (max level 20)**, **sacred ids 7–12 (max level 11)**, **grand ids 13–14** (Tallahart, Geardock: Sacred table, max 11; no weekly, extra, Catalyst or main stat, `null` in `game.ts`). The store can select Grand but only `/next` shows it; the current UI folds it to Sacred via `useMode()`, and `inFamily` counts Grand toward Sacred Power (GAME §4, ARCHITECTURE §3). Selection is by `id` (`selectedId`, `lastSelected` per family). JSON order only affects display order (gotcha 1).
- `symbolsRequired[L]` = symbols needed to go from level L to L+1 (`[0]` is 0). Totals: arcane 2679, sacred 4565. `mesosRequired[L]` likewise = cost of the L→L+1 upgrade.
- Power: arcane `level*10 + 20` (max 220/symbol), sacred `level*10` (max 110). Every level-up is +10 in the Graph.
- Daily rate: `dailySymbols × (extra ? (arcane 2 : sacred 1.5) : 1)`, 0 when the daily toggle is off. Weekly quests exist only on arcane and add **240 per weekly reset**. Day counts start **tomorrow** on the server's game clock (`gameToday()`: 00:00 UTC for GMS, not the visitor's calendar) and the weekly lands on each counted **Thursday** (the reset day in every region since 2025–26; GAME §3), so a weekly-only answer is the distance to next Thursday. Extra exists only on Vanishing Journey and Chu Chu.
- Days/dates: `calculateDaysRemaining(needed, daily, hasWeekly)` returns 0 (nothing needed), `Infinity` (no progress possible), or `NaN` (bad input); completion = today + days (`YYYY-MM-DD`). Overview shows 0 as "Complete" / "Ready for upgrade"; Infinity, NaN, or no quest enabled as "Indefinite" / "? days" (keyed on `daily`/`weekly`/`experience`, not on the number).
- `NaN` means **unset** for `level`/`experience` (`isValid`); inputs render `""` for NaN. Number inputs (`clampNumberInput`) treat blank and negative as unset and floor everything else with a minimum of 1, so "0", "00", "0.5" and "-0" all give level 1.
- `locked` (default) caps experience at the next-level requirement; unlocked caps at the full-table total and the check icon converts overflow into levels. Catalyst keeps 80% (arcane) / 60% (sacred) of cumulative exp and needs level ≥ 2; +100/+200 main stat per level.
- What each number means, where it came from and how far to trust it (GMS only; each number's status, confirmed or sourced, in GAME §0 and §7): `docs/GAME.md`. Constants live in `src/lib/game.ts`, tables in `symbols.json` and `ratioData.ts`.

## Gotchas (the ones that bite)

1. **Symbols are addressed by `id`, never by array index** (v2 identity refactor). `selectedId`/`lastSelected` hold ids, `updateSymbol` takes an id, `useSelectedSymbol()` resolves the current one, `selectSymbol(id)`/`setMode(type)` are the only ways to change selection. Don't reintroduce `symbols[i]` lookups; the one positional thing left is the Selector's indicator bar (position within the six shown symbols, ARCHITECTURE §9).
2. **`symbols.json` is the GMS base of all game data, for returning players too; `regions.json` holds only what differs per server** (read through `createInitialSymbols(region)` and `REGION_PROFILES`, never directly). Saves hold just `id` + `level`, `experience`, `daily`, `weekly`, `extra`, `locked`, restored by id onto fresh data (KI-001 resolved). So a patch to tables or quest counts, or a new symbol, needs no `STORAGE_VERSION` bump. Two things still do need care: never change or reuse an existing symbol's `id` (saved progress is keyed on it), and bump the version only if a _player_ field changes meaning, with a real migration in `migrate`.
3. **Derive, don't cache.** `SymbolData` holds static data and user input only; anything computed (remaining, days, dates, power) is a pure function in `src/lib` taking `now` where time matters. Don't add a derived field to the store or an effect that writes one back (that was KI-002).
4. **Never give a react-icons or `RadioButton` child to `<TooltipTrigger asChild>`**: they are function components that drop the ref, so floating-ui has no anchor. An icon goes in a plain `<TooltipTrigger>`, which renders its own `<button>`. `asChild` is for a single DOM element (`<button>`, `<input>`); a trigger around inputs, buttons or a `RadioButton` (itself a `role="radio"` button) uses `as="div"` so nothing interactive nests in a button (KI-007, KI-011). Radio sets sit in a `role="radiogroup"` with an `aria-label`. `src/test/interactiveNesting.test.tsx` fails on any nesting.
5. **Global CSS**: every `<span>` is accent purple; every `<button>`/`<input>` is `rounded-lg` with a pointer cursor and an accent ring on keyboard focus only; every `<img>` is `pointer-events-none` (put `onClick`/`cursor-pointer` on the parent, not the image).
6. **The clamp and relock effects (Calculator, and their /next port in `src/next/calculator/useSymbolEditor.ts`) are boolean-guarded and omit `symbols` from their deps on purpose**; adding `symbols` would loop. A **new input** to the maths (a new quest flag, say) must be hand-added to `getDailySymbols`, to Overview's `targetDays` memo deps, and on /next to useSymbolEditor's `daysToNextLevel` deps and CalculatorCard's `dailyRate`; lint won't remind you (exhaustive-deps is off). Checklist in ARCHITECTURE §9.
7. Use `symbol.type` for per-symbol rules (`maxLevelFor(symbol.type)`, `isMaxLevel(level, type)`, `CATALYST_RETENTION[type]`) and `mode` only for which list is shown. `setMode` switches mode and selection atomically, so the selected symbol always matches the mode (KI-006 resolved).
8. `tsc` runs in `build` with `noUnusedLocals`: an unused import fails the build. `.gitattributes` (`* text=auto eol=lf`) forces LF in the working tree and overrides `core.autocrlf` (which is `true` system-wide on this machine); never weaken that attribute or touch git config to "fix" line endings. If lint fails on `␍`, run `git ls-files --eol | grep w/crlf`.
9. Before adding content to a card or replacing an image: DESIGN_SYSTEM §5 (fixed 360 px phone width, 650/700 px pane heights) and SEO-20 (`public/` files revalidate on every load, so an image replaced in place does reach returning visitors; only hashed `/assets/*` is immutable).

## Which doc when

- `docs/ARCHITECTURE.md`: state, routing, data flow, effects, build/deploy. **§9 Checklists** for adding a route, a symbol, a quest toggle, or changing `SymbolData`; **§8 Decisions** for what looks odd but is intentional.
- `docs/DESIGN_SYSTEM.md`: any UI work; tokens, recipes with exact class strings, responsive/motion rules, new-component checklist.
- `docs/TESTING.md`: writing or fixing tests; helpers, mocks, frozen-time fixtures, recipes per layer, the traps (tooltips, Overview duplicates, lazy sections).
- `docs/SEO.md`: anything search engines see: `routes.ts` entries, `index.html`, `SEO.tsx`, `vercel.json`, headings, copy, images, performance. Numbered rules (cite as `SEO-n`), the query map, and the audit backlog. The goal is rank one, so treat its rules as requirements, not advice.
- `docs/AI_SEARCH.md`: anything AI agents read: `llms.txt`, the Markdown copies of the pages (`src/lib/llms.ts`, `scripts/ai-files.mjs`), the AI crawlers in `robots.txt`. Rules cite as `AI-n`.
- `docs/I18N.md`: before adding a user-facing string, touching `src/lib/routes.ts`, or any work on the language selector. Korean, Japanese, Traditional and Simplified Chinese are planned; §5 has the rules that apply to new copy **today**. `docs/REGIONS.md`: one edition per server (GMS, MSEA, KMS, JMS, TMS, CMS) with its own data, URLs, SEO, reset clock and names; the 2.0 design for anything per region (whole sentences, no `<br>` in copy, locale-aware formatting, `Intl.PluralRules`).
- `docs/ANALYTICS.md`: before adding, changing or removing any tracking. Umami Cloud (free Hobby plan) plus Google Search Console read side by side; §3 is the event catalogue and every event must name the decision it informs.
- `docs/KNOWN_ISSUES.md`: before "fixing" behaviour that looks wrong, and when a test pins something odd. `docs/MISTAKES.md`: distilled rules at the top, log below.
- `docs/GAME.md`: game data and mechanics, provenance, Grand Sacred unknowns, the patch checklist. `docs/PLAYERS.md`: who uses the site, and what is still unknown about them.
- `docs/V2_PLAN.md`: the 2.0 overhaul: scope, branch, what is pinned, what is reusable, upgrade order, and the decisions already made.

## Keep the docs honest

| If you change…                                                                                                    | Update…                                                                                            |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/lib/utils.ts`, `data.ts`, `game.ts`, `symbols.json`, `regions.json`, `ratioData.ts`, `hooks/usePower.ts`     | Cheat sheet above; ARCHITECTURE §4; GAME §1–2 tables (the docs test fails) and §7 provenance log   |
| `src/state/store.ts`, `lib/types.ts`                                                                              | ARCHITECTURE §3 State; gotchas 2–3 above; TESTING §4 Recipes → Store                               |
| `src/contexts/*`, `src/lib/routes.ts`, `App.tsx` routes                                                           | ARCHITECTURE §2 Routing and §9 (the seo test fails on drift)                                       |
| `components/Calculator/*` effects, quest toggles, Overview labels                                                 | ARCHITECTURE §5 Effects table; DESIGN_SYSTEM §6 recipe names; the Days/dates line above            |
| `index.html`, `SEO.tsx`, `vercel.json`, `robots.txt`, the manifest, headings, page copy, images                   | SEO §1 table / §2 rules / §4 backlog (every rule must stay true of the code)                       |
| `src/lib/llms.ts`, `scripts/ai-files.mjs`, the AI crawlers in `robots.txt`, the Markdown headers in `vercel.json` | AI_SEARCH §1 table / §2 rules / §4 backlog                                                         |
| User-facing copy, `src/i18n/`, `src/lib/routes.ts` titles, the language selector                                  | I18N §2 volumes and §3 blockers (add a row when new work introduces one)                           |
| Any tracking call, the analytics wrapper in `src/lib/`, the analytics script in `index.html`                      | ANALYTICS §3 catalogue (a new event needs its decision column filled in the same commit)           |
| `src/global.css` (tokens + global rules), `components/ui/*`, Tooltip                                              | DESIGN_SYSTEM §2 tokens / §6 recipes / §9 global CSS (the docs test checks the `@theme` variables) |
| `package.json` scripts/deps, `vitest.config.ts`, hooks, CI, `scripts/check-game-data.mjs`                         | Commands/Stack above; TESTING §1 and §3                                                            |
| A correction from Brian, or a wrong assumption of yours                                                           | MISTAKES (`/log-mistake`)                                                                          |
