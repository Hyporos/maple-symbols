# Architecture

How the app is put together, where each concern lives, and why the odd-looking parts are the way they are. Read this before touching state, routing, data flow, effects, or build/deploy. Identifiers are used instead of line numbers so this stays true across edits; verify against the code when in doubt.

## 1. Runtime shape

```
index.html          inline script sets title/meta from a 4-route pageMap BEFORE React loads;
                    Maven Pro font links; Umami analytics; darkreader-lock meta
└─ src/main.tsx     createRoot(#root).render(<RouterProvider><App/></RouterProvider>) + global.css
   └─ App.tsx       <BreakpointProvider>
                      <Header/>                                  ← outside the error boundary
                      <ErrorBoundary fallback="Something went wrong. Please refresh.">
                        <Suspense fallback={null}>
                          <PageContent/>                         ← switches on useRouter().path
                        </Suspense>
                      </ErrorBoundary>
                      <Footer/>                                  ← outside the error boundary
                    </BreakpointProvider>

PageContent:
  /            <SEO/> <Selector/> <Calculator/> <Tools/> <Overview/> <Graph/>   (last four are React.lazy)
  /handbook    <SEO …/> <Selector/> <Handbook/>          Handbook = TabLayout(ExpTable, CostTable, RatioTable)
  /changelog   <SEO …/> <Extras/>                        Extras = TabLayout controlled by URL (Changelog | Credits)
  /credits     same, tab 2
  otherwise    the "/" page (there is no 404)
```

`Selector` renders on `/handbook` too because the tables read `selectedId` and `mode`. Vite splits `react-vendor` (react, react-dom, zustand), `recharts-vendor`, `dayjs-vendor`, and one chunk per lazy component (`vite.config.ts` → `manualChunks`).

## 2. Routing

**`src/contexts/RouterContext.tsx`** is a ~50-line History-API router: `path` state initialised from `window.location.pathname`, `normalize()` strips trailing slashes (no query/hash handling), one `popstate` listener, and `navigate(to)` which calls `history.pushState` only when the normalised path differs, then updates state inside `startTransition` so the old page stays visible while a lazy chunk loads. `useRouter()` outside the provider returns `{ path: "/", navigate: noop }` silently.

**Navigation sources**: `Header.tsx` builds links from its `PAGES` array (`activeFor` marks Extras active on both `/changelog` and `/credits`) and calls `navigate` after `preventDefault` on plain `<a href>`s. `Extras.tsx` maps its two tabs to `TAB_PATHS` and drives `TabLayout` in controlled mode so the tab and the URL stay in sync.

**Head metadata is written twice by design.** The inline script in `index.html` runs synchronously in `<head>` so crawlers and the first paint have the right title/description/canonical even though the React page is lazy. `SEO.tsx` then updates the same tags, plus the four og/twitter image tags the inline script never touches, in a `useLayoutEffect` (same frame as the route render) and maintains one `<script type="application/ld+json" data-seo-ld>`: `WebApplication + WebSite + WebPage` on the root, `WebPage` elsewhere. `SEO.setMeta` no-ops when a tag is missing, so it relies on `index.html` shipping every tag.

The title/description strings therefore live in **three places** that must agree (`index.html` static tags + `pageMap`, `App.tsx` `<SEO>` props, `SEO.tsx` defaults), and the route URLs in a fourth, `public/sitemap.xml`. `src/test/seo.test.tsx` renders the app at every `pageMap` route and fails if any of the four drift.

## 3. State

**`src/state/store.ts`** is the only store (Zustand 5 + `persist`). Replaced Redux + RTK in the 1.4 refactor.

| Field          | Default                    | Persisted | Meaning                                                                     |
| -------------- | -------------------------- | --------- | --------------------------------------------------------------------------- |
| `mode`         | `"arcane"`                 | no        | which symbol type the UI shows (`SymbolType`)                               |
| `symbols`      | `createInitialSymbols()`   | **yes**   | the 12 `SymbolData` entries                                                 |
| `selectedId`   | `1`                        | no        | id of the symbol shown in Calculator/Tools/Handbook (`useSelectedSymbol()`) |
| `lastSelected` | `{ arcane: 1, sacred: 7 }` | no        | per-type memory; `setMode(type)` restores it, `selectSymbol(id)` records it |

Persistence details:

- localStorage key `maple-symbols-v2`, `version: STORAGE_VERSION` (2).
- `partialize` writes only `symbols`, with `daysRemaining`, `symbolsRemaining`, `completion` zeroed. It spreads every other field too, so static game data is persisted as well (KI-001).
- `merge` converts JSON `null` back to `NaN` for `level` and `experience` (JSON cannot encode NaN) and adopts the persisted array wholesale.
- `migrate` ignores the old state and returns fresh symbols: a version bump is a data wipe. Bump only when `SymbolData`'s shape changes and say so in the changelog.
- Every `set` (including per-keystroke input handlers) serialises to localStorage through the middleware.

**NaN is the "unset" sentinel** for `level` and `experience` (`isValid = !isNaN`). Inputs render `""` for NaN; comparisons with NaN are silently false and the code relies on that (`readyForUpgrade`, `level > 0`, `level < max`). Local component state uses the same convention (`targetLevel`, `selectorCount`, `targetPower`).

## 4. Data

`src/lib/symbols.json` holds `arcaneExpRequired` (20 entries), `sacredExpRequired` (11), and `symbols` (12 definitions: `id`, `name`, `img`, `type`, `dailyName`, `weeklyName?`, `extraName?`, `dailySymbols`, `mesosRequired`). `createInitialSymbols()` in `src/lib/data.ts` maps each definition to a `SymbolData` (`src/lib/types.ts`): it attaches the per-type exp table as `symbolsRequired` (the same array reference for all six symbols of a type until rehydration copies it), creates `weekly: false` only when `weeklyName` exists and `extra: false` only when `extraName` exists, and sets the user fields to NaN/false/locked.

Field origins:

- **Static (from JSON)**: `id, name, img, type, dailyName, weeklyName?, extraName?, dailySymbols, symbolsRequired, mesosRequired`.
- **User-controlled**: `level, experience, daily, weekly?, extra?, locked`.
- **Derived, cached in the store**: `daysRemaining, symbolsRemaining, completion` ("YYYY-MM-DD").

Identity: symbols are addressed by `id` (arcane 1–6, sacred 7–12; `updateSymbol(symbols, id, patch)`, `useSelectedSymbol()`); array position is only display order. `symbolsRequired[L]` and `mesosRequired[L]` are the cost of the L→L+1 step (`[0]` is 0, level 0 does not exist); Handbook rows print "Level N" with value `[N-1]`. `symbolsRequired[max]` is `undefined`, which several comparisons rely on (KI-004).

Who computes what:

| Value                                             | Where                                                                                                           | Stored?                               |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `symbolsRemaining`, `daysRemaining`, `completion` | the single effect in `Calculator.tsx` (remaining-to-max, `calculateDaysRemaining`, today + days)                | yes, for the `selectedId` symbol only |
| days to next level, overflow level/exp            | `getOverflow` (`lib/calculator.ts`) via `useMemo` in `Calculator.tsx`                                           | no                                    |
| Symbol Selector / Catalyst previews               | `selectorPreview` / `catalystPreview` / `formatPreview` (`lib/tools.ts`) via `useMemo`s in `Tools.tsx`          | no                                    |
| Overview expanded-row target maths                | local `useMemo`s in `Overview.tsx`; strings from `collapsedRowLabels` / `targetPanelLabels` (`lib/overview.ts`) | no                                    |
| Graph per-level dates and power series            | `buildDateSymbols` / `buildGraphSeries` / ticks / `dateToPower` (`lib/graph.ts`), threading `DayCountState`     | no                                    |
| current power                                     | `usePower` (`src/hooks/usePower.ts`)                                                                            | no                                    |

Consumers of the stored derived fields are Overview's collapsed rows and Tools' selector-count clamp plus its Apply handler (`selectorCount < symbolsRemaining ? selectorExp : 0`); Graph never reads them. Note the two Handbook tables have different sources: `ExpTable` reads `symbols.json` directly, `CostTable` reads the persisted `symbol.mesosRequired`.

## 5. Effects that write to the store or the document

| Where                     | Trigger deps                                                | Writes                                                 | Loop guard                                                                                                                               |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `Calculator.tsx` (main)   | `daily, extra, weekly, level, experience, mode, selectedId` | derived fields for the selected symbol                 | two `Object.is` compares (NaN-safe) plus `!==` on `completion`; reads `useAppStore.getState().symbols`; `symbols` deliberately not a dep |
| `Calculator.tsx` (clamp)  | `locked, readyForUpgrade, nextExperience, selectedId`       | `experience = nextExperience` when ready and locked    | none beyond the condition; would loop if `symbols` were added to deps                                                                    |
| `Calculator.tsx` (relock) | `experience, level, locked, mode, selectedId`               | `locked = true` at max level with 0 exp                | self-terminating                                                                                                                         |
| `SEO.tsx` (layout effect) | title/description/url/image/imageAlt                        | `document.title`, meta/link attributes, JSON-LD script | n/a                                                                                                                                      |
| `RouterContext.tsx`       | mount                                                       | `popstate` listener                                    | cleanup                                                                                                                                  |
| `BreakpointContext.tsx`   | mount (×2)                                                  | `matchMedia` change listeners                          | cleanup                                                                                                                                  |
| `App.tsx`                 | mount                                                       | `alert()` on Samsung Internet                          | mount-only                                                                                                                               |

Overview has three effects (on `mode`; on `targetId`/`selectedNone`; on the target symbol's `level`/`mode`) and Graph two (`mode`, `currentPower`) that only reset local state. Because `react-hooks/exhaustive-deps` is off (see §7), the dependency arrays above are hand-curated and intentionally incomplete; treat them as part of the design, not as omissions.

## 6. Module layering

`lib/` (pure, imports only `lib/`) → `state/` (imports `lib/`) → `hooks/` and `contexts/` (import `lib/`, `contexts/`) → `components/` (import everything). No cycles. Hubs: `lib/utils` (≈14 importers), `hooks/useBreakpoint` (≈11), `state/store` (≈8), `components/Tooltip` (≈8). `components/ui/*` never touch the store; feature components read the store directly instead of taking props. Since the 2.0 preparation, the per-card maths lives in `lib/calculator.ts`, `lib/tools.ts`, `lib/overview.ts`, `lib/graph.ts`, the input rules in `lib/inputs.ts`, and the game constants in `lib/game.ts`; components only wire state and DOM to those functions, which is what the rewrite reuses.

## 7. Build, deploy, tooling

- `pnpm build` = `tsc` (type-gate over `src/`, tests included, `noEmit`) then `vite build`. Vite plugins: `react()`, brotli and gzip pre-compression of the output. `vitest.config.ts` is standalone so those build plugins never run in tests.
- `vercel.json`: `buildCommand: pnpm build`, SPA rewrite of every path to `/index.html`, 1-year immutable `Cache-Control` for `/assets/*` **and every static extension** (including un-hashed `public/` images, KI-009), `no-cache` for HTML, `nosniff`/`SAMEORIGIN`/referrer/permissions headers, no CSP (Umami and Google Fonts would need allow-listing). Anything under `api/` would deploy as a Vercel function; the directory is empty.
- `tsconfig.json`: strict, `noUnusedLocals`, `noUnusedParameters`, `allowImportingTsExtensions`, `resolveJsonModule` (used to import `package.json` in Footer and `symbols.json`), `allowJs`.
- ESLint flat config: recommended JS/TS rules; `react-hooks` v7 rules `exhaustive-deps`, `immutability`, `set-state-in-effect`, `refs` are **off** ("too aggressive for existing patterns: accumulator vars in render, intentional setState in effects, floating-ui ref passing"); `react-refresh/only-export-components` off (Context and Tooltip files export a component and a hook); ternary/short-circuit statements allowed; `_` prefix for unused; `no-explicit-any` warns, and `--max-warnings 0` makes that fatal (the one `any`, in `Tooltip.tsx`, carries an `eslint-disable-next-line`). Prettier runs inside ESLint, last.
- Git hooks: `simple-git-hooks` installs a pre-commit that runs lint-staged (ESLint, `vitest related`, Prettier, `scripts/docs-drift.mjs`). CI mirrors lint/typecheck/test/build. `.gitattributes` forces LF in the working tree.

## 8. Decisions (why it is like this)

Each of these looks like something to "fix". Don't, without a decision.

- **D1 Custom router instead of React Router.** Four static routes, no params; pushState + `startTransition` gives instant URL updates and keeps the old page during lazy loads. Cost: no 404, no scroll restoration, ctrl-click on nav links is hijacked by `preventDefault`.
- **D2 Zustand over Redux + RTK.** One small store, per-field selectors, `persist` middleware for the one thing that needs saving. `partialize`/`merge`/`migrate` are where all persistence policy lives.
- **D3 NaN as "unset".** Keeps `level`/`experience` numeric everywhere; the price is the `null → NaN` rehydration and NaN-safe comparisons (`Object.is`). Don't switch to `null | number` piecemeal.
- **D4 Exactly two `matchMedia` listeners.** `BreakpointContext` owns them; `useBreakpoint` is a re-export so components never register their own. Breakpoints (767/1149 px) mirror Tailwind's `md` and the custom `laptop` screen, which must be kept in sync by hand.
- **D5 One derived-fields effect.** Three effects plus a memo used to cascade re-renders through intermediate store writes and looped on `NaN !== NaN`. The single effect compares with `Object.is`, reads `useAppStore.getState()`, and excludes `symbols` from deps to break the feedback path. It only covers the selected symbol (KI-002 is the consequence).
- **D6 One dayjs instance.** `dayjs.extend()` mutates a global; `src/lib/dayjs.ts` extends the plugins once and everything imports from there, so no file depends on load order.
- **D7 Lazy calculator sections + vendor chunks.** Handbook/Extras are small and eager; the four calculator sections and recharts are the heavy part.
- **D8 Head metadata set in `index.html` and again in `SEO.tsx`.** The inline script covers the pre-React window; `useLayoutEffect` avoids a visible title flicker on client navigation. Duplication is the accepted cost, policed by a test.
- **D9 Hoisted statics.** `CustomTooltip` is defined outside `Graph` so Recharts keeps a stable content reference; `BAR_POSITIONS` (six translate classes, one per position in the shown type) sits outside `Selector` so Tailwind sees the class names. Follow the pattern for new static maps.
- **D10 react-hooks lint rules off.** Turned off wholesale when v7 arrived; the intent recorded in `eslint.config.js` is "revisit per-rule". Until then, dependency arrays are reviewed by humans.
- **D11 Id-based identity (v2), persisted static data.** Symbols are addressed by `id`; `mode` + `lastSelected` + `selectSymbol`/`setMode` replaced the index memory and the Selector effect that restored it (the old index model is on `main`/`development`). The whole `SymbolData` is still persisted; KI-001 remains.
- **D12 The `{" "}` before icons in `asChild` tooltip triggers.** Almost certainly accidental, but it is what makes those triggers work (the array child forces the `<button>` fallback that floating-ui can anchor to). Keep it until `TooltipTrigger` gains a non-button wrapper option (KI-007).
- **D13 Samsung Internet `alert()` and `darkreader-lock`.** Forced dark modes recolour the palette; the site refuses Dark Reader and warns Samsung users once per load.

## 9. Checklists

**Adding a route**: `App.tsx` `PageContent` branch with `<SEO title description url/>` → `Header.tsx` `PAGES` (and `activeFor` if it is an Extras tab, plus `Extras.tsx` `TAB_PATHS`) → `index.html` `pageMap` entry (keep the literal shape `title`, `description`, `url` in that order with double quotes; `seo.test.tsx` parses it with a regex, not eval) → `public/sitemap.xml` `<url>` → run `pnpm test seo`.

**Adding a symbol**: append to the END of `symbols.json` (never reorder) → add `public/symbols/<name>-symbol.webp` (a new filename, so the 1-year cache is not an issue) → `Selector.tsx`: `BAR_POSITIONS` has six slots per type (80 px pitch); a seventh symbol of a type needs a seventh translate class, and the mobile grid (`w-[151px]` = three 35 px icons per row beside a `h-[138px]` divider) wraps to a third row → if the new symbol should be the default for its type, update `DEFAULT_SELECTION` in `store.ts` → decide how returning users get the new symbol (KI-001: the persisted array wins, so they will not see it without a `STORAGE_VERSION` bump) → update `src/lib/data.test.ts` (pins 12 symbols, ids 1–12, arcane 0–5 / sacred 6–11, weekly only on 0–5) and `src/components/Selector.test.tsx` (expects six `Lv. 0` buttons per type) → update the Domain cheat sheet in AGENTS.md.

**Adding a quest toggle** (e.g. a `bonus` flag): `types.ts` (`bonus?`, `bonusName?`) → `data.ts` `SymbolDefinition` and the conditional spread in `createInitialSymbols` → `symbols.json` name field per symbol → `getDailySymbols` (rate effect) → `Calculator.tsx`: the toggle button in the quest row (DESIGN_SYSTEM §6) **and** the new flag in the derived-fields effect's dependency list → `Overview.tsx` `targetDays` memo deps → `src/lib/data.test.ts`, `Calculator.test.tsx` → the `STORAGE_VERSION` decision (a new persisted field rehydrates as `undefined` for existing users, which the `typeof x === "undefined" && "hidden"` pattern treats as "no such quest"; decide whether that is acceptable).

**Changing `SymbolData`**: update `types.ts`, `createInitialSymbols`, `partialize` (should the field persist?), `merge` (does it need `null → NaN`?), bump `STORAGE_VERSION` and accept the wipe or write a real migration, then `store.test.ts` and `src/lib/data.test.ts` (pins the initial shape and the optional-field rules).
