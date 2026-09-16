# Known issues

Real defects and fragile spots found by reading the code, kept here so no session rediscovers them, "helpfully" fixes one without a decision, or breaks a test that pins current behaviour. Fixing any of these is a scoped task: ask first (AGENTS.md rule 1), then move the entry to **Resolved** with the commit.

Severity: **H** = wrong output or data loss for users, **M** = wrong in an edge case or fragile under change, **L** = cosmetic/tech-debt.

## Open

### KI-001 · H · Static game data is frozen in each user's localStorage

- **Symptom**: Editing `src/lib/symbols.json` (exp tables, meso costs, daily counts, new symbols) has no effect for returning users. Bumping `STORAGE_VERSION` does apply it, but `migrate` returns fresh symbols, so their levels and quest toggles are wiped.
- **Cause**: `partialize` in `src/state/store.ts` spreads every `SymbolData` field (static ones included) and `merge` adopts the persisted array wholesale, even its length. `data.ts` claims "game patches only require editing that one JSON file", which is not true today.
- **Suggested fix**: In `merge`, rebuild each symbol from `createInitialSymbols()` by `id` and copy over only the user fields (`level`, `experience`, `daily`, `weekly`, `extra`, `locked`); make `migrate` map old entries by `id` instead of resetting. Then `symbols.json` becomes the single source of truth again. Test first: `src/state/store.test.ts` pins the current "wholesale" behaviour and must change with it.

### KI-009 · L · Deployment and analytics hygiene

- `vercel.json` marks every static extension immutable for a year, including un-hashed `public/` images; replacing an image in place is invisible to returning visitors. Rename instead, or scope the rule to `/assets/`.
- The Umami script in `index.html` has no `data-domains`, so `vite dev` and preview deployments count as production traffic. It is being replaced by Plausible (`docs/ANALYTICS.md` §2, AN-5 and AN-6).
- Production (2026-09-16) is still a Firebase deploy from March 2026: `main` has `firebase.json`, two Firebase deploy workflows and no `vercel.json`, and the live `/handbook`, `/changelog`, `/credits` return 404. `development` removes all of it; `docs/SEO.md` §0 has the cut-over order.

## Resolved

### KI-007 · resolved on `v2` (tooltip hygiene, 2026-09-16) · `TooltipTrigger` takes `as` (`"button"` default, `"div"`, `"span"`). Calculator's level/exp trigger and Tools' two before/after previews are `as="div"`; Header's language button and Overview's target input are the `asChild` element themselves; the icon and `RadioButton` triggers in Calculator, Overview and Graph drop `asChild` + `{" "}` for a plain trigger. Rendering Header, Calculator, Tools, Overview and Graph together gives no nesting `console.error` and no `button button`/`button input`. (Was: a `<button>` fallback wrapped inputs and buttons; React logged "`<button>` cannot be a descendant of `<button>`".) The Handbook tables keep the `asChild` + `{" "}` form, which renders a valid icon-in-button.

### KI-008 · resolved on `v2` (tooltip hygiene, 2026-09-16) · `buildGraphSeries` counts whole days between the start of today and the entry date, so midnight no longer adds one; `yAxisTicks`/`xAxisTicks` sort and dedupe their ticks and return `[]` only when a single value is left; Tools' `tabIndex` uses `maxLevelFor(currentSymbol.type)`; `catalystPreview` walks from index 1. The unit-less Monday comparison went with the `advanceDayCount` rewrite (KI-003). (Was: `diff(now, "day") + 1`; the "bandaid" `ticks[0] === ticks[2]` check, which let `[70, 70, 80, 80]` through; `level === 20`; `symbolsRequired[-1]`.)

### KI-003 · resolved on `v2` (calculator correctness, 2026-09-16) · `advanceDayCount` now walks from tomorrow and credits the weekly on each counted Monday; its state is `{ days, credited }`. One weekly takes Sun 1, Mon 7, Wed 5, Sat 2 days. (Was: next Monday found with `dayjs().day(8)`, credited one iteration late, so 9, 8, 6, 3.)

### KI-004 · resolved on `v2` (calculator correctness, 2026-09-16) · `expCapFor` returns 0 at max level, locked or not, so the experience field stores 0 there. (Was: `symbolsRequired[max]` is `undefined`, every comparison against it was false, and the field accepted any number.)

### KI-005 · resolved on `v2` (calculator correctness, 2026-09-16) · `getOverflow` drops the leftover when the walk reaches max, so the preview and the applied value agree on experience 0. (Was: level 19 with 2679 unlocked exp applied to level 20 holding 2307.)

### KI-010 · resolved on `v2` (calculator correctness, 2026-09-16) · `clampNumberInput` compares the number rather than the string: blank or unparseable is unset, negative is unset, everything else floors with a minimum of 1, so "00", "000", "0.5" and "-0" give 1 and "7.9" gives 7. (Was: only the literal "0" was remapped.)

### KI-002 · resolved on `v2` (derived on read, 2026-09-16) · `symbolsRemaining`/`daysRemaining`/`completion` are no longer stored; `progressToMax` (`lib/calculator.ts`) derives them per row in `collapsedRowLabels`, and Tools derives its clamp with `getRemainingToMax`. Every Overview row is fresh after a reload. (Was: `partialize` zeroed the cached fields and only Calculator's effect refilled them, for the selected symbol only.)

### KI-006 · resolved on `v2` (identity refactor, 2026-09-16) · `setMode` switches mode and selection atomically and Calculator/Tools use `currentSymbol.type`, so the swap transient cannot occur. (Was: the derived-field effect keyed on `swapped` while `selectedSymbol` lagged one effect behind.)
