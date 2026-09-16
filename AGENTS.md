# Maple Symbols — Agent Guide

MapleStory Arcane/Sacred **symbol calculator**: a single-page React app (no backend) where a player enters each symbol's level and experience, toggles daily/weekly quests, and gets completion dates, meso costs, a power graph, and reference tables. Live at maplesymbols.com, deployed by Vercel from `main`.

Auto-loaded every session (via `CLAUDE.md`). Only what most tasks need lives here; the deep docs in `docs/` are read on demand (see "Which doc when"). Keep it under ~120 lines: anything longer than two lines that a deep doc covers belongs there, with a pointer here.

## Rules for working here

1. **Ask before deciding.** Configuration, design, and architecture choices that matter are Brian's to make. Use the question tool: give two or three alternatives that are genuinely as good, say which you recommend and why, then wait. Don't assume, and don't quietly narrow or widen scope. Small, conventional, reversible calls (a variable name, a test case) you make yourself and mention.
2. **Log mistakes.** Whenever Brian corrects you, or you find after verifying that you were wrong, add an entry to `docs/MISTAKES.md` (`/log-mistake`). If a root cause repeats or costs real time, promote a one-line rule into this section. Read the **Distilled rules** at the top of that file before non-trivial work.
3. **Verify before claiming.** Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` for anything beyond docs. Report failures with the output; never say "done" on an assumption.
4. **Keep the docs honest.** After changing code, update the docs the table at the bottom points to. The pre-commit hook prints a reminder when `src/lib`, `src/state`, `src/contexts`, or `global.css` change without a docs change; `/sync-docs` does the reconciliation.
5. **Be creative when asked for ideas**, and offer better alternatives when you see them. Otherwise deliver the requested scope, whole.
6. **Real bugs you find go in `docs/KNOWN_ISSUES.md`**, not silently fixed or worked around. Fixing one is a scoped decision (rule 1).

## Commands

| Command                                        | What it does                                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                     | Vite dev server (no type-check in dev)                                                                                                      |
| `pnpm build`                                   | `tsc` type-gate (src incl. tests) then Vite build to `dist/`                                                                                |
| `pnpm lint`                                    | ESLint over `src/`; Prettier violations are errors; any warning fails                                                                       |
| `pnpm typecheck`                               | `tsc --noEmit`                                                                                                                              |
| `pnpm test [filter]`                           | Vitest single run; `pnpm test utils` filters (never `pnpm test -- utils`: pnpm passes the `--` through). Also `test:watch`, `test:coverage` |
| `/release X.Y.Z`                               | Whole release: version, changelog entry (newest entry goes **last**), sitemap, README badge, PR `development → main`, tag, back-merge       |
| `/sync-docs`, `/log-mistake`, `/new-component` | Reconcile docs with code; log a mistake; scaffold a component in the house style with a test. Full list: `docs/COMMANDS.md`                 |

Package manager is **pnpm** (never npm/yarn). Node 26 locally and in CI (`engines`: ^22.22 || ^24.15 || >=26). Pre-commit (simple-git-hooks) runs lint-staged (ESLint, related Vitest tests, Prettier on staged files) and then `scripts/docs-drift.mjs`. CI (`.github/workflows/ci.yml`) runs lint, typecheck, test, build on pushes and PRs to `main`/`development`.

## Stack

React 19 + TypeScript 5 (strict) + Vite 8 (rolldown) · Tailwind 4 (`cn()` = clsx + tailwind-merge) · Zustand 5 with `persist` · custom History-API router (no react-router) · @floating-ui/react tooltips · Recharts 3 · dayjs (import from `src/lib/dayjs.ts` only) · react-icons · Vitest 5 + Testing Library + jsdom.

## Map

```
src/
  main.tsx, App.tsx            entry; RouterProvider > App > BreakpointProvider; PageContent switches on path
  contexts/  RouterContext     pushState/popstate router: { path, navigate }
             BreakpointContext isMobile (<768px) / isTablet (<1150px); two matchMedia listeners app-wide
  state/store.ts               the one Zustand store (symbols, mode, selectedId, lastSelected per type; useSelectedSymbol)
  lib/       symbols.json      exp tables, the 12 symbol definitions, meso tables (other constants: see cheat sheet)
             data.ts           createInitialSymbols(): json → SymbolData[]
             types.ts          SymbolData, SymbolType
             utils.ts          cn, isValid, isMaxLevel, updateSymbol, getDailySymbols,
                               getRemainingSymbols, advanceDayCount, calculateDaysRemaining
             game.ts           MAX_LEVEL/maxLevelFor, WEEKLY_SYMBOLS, extra/catalyst/power/main-stat constants
             inputs.ts         clampNumberInput, levelInputPatch, expCapFor, experienceInputValue
             calculator.ts, tools.ts, overview.ts, graph.ts   pure maths + label strings behind each card
             dayjs.ts          singleton with plugins; changelog.ts; ratioData.ts
  hooks/     usePower          arcane/sacred power total; useBreakpoint (re-export)
  components/
    Header, Footer, Selector (symbol picker + Arcane/Sacred toggle), SEO (head tags), Tooltip, CreditText
    Calculator/  Calculator (inputs + next-level panel), Tools (Symbol Selector / Catalyst previews),
                 Overview (per-symbol target table), Graph (power-over-time chart)
    Handbook/    TabLayout page: ExpTable, CostTable, RatioTable
    Extras/      TabLayout page: Changelog (/changelog), Credits (/credits)
    ui/          RadioButton, SlideButton, TabLayout (reusable primitives)
  test/      setup.ts (mocks), helpers.ts (store/viewport/time/head helpers), docs + seo meta-tests
docs/        ARCHITECTURE, DESIGN_SYSTEM, TESTING, KNOWN_ISSUES, MISTAKES
scripts/     docs-drift.mjs (pre-commit reminder), doc-staleness.mjs (session-start banner)
```

## Architecture in brief

- **Routes**: `/` (calculator page: Selector, Calculator, Tools, Overview, Graph), `/handbook`, `/changelog`, `/credits`. Unknown paths fall through to `/`. Calculator/Tools/Overview/Graph are `React.lazy`; the page sits in `ErrorBoundary` > `Suspense fallback={null}`.
- **Page metadata** (title/description) lives in three places (`index.html` static tags + `pageMap`, `App.tsx` SEO props, `SEO.tsx` defaults) and the route URLs also in `public/sitemap.xml`; `src/test/seo.test.tsx` enforces agreement, ARCHITECTURE §2 explains the double write.
- **State**: one store. Only `symbols` persists (localStorage key `maple-symbols-v2`, `STORAGE_VERSION` 2); UI state resets on reload. `partialize` zeroes derived fields; `merge` turns JSON `null` back into `NaN`; `migrate` **resets symbols** on a version bump.
- **Data flow**: `symbols.json` → `createInitialSymbols()` → store → components read via selectors; inputs write with `updateSymbol(symbols, id, patch)`. Derived fields (`symbolsRemaining`, `daysRemaining`, `completion`) are written back into the store by one effect in Calculator, for the selected symbol only. Graph recomputes its own dates.
- **Responsive**: Tailwind `md:` for style-only differences; `useBreakpoint()` when markup, prop values, or copy differ.

## Conventions

- Components: `const Name = () => { … }; export default Name;` with `interface NameProps` above and the three-line `―――` banner comment (copy one from a sibling). Lib files use the `// ---` banner with `file.ts — purpose`. PascalCase component files, camelCase lib/hooks.
- Store access is one selector per line: `const symbols = useAppStore((s) => s.symbols);`. Imperative reads inside handlers/effects use `useAppStore.getState()`.
- Conditional classes go through `cn()`; template-literal classNames exist in older files but don't add more. Never hand-order Tailwind classes (Prettier sorts them).
- Reusable primitives live in `components/ui/`; feature components take store state directly rather than props.
- Tooltips: `<Tooltip placement="…"><TooltipTrigger asChild>…</TooltipTrigger><TooltipContent className="tooltip">…</TooltipContent></Tooltip>`; accent words are bare `<span>`s (global CSS colours every span).
- Prettier: 100 columns, double quotes, semicolons, LF. ESLint: `_`-prefixed unused vars allowed; `any` fails lint; the react-hooks dependency rules are **off**, so effect deps are curated by hand and on purpose.
- Tests are colocated `Name.test.ts(x)` with explicit `import { … } from "vitest"` (no globals). See `docs/TESTING.md`.
- Commits: short capitalised imperative subject, no prefix, no period ("Add weekly toggle to Cernium"). Work on `development`, PR into `main`.

## Domain cheat sheet

- 12 symbols: **arcane ids 1–6 (max level 20)**, **sacred ids 7–12 (max level 11)**. `mode` (`"arcane"` | `"sacred"`) is the type the UI shows; selection is by `id` (`selectedId`, with `lastSelected` remembered per type). JSON order only affects display order (gotcha 1).
- `symbolsRequired[L]` = symbols needed to go from level L to L+1 (`[0]` is 0). Totals: arcane 2679, sacred 4565. `mesosRequired[L]` likewise = cost of the L→L+1 upgrade.
- Power: arcane `level*10 + 20` (max 220/symbol), sacred `level*10` (max 110). Every level-up is +10 in the Graph.
- Daily rate: `dailySymbols × (extra ? (arcane 2 : sacred 1.5) : 1)`, 0 when the daily toggle is off. Weekly quests exist only on arcane and add **120 per Monday reset**. Extra exists only on Vanishing Journey and Chu Chu.
- Days/dates: `calculateDaysRemaining(needed, daily, hasWeekly)` returns 0 (nothing needed), `Infinity` (no progress possible), or `NaN` (bad input); completion = today + days (`YYYY-MM-DD`). Overview shows 0 as "Complete" / "Ready for upgrade"; Infinity, NaN, or no quest enabled as "Indefinite" / "? days" (keyed on `daily`/`weekly`/`experience`, not on the number).
- `NaN` means **unset** for `level`/`experience` (`isValid`); inputs render `""` for NaN. Typing exactly "0" as a level gives 1, but "00"/"0.5"/"-0" store 0 (KI-010).
- `locked` (default) caps experience at the next-level requirement; unlocked caps at the full-table total and the check icon converts overflow into levels. Catalyst keeps 80% (arcane) / 60% (sacred) of cumulative exp and needs level ≥ 2; +100/+200 main stat per level.
- Game constants live in `src/lib/game.ts` (max levels, weekly 120, extra/catalyst multipliers, power formula, main stat); `symbols.json` holds the tables and `ratioData.ts` the damage ratios. Still literal: the `-20%/-40% EXP` copy in `Tools.tsx` and the HP/all-stat tooltip in `Calculator.tsx`.

## Gotchas (the ones that bite)

1. **Symbols are addressed by `id`, never by array index** (v2 identity refactor). `selectedId`/`lastSelected` hold ids, `updateSymbol` takes an id, `useSelectedSymbol()` resolves the current one, `selectSymbol(id)`/`setMode(type)` are the only ways to change selection. Don't reintroduce `symbols[i]` lookups; the one positional thing left is the Selector's indicator bar (position within the six shown symbols, ARCHITECTURE §9).
2. **Game data is frozen in users' localStorage.** `partialize` persists every `SymbolData` field and `merge` adopts the persisted array wholesale, so `symbols.json` edits don't reach returning users, and a **new symbol is absent for them entirely**, unless `STORAGE_VERSION` is bumped, which wipes their levels (KI-001). Adding a symbol forces that decision (rule 1).
3. **Derived fields are only fresh for the selected symbol**; after a reload Overview shows "Complete / Ready for upgrade / 0" for the others until each is clicked (KI-002). Don't build on stored `daysRemaining`/`symbolsRemaining` for non-selected symbols; compute like Graph does.
4. **The `{" "}` before a react-icons or `RadioButton` child inside `<TooltipTrigger asChild>` is load-bearing.** It makes `children` an array, so the trigger falls back to rendering a `<button>`; without it floating-ui puts a ref on a function component and the tooltip loses its anchor. A `<button>`/`<div>` child goes in directly, with no `{" "}` (adding one nests a button in a button).
5. **Global CSS**: every `<span>` is accent purple; every `<button>`/`<input>` is `rounded-lg` with an accent focus ring; every `<img>` is `pointer-events-none` (put `onClick`/`cursor-pointer` on the parent, not the image).
6. **Calculator's derived-fields effect omits `symbols` from its deps on purpose and compares with `Object.is`** (NaN-safe; the other two store-writing effects are boolean-guarded). The original infinite loop was `NaN !== NaN` with `symbols` in deps, so keep both guards. Conversely, any **new input** to the derived fields (a new quest flag, say) must be hand-added to that effect's deps, Overview's `targetDays` memo deps, and `getDailySymbols`; lint won't remind you (exhaustive-deps is off). Checklist in ARCHITECTURE §9.
7. Use `symbol.type` for per-symbol rules (`maxLevelFor(symbol.type)`, `isMaxLevel(level, type)`, `CATALYST_RETENTION[type]`) and `mode` only for which list is shown. `setMode` switches mode and selection atomically, so the selected symbol always matches the mode (KI-006 resolved).
8. `tsc` runs in `build` with `noUnusedLocals`: an unused import fails the build. `.gitattributes` (`* text=auto eol=lf`) forces LF in the working tree and overrides `core.autocrlf` (which is `true` system-wide on this machine); never weaken that attribute or touch git config to "fix" line endings. If lint fails on `␍`, run `git ls-files --eol | grep w/crlf`.
9. Before adding content to a card or replacing an image: DESIGN_SYSTEM §5 (fixed 360 px phone width, 650/700 px pane heights) and KI-009 (`public/` images are cached for a year; rename, don't replace in place).

## Which doc when

- `docs/ARCHITECTURE.md`: state, routing, data flow, effects, build/deploy. **§9 Checklists** for adding a route, a symbol, a quest toggle, or changing `SymbolData`; **§8 Decisions** for what looks odd but is intentional.
- `docs/DESIGN_SYSTEM.md`: any UI work; tokens, recipes with exact class strings, responsive/motion rules, new-component checklist.
- `docs/TESTING.md`: writing or fixing tests; helpers, mocks, frozen-time fixtures, recipes per layer, the traps (tooltips, Overview duplicates, lazy sections).
- `docs/KNOWN_ISSUES.md`: before "fixing" behaviour that looks wrong, and when a test pins something odd.
- `docs/MISTAKES.md`: distilled rules at the top, log below.
- `docs/V2_PLAN.md`: the 2.0 overhaul: scope, branch, what is pinned, what is reusable, upgrade order, and the decisions already made.

## Keep the docs honest

| If you change…                                                       | Update…                                                                                            |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/lib/utils.ts`, `data.ts`, `symbols.json`, `hooks/usePower.ts`   | Domain cheat sheet above; ARCHITECTURE §4 Data; KNOWN_ISSUES if an issue moved                     |
| `src/state/store.ts`, `lib/types.ts`                                 | ARCHITECTURE §3 State; gotchas 2–3 above; TESTING §4 Recipes → Store                               |
| `src/contexts/*`, `App.tsx` routes, page titles                      | ARCHITECTURE §2 Routing and §9; the metadata places (the seo test fails otherwise)                 |
| `components/Calculator/*` effects, quest toggles, Overview labels    | ARCHITECTURE §5 Effects table; DESIGN_SYSTEM §6 recipe names; the Days/dates line above            |
| `src/global.css` (tokens + global rules), `components/ui/*`, Tooltip | DESIGN_SYSTEM §2 tokens / §6 recipes / §9 global CSS (the docs test checks the `@theme` variables) |
| `package.json` scripts/deps, `vitest.config.ts`, hooks, CI           | Commands/Stack above; TESTING §1 and §3                                                            |
| A correction from Brian, or a wrong assumption of yours              | MISTAKES (`/log-mistake`)                                                                          |
