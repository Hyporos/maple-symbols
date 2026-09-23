# 2.0 overhaul plan

Working notes for the rewrite. Decisions here were made by Brian on 2026-09-16; change them here first, then act.

## Decisions so far

- **Scope**: everything: visual redesign, state/data model and persistence, routing/pages/new features, framework and major dependencies.
- **Branch**: a long-lived `v2` branch off `development`, created once the dependency upgrades are in; `development`/`main` stay releasable for 1.x fixes. Merge when 2.0 is ready.
- **Known issues** (`docs/KNOWN_ISSUES.md`): folded into 2.0. Current behaviour is pinned by tests marked with the `KI-` id; each fix is a deliberate test change plus a move to **Resolved**.
- **Preparations chosen**: characterization tests (done), extract logic seams into `src/lib` (done), dependency upgrades first and separately (done 2026-09-16 on `development`: tooling minors, React 19, Tailwind 4 with before/after screenshots identical; then Vite 8, Node 26.8.2, jsdom 30 and an `engines` field). Not chosen: a persistence migration up front (part of the 2.0 data-model work), tagging 1.4.0 first, `noUncheckedIndexedAccess` (apply on the v2 code as it is written).
- **Grand Sacred symbols** (Tallahart, Geardock): in 2.0 (Brian, 2026-09-16), in calculator, handbook and copy in the same release (SEO-11, SEO A-2). How they fit the data model is still open; what must be sourced first is listed in GAME §4.
- **Game data** (Brian, 2026-09-22): the corrected v.271 rates and the Thursday weekly ship **with 2.0**, not as a 1.x patch, so the live site keeps the old rates until then. The weekly stays **one credit of 240 at the weekly reset** rather than three separate clears. Symbol 8 is called **Arcus** (was Hotel Arcus; its daily quest keeps the Hotel Arcus name). All three are user-visible and need 2.0 changelog lines.
- **Damage ratio tables** (Brian, 2026-09-22): follow the official Korean and Japanese guide pages.

## Progress on `v2`

- **Identity by id/type** (2026-09-16): `mode: SymbolType`, `selectedId`, `lastSelected`, `selectSymbol`/`setMode`, `useSelectedSymbol()`, `updateSymbol(symbols, id, patch)`, `maxLevelFor(type)`, `isMaxLevel(level, type)`, `usePower(symbols, type)`, `buildDateSymbols(symbols, type)`. No array-index lookups remain; the Selector effect that restored selection is gone. KI-006 resolved.
- **Derived on read** (2026-09-16): `daysRemaining`/`symbolsRemaining`/`completion` removed from `SymbolData`; `progressToMax(symbol, now)` in `lib/calculator.ts` feeds `collapsedRowLabels(symbol, maxLevel, now)`, Tools derives its clamp, Calculator's write-back effect is gone, `partialize` persists `symbols` as-is, `STORAGE_VERSION` 3 (Brian accepted the reset: persisted data need not survive 2.0). KI-002 resolved.
- **Single routes module** (2026-09-16): `src/lib/routes.ts` declares every page once (path, title, description, nav, sitemap fields); `App`, `Header`, `Extras`, `SEO` read it; a routes plugin in `vite.config.ts` fills `__PLACEHOLDER__` tokens in `index.html` and emits `sitemap.xml` (the `public/` copy is gone; `/release` bumps `lastmod` in `routes.ts`). `seo.test.tsx` checks the generators. Persistence by id (KI-001) is optional now that a wipe is acceptable.
- **Calculator correctness** (2026-09-16): KI-003 (weekly credit a day late, Sunday skipped Monday), KI-004 (experience uncapped at max), KI-005 (overflow stranded experience at max), KI-010 (level inputs "00"/"0.5"/"-0" stored 0). All four fixes live in `src/lib` (`advanceDayCount`, `expCapFor`, `getOverflow`, `clampNumberInput`); test expectations changed deliberately and cite the KI. **User-visible**: day counts with the weekly toggle on drop by one or more, so the 2.0 changelog needs a line.
- **Persistence by id** (2026-09-16): KI-001 resolved. Saves hold `id` + player fields only and are rebuilt onto fresh `symbols.json` data by id; older saves (production's version 2) migrate without a wipe, so the 2.0 release keeps players' levels after all.
- **i18n decisions** (2026-09-16; scope superseded 2026-09-22 by full regional data for all six servers, launching together, `docs/REGIONS.md`): interface-only translation (numbers stay GMS; official regional names for symbols and quests) and a typed dictionary with no dependency. Groundwork done: `src/lib/format.ts`, ISO changelog dates, `lang`/`og:locale` from `DEFAULT_LOCALE`. English catalogue extracted into `src/i18n/` with the split sentences and `<br>`s rewritten (B-1, B-2 closed). Next, and needing decisions: locale-prefixed routing and `hreflang` (I18N-4, ties into prerendering), the CJK font stack (B-3), and the first translation.
- **Umami analytics** (2026-09-16): Brian chose Umami over Plausible (free). The production-only before-send gate is live on `main` (PR #18); the typed wrapper and every catalogued event are on `v2`.

## What the safety net pins (as of 2026-09-16)

- 28 test files, 181 tests, about 92% statement coverage; `pnpm test`.
- Component tests assert **what the user sees and does** (text, roles, labels, store effects), never class names or DOM shape, so a redesigned component passes them if it keeps the behaviour. When a behaviour changes on purpose, change the test in the same commit and say why.
- Pure modules with table-driven tests, reusable as-is by the new UI: `src/lib/game.ts`, `src/lib/inputs.ts`, `src/lib/calculator.ts`, `src/lib/tools.ts`, `src/lib/overview.ts`, `src/lib/graph.ts`, `src/lib/utils.ts`, `src/lib/data.ts`, `src/hooks/usePower.ts`.
- Meta-tests: `src/test/docs.test.ts` (docs cite real paths, tokens and issues) and `src/test/seo.test.tsx` (generated `index.html`/sitemap and the rendered head follow `src/lib/routes.ts`).

## How to use it during the rewrite

1. Build the new component; run the old component test against it. Green means the behaviour survived.
2. Red for a reason you intended: edit the expectation, reference the decision (KI id or this file), commit together.
3. Red for a reason you did not intend: that is the net working. Fix the component.
4. New behaviour: add cases to the lib tables first, then a component test for the wiring.

## Dependency upgrades (first, on the old code, one commit each)

Done on `development` (commits `0778e4f`, `5fbee93`, and the Tailwind 4 commit after them): tooling minors; React 18.3 → 19 (+ `@types/react*` 19; `@vitejs/plugin-react` 6 and Vite 8 (rolldown; chunking via `codeSplitting`)); Tailwind 3 → 4 via `@tailwindcss/upgrade` (tokens moved to the `@theme` block in `src/global.css`, `bg-linear-to-*`, `outline-hidden`, `*:` variants, `@tailwindcss/postcss`, `prettier-plugin-tailwindcss` 0.8 with `tailwindStylesheet`); desktop and phone screenshots identical before/after. jsdom 30 and the `engines` field landed the same day once Node moved to 26.8.2. Peer check on 2026-09-16: recharts 3, @testing-library/react 16, react-error-boundary, zustand and @floating-ui/react 0.24 all accept React 19.

After each upgrade: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; log surprises in `docs/MISTAKES.md`.

## Open questions for 2.0 (ask before designing)

- Event symbol sources (GAME §2). Two kinds, and they want different shapes: a **rate bonus** ("+5 symbols per regional daily while the event runs") and a **lump** (a pile of Selector coupons, or a Hyper Burning symbol). Tools already previews a lump through the Symbol Selector, but neither feeds the completion dates. Options: keep ignoring both and say so in the copy; add a per-day bonus field; let the Symbol Selector count carry into the date maths; or all three.
- Grand Sacred symbols: a third family with no main stat, its own meso tables, no Catalyst, and Sacred Symbol Selector eligibility for Tallahart only (since v.271, confirmed in game; GAME §4) — how it fits `SymbolData` and the next-level panel.
- Keeping the game data current (GAME §6): every region gets the same patch on its own date, and the site was two weeks stale on the v.271 rate change before anyone noticed.

- Data model: keep `SymbolData` with NaN sentinels, or move to `level: number | null`? Persistence by id is done (KI-001), so either choice now only touches `src/lib/persistence.ts` and the components, not players' saves.
- Routing: keep the custom router, or adopt a library once there are more pages?
- Visual direction: the new look, and whether the fixed 360 px phone cards and fixed pane heights survive.
- Analytics (`docs/ANALYTICS.md`): nothing open; the §3 events reach production when `v2` ships.
