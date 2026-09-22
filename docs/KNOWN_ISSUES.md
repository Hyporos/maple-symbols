# Known issues

Real defects and fragile spots found by reading the code, kept here so no session rediscovers them, "helpfully" fixes one without a decision, or breaks a test that pins current behaviour. Fixing any of these is a scoped task: ask first (AGENTS.md rule 1), then move the entry to **Resolved** with the commit.

Severity: **H** = wrong output or data loss for users, **M** = wrong in an edge case or fragile under change, **L** = cosmetic/tech-debt.

## Open

### KI-013 · M · open (found 2026-09-22) · Day counts use the visitor's local calendar, not the game's reset. `advanceDayCount` (`src/lib/utils.ts`) steps local days from `dayjs()` and credits the weekly when the local day is a Monday. GMS resets dailies at 00:00 UTC and weekly quests on Monday 00:00 UTC (as far as anyone here knows; GAME §3), so a player far from UTC can see a completion date and a Monday credit one day off, depending on the time of day. Not pinned by a test yet. Fixing it (count reset boundaries in UTC) is a 2.0 decision; the reset times need verifying first.

## Resolved

### KI-009 · resolved (hosting and analytics hygiene, 2026-09-16) · Production is on Vercel with the apex as primary and `www` on a permanent 308; Firebase is removed; the year-long immutable cache covers only hashed `/assets/*` and the versioned `/fonts/*`; Umami records only on production (before-send gate, PR #18); the inert tooltip middleware is gone. (Was: blanket immutable caching of un-hashed `public/` files, dev and preview traffic counted as production, an inert `SearchAction`, unused floating-ui code, and a stale Firebase deploy.)

### KI-001 · resolved on `v2` (persistence by id, 2026-09-16) · Saves hold only each symbol's `id` and the player's fields (`toSaved` in `src/lib/persistence.ts`); on load `restoreSymbols` rebuilds the list from `symbols.json` and lays those fields on top by id, and `migrate` passes older saves (full records from versions 2 and 3) to the same rebuild. Game-data patches and new symbols now reach returning players without wiping their levels. (Was: every `SymbolData` field was persisted and `merge` adopted the saved array wholesale, so `symbols.json` edits never reached returning players unless a version bump wiped them.)

### KI-011 · resolved on `v2` (accessibility follow-ups, 2026-09-16) · `RadioButton` is a `<button type="button" role="radio" aria-checked>` with a roving `tabIndex` (0 when selected, -1 otherwise) and arrow keys that move focus and selection within the nearest `role="radiogroup"`, wrapping. Selector's toggle is a radiogroup named "Symbol type"; Graph's is "X-axis spacing", and its two tooltip triggers are `as="div"`, so the radio itself takes focus. The Handbook's five `asChild` + `{" "}` triggers became plain triggers. `src/test/interactiveNesting.test.tsx` pins no `button button`/`button input`/`button a`/`button [role=radio]` and no React DOM warning. (Was: a `<div onClick>` with no role, tab stop or key handling; the Selector toggle was unreachable and Graph's trigger button took focus while Enter/Space did nothing.)

### KI-012 · resolved on `v2` (accessibility follow-ups, 2026-09-16) · Overview's target input renders `""` for an unset `targetLevel` (`Number.isNaN`) outside the mobile `maxLevel` default. (Was: `String(targetLevel) === "NaN"` and `NaN` passed to `value` on desktop, which React warned about.)

### KI-007 · resolved on `v2` (tooltip hygiene, 2026-09-16) · `TooltipTrigger` takes `as` (`"button"` default, `"div"`, `"span"`). Calculator's level/exp trigger and Tools' two before/after previews are `as="div"`; Header's language button and Overview's target input are the `asChild` element themselves; the icon and `RadioButton` triggers in Calculator, Overview and Graph drop `asChild` + `{" "}` for a plain trigger. Rendering Header, Calculator, Tools, Overview and Graph together gives no nesting `console.error` and no `button button`/`button input`. (Was: a `<button>` fallback wrapped inputs and buttons; React logged "`<button>` cannot be a descendant of `<button>`".) The Handbook tables keep the `asChild` + `{" "}` form, which renders a valid icon-in-button.

### KI-008 · resolved on `v2` (tooltip hygiene, 2026-09-16) · `buildGraphSeries` counts whole days between the start of today and the entry date, so midnight no longer adds one; `yAxisTicks`/`xAxisTicks` sort and dedupe their ticks and return `[]` only when a single value is left; Tools' `tabIndex` uses `maxLevelFor(currentSymbol.type)`; `catalystPreview` walks from index 1. The unit-less Monday comparison went with the `advanceDayCount` rewrite (KI-003). (Was: `diff(now, "day") + 1`; the "bandaid" `ticks[0] === ticks[2]` check, which let `[70, 70, 80, 80]` through; `level === 20`; `symbolsRequired[-1]`.)

### KI-003 · resolved on `v2` (calculator correctness, 2026-09-16) · `advanceDayCount` now walks from tomorrow and credits the weekly on each counted Monday; its state is `{ days, credited }`. One weekly takes Sun 1, Mon 7, Wed 5, Sat 2 days. (Was: next Monday found with `dayjs().day(8)`, credited one iteration late, so 9, 8, 6, 3.)

### KI-004 · resolved on `v2` (calculator correctness, 2026-09-16) · `expCapFor` returns 0 at max level, locked or not, so the experience field stores 0 there. (Was: `symbolsRequired[max]` is `undefined`, every comparison against it was false, and the field accepted any number.)

### KI-005 · resolved on `v2` (calculator correctness, 2026-09-16) · `getOverflow` drops the leftover when the walk reaches max, so the preview and the applied value agree on experience 0. (Was: level 19 with 2679 unlocked exp applied to level 20 holding 2307.)

### KI-010 · resolved on `v2` (calculator correctness, 2026-09-16) · `clampNumberInput` compares the number rather than the string: blank or unparseable is unset, negative is unset, everything else floors with a minimum of 1, so "00", "000", "0.5" and "-0" give 1 and "7.9" gives 7. (Was: only the literal "0" was remapped.)

### KI-002 · resolved on `v2` (derived on read, 2026-09-16) · `symbolsRemaining`/`daysRemaining`/`completion` are no longer stored; `progressToMax` (`lib/calculator.ts`) derives them per row in `collapsedRowLabels`, and Tools derives its clamp with `getRemainingToMax`. Every Overview row is fresh after a reload. (Was: `partialize` zeroed the cached fields and only Calculator's effect refilled them, for the selected symbol only.)

### KI-006 · resolved on `v2` (identity refactor, 2026-09-16) · `setMode` switches mode and selection atomically and Calculator/Tools use `currentSymbol.type`, so the swap transient cannot occur. (Was: the derived-field effect keyed on `swapped` while `selectedSymbol` lagged one effect behind.)
