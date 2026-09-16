# Testing

Vitest + Testing Library + jsdom, colocated tests, explicit imports. This doc is the reference for writing a new test: what is mocked for you, the helpers, a recipe per layer, and the traps this codebase sets.

## 1. Stack and commands

| Piece                                                                   | Version / note                                                                              |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `vitest` + `@vitest/coverage-v8`                                        | 5.x (needs Vite ≥ 6.4 and Node ≥ 22.12; Vite is 8.3, Node is 26)                            |
| `jsdom`                                                                 | 30.x (needs Node 22.22+, 24.15+ or 26+; the `engines` field in `package.json` mirrors that) |
| `@testing-library/react` 16, `/dom` 10, `/jest-dom` 7, `/user-event` 14 |                                                                                             |
| `@types/node`                                                           | for `node:fs` in the meta-tests                                                             |

- `pnpm test` (single run), `pnpm test:watch`, `pnpm test:coverage` (v8 over `src/**/*.{ts,tsx}` minus `main.tsx`, `src/test/**`, `*.d.ts` and the tests themselves; text + html).
- Filter: `pnpm test utils` or `pnpm test src/state`. Never `pnpm test -- utils`: pnpm passes the `--` through to Vitest, which then ignores the filter and runs everything.
- Config: `vitest.config.ts` (standalone, `plugins: [react()]`, `environment: jsdom`, `setupFiles: src/test/setup.ts`, `css: false`, `include: src/**/*.test.{ts,tsx}`). It is deliberately not merged with `vite.config.ts` so the build-only compression plugins never run.
- `tsc` type-checks tests as part of `pnpm build` (tsconfig `include: ["src"]`), so a type error in a test breaks the build.
- Pre-commit runs `vitest related --run --passWithNoTests` on staged `.ts/.tsx` files (inside lint-staged), then `scripts/docs-drift.mjs` after lint-staged (outside it, because lint-staged hides the output of passing tasks); CI runs the full suite.

## 2. Placement and style

- Colocated: `src/lib/utils.test.ts`, `src/components/Selector.test.tsx`. Shared helpers and cross-cutting meta-tests live in `src/test/`.
- No globals: `import { describe, expect, it, vi } from "vitest"` in every file. jest-dom matchers (`toBeInTheDocument`, …) are registered by `setup.ts`.
- Describe what the user or caller sees, in plain English; one behaviour per `it`. Prefer `screen.getByText/ByAltText/ByPlaceholderText` over test ids or class names.
- Pin **current** behaviour, even when it is a known bug, and say so in a comment with the `KI-` id; a fix then changes the test deliberately.

## 3. What `setup.ts` and `helpers.ts` give you

`src/test/setup.ts` (runs before each file):

- `window.matchMedia` mock: nothing matches by default (= desktop). `BreakpointProvider` reads it once on mount.
- `ResizeObserver` stub (Recharts constructs one unguarded; floating-ui guards its own).
- `afterEach`: RTL `cleanup()`, `vi.useRealTimers()` (also undoes `setSystemTime`), viewport reset, **store reset**, `localStorage.clear()` (after the reset, because resetting writes through `persist`), removal of the SEO JSON-LD script, `history.replaceState("/")`.

`src/test/helpers.ts`:

| Helper                                           | Use                                                                                                         |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `setViewport("mobile" \| "tablet" \| "desktop")` | call **before** rendering a `<BreakpointProvider>`; drives the matchMedia mock                              |
| `resetStore()`                                   | `useAppStore.setState({ ...getInitialState(), symbols: createInitialSymbols() }, true)`; runs automatically |
| `seedSymbol(id, patch, select = true)`           | patch one symbol by id (1–6 arcane, 7–12 sacred) and select it via `selectSymbol` (switches `mode` too)     |
| `SUN`, `MON`, `WED`, `SAT`                       | `Date` fixtures for `vi.setSystemTime` (13–19 Sept 2026, 10:00 local)                                       |
| `seedHeadMeta()`                                 | recreate the `<meta>`/`<link>` tags `index.html` ships so `SEO.tsx` has something to update                 |

Leaf components render without any provider: `useRouter()` and `useBreakpoint()` fall back to `/` and desktop.

## 4. Recipes

**Pure function** (`src/lib/*.test.ts`): import, call, assert. Build fixtures from `createInitialSymbols()` (`[0]` = Vanishing Journey, id 1, arcane, 10/day, weekly + extra; `[6]` = Cernium, id 7, sacred, 20/day) and spread patches over them.

**Hook**: `renderHook(() => usePower(symbols, "arcane"))` → `result.current`. Re-render with a new array to recompute; memoisation is by reference.

**Store** (`src/state/store.test.ts`): set state, then `JSON.parse(localStorage.getItem("maple-symbols-v2"))` to assert what `partialize` wrote (`{ state: { symbols }, version: 2 }`, NaN → `null`). To test `merge`/`migrate`, seed localStorage and `await useAppStore.persist.rehydrate()`. The store is a module singleton hydrated at import; use `vi.resetModules()` + a dynamic import only if you need "storage seeded before creation".

**Component that reads the store**: seed with `seedSymbol(...)` or `useAppStore.setState(...)`, `render(<Component />)`, drive with `fireEvent.change/click`, then assert on `screen` **and** on `useAppStore.getState()` (the UI often shows derived text while the store holds the number). Number inputs: `fireEvent.change(input, { target: { value: "25" } })`.

**Component that navigates**: wrap in `<RouterProvider>`, `vi.spyOn(window.history, "pushState")`, click, `await waitFor(...)` (path updates inside `startTransition`). Without the provider, `navigate` is a silent no-op and the test passes vacuously, so always assert on the spy or `window.location.pathname`. To simulate back/forward, `pushState` then `dispatchEvent(new PopStateEvent("popstate"))`; jsdom's `history.back()` is asynchronous.

**Viewport-dependent component**: `setViewport("mobile")` then render inside `<BreakpointProvider>`. Header's mobile menu needs `mobile` (which also makes `isTablet` true). Elements hidden with `md:hidden`/`hidden` are still in the DOM (CSS is not loaded) so use `getAllBy*` and assert on classes or on JS-branched content, not `toBeVisible()`.

**Time**: anything touching `dayjs()` or `new Date()` (`advanceDayCount`, `calculateDaysRemaining`, completion dates, Overview's target date, Graph, Footer's `new Date().getFullYear()`) must freeze the clock: `vi.setSystemTime(WED)`. That alone mocks `Date` without enabling fake timers, which keeps RTL's `waitFor` working. Always use the local-time `Date` fixtures; `new Date("2026-09-16")` is UTC midnight and lands on the previous evening in the Americas, shifting the weekday.

Known-good values (verified by `src/lib/utils.test.ts`; counting starts tomorrow and the weekly lands on the first counted Monday, so a weekly-only answer is the distance to next Monday):

| Frozen day     | Call `calculateDaysRemaining(needed, daily, weekly)` | Days   |
| -------------- | ---------------------------------------------------- | ------ |
| any            | `(0, 10, false)`, `(-5, 0, false)`                   | 0      |
| any            | `(NaN, 10, true)`                                    | NaN    |
| any            | `(50, 0, false)`                                     | ∞      |
| any            | `(12, 10, false)` / `(100, 10, false)`               | 2 / 10 |
| Wed 2026-09-16 | `(120, 0, true)` / `(121, 0, true)`                  | 5 / 12 |
| Mon 2026-09-14 | `(120, 0, true)`                                     | 7      |
| Sat 2026-09-19 | `(120, 0, true)`                                     | 2      |
| Sun 2026-09-13 | `(120, 0, true)`                                     | 1      |
| Wed 2026-09-16 | `(200, 20, true)` / `(200, 20, false)`               | 5 / 10 |

**Head / SEO**: call `seedHeadMeta()` first (`SEO.setMeta` no-ops on missing tags), render, assert `document.title`, `meta[...]` `content`, `link[rel=canonical]` `href`, and the `script[data-seo-ld]` JSON.

## 5. Traps specific to this codebase

- **Selection is by id and tied to `mode`.** `seedSymbol(id, …)` calls `selectSymbol`, which also switches `mode` to that symbol's type; set `mode`/`selectedId` directly only when you want them deliberately out of sync.
- **Tooltips** portal into `document.body` with `role="tooltip"` and mount at `opacity: 0`: query on `screen`, assert `toBeInTheDocument()`, not visibility. Hover opens after 400 ms; prefer `fireEvent.focus(trigger)`, which opens instantly. If you must hover, `vi.useFakeTimers()` + `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`, and never mix Vitest fake timers with `waitFor`/`findBy` (RTL only recognises Jest's).
- **`TooltipTrigger` without `asChild` renders a `<button>`** (or the tag named by `as`), so an icon trigger is a role-`button` wrapper; Calculator's level/exp trigger is `as="div"` and Tools' before/after previews are `as="div"` with a `tabIndex`, so those are not buttons. Query inputs by placeholder, not role. React 19 reports nesting as `console.error("In HTML, %s cannot be a descendant of <%s>…")`; to check for it, spy on `console.error` and match `descendant`, since Vitest 5 defaults to `silent: "passed-only"` and hides console output from passing tests (`pnpm test --silent=false <filter>` shows it).
- **Lazy sections + `Suspense fallback={null}`**: on the `/` page nothing from Calculator/Tools/Overview/Graph exists until the chunks load. Use `findBy*`/`waitFor`; the per-route metadata test allows 15 s (20 s test timeout) for every route because the `/` route's recharts chunk is heavy in jsdom.
- **Overview renders every row of the current mode plus each row's collapsed expander panel** (`hidden`, still in the DOM), so status strings such as "Indefinite" or "0" match up to seven times and `getByText` throws. Scope with `within(screen.getAllByAltText(name)[0].closest("button")!)`. The collapsed-row strings are derived from `level`/`experience`/quests at render (`progressToMax`), so Overview can be rendered alone; freeze time with `vi.setSystemTime(WED)` when asserting dates or day counts.
- **Store-writing effects** (Calculator's clamp and relock) run on mount for the selected symbol; a test that seeds a ready-and-locked symbol will see `experience` clamped. Nothing derived is written to the store, so `vj()` after a render equals what you seeded.
- **Images have `pointer-events-none` in production CSS.** Click the wrapping `<button>` as a user would: `screen.getByAltText(name).closest("button")` in Selector (one image per symbol), `screen.getAllByAltText(name)[0].closest("button")` in Overview (a desktop and a mobile image per row, so `getByAltText` throws).
- **Global CSS is not loaded**: `hidden` classes, gradients, focus rings, and the `span` accent are inert; test behaviour and text, not colours.
- **`any` fails lint** in tests too: the rule is only `warn` in `eslint.config.js`, but `pnpm lint` and the pre-commit hook run with `--max-warnings 0`. Use `unknown` and narrow.

## 6. Leave to manual or E2E

Recharts output (the `ResponsiveContainer` measures 0×0 in jsdom, so paths, ticks, dots, and the chart tooltip never render; only a smoke test is worth automating until the series maths is extracted), floating-ui positioning (`getBoundingClientRect` is all zeros), Tailwind breakpoints/gradients/transitions, the `index.html` bootstrap script (runs before React), the Samsung `alert`, real cross-reload persistence, `onWheel` blur.

## 7. Meta-tests that keep the docs and metadata honest

- `src/test/docs.test.ts`: every backticked string that looks like a repo path (`src/`, `docs/`, `public/`, `scripts/`, `.claude/`, `.github/` prefixes or one of a fixed list of root files, see `PATH_LIKE`; globs and JSX are skipped) in `AGENTS.md`, `docs/*`, and `.claude/commands/*` exists; the token table in `docs/DESIGN_SYSTEM.md` (between the `tokens:start`/`tokens:end` markers) matches the `@theme` variables in `src/global.css` exactly, both ways; every `KI-nnn` mentioned is defined in `docs/KNOWN_ISSUES.md`.
- `src/test/seo.test.tsx`: `index.html` keeps its `__PLACEHOLDER__` tokens and `applyToIndexHtml` fills every one (root tags and a `pageMap` equal to `pageMap()`); `sitemapXml()` lists exactly `ROUTES`; rendering `<App/>` at each route writes that route's title, description and canonical. The Vite plugin itself is not run in tests.

## 8. Where the logic lives now

The per-card maths was extracted for the 2.0 rewrite (2026-09-16) and is table-tested in `src/lib/*.test.ts`: `inputs.ts` (input clamps and the experience cap), `calculator.ts` (overflow, remaining-to-max), `tools.ts` (selector/catalyst previews, preview formatting), `overview.ts` (every status string), `graph.ts` (dates, series, ticks, target date; all take a `now`), `game.ts` (constants). `advanceDayCount`/`calculateDaysRemaining` take an optional `now`, and `normalize` is exported from `RouterContext.tsx`. Prefer adding a case to those tables over a render-based test; the component tests exist to prove the wiring.
