# Known issues

Real defects and fragile spots found by reading the code, kept here so no session rediscovers them, "helpfully" fixes one without a decision, or breaks a test that pins current behaviour. Fixing any of these is a scoped task: ask first (AGENTS.md rule 1), then move the entry to **Resolved** with the commit.

Severity: **H** = wrong output or data loss for users, **M** = wrong in an edge case or fragile under change, **L** = cosmetic/tech-debt.

## Open

### KI-001 · H · Static game data is frozen in each user's localStorage

- **Symptom**: Editing `src/lib/symbols.json` (exp tables, meso costs, daily counts, new symbols) has no effect for returning users. Bumping `STORAGE_VERSION` does apply it, but `migrate` returns fresh symbols, so their levels and quest toggles are wiped.
- **Cause**: `partialize` in `src/state/store.ts` spreads every `SymbolData` field (static ones included) and `merge` adopts the persisted array wholesale, even its length. `data.ts` claims "game patches only require editing that one JSON file", which is not true today.
- **Suggested fix**: In `merge`, rebuild each symbol from `createInitialSymbols()` by `id` and copy over only the user fields (`level`, `experience`, `daily`, `weekly`, `extra`, `locked`); make `migrate` map old entries by `id` instead of resetting. Then `symbols.json` becomes the single source of truth again. Test first: `src/state/store.test.ts` pins the current "wholesale" behaviour and must change with it.

### KI-003 · M · Weekly reset is credited a day late, and a Sunday start skips the next Monday

- **Symptom**: With time frozen to a Wednesday, 120 symbols from weekly alone takes 6 days (lands on the Tuesday, not the Monday). From a Sunday it takes 9 days: tomorrow's Monday is skipped entirely.
- **Cause**: `advanceDayCount` in `src/lib/utils.ts` finds the next Monday with `dayjs().day(8)`, which is "Monday of next week" in dayjs's Sunday-start weeks (Sun → +8 days), and increments `weeklyResets` on the iteration after `countToMonday`, so the credit appears at `countToMonday + 1`.
- **Expected**: the Calculator tooltip says the estimate assumes today's quests are already done, and dailies are credited from tomorrow (`calculateDaysRemaining(10, 10, false)` is 1). Under that model a single weekly should take Sun 1, Mon 7, Wed 5, Sat 2 days; today it takes 9, 8, 6, 3.
- **Suggested fix**: iterate from tomorrow and add 120 on each iterated day that is a Monday (drop the `dayjs().day(8)` arithmetic), and take a `now` parameter for testability. `src/lib/utils.test.ts` pins today's numbers (Wed 6, Mon 8, Sat 3) and must be updated deliberately.

### KI-004 · M · Experience is uncapped at max level while locked

- **Symptom**: At level 20 (or 11) with the cap locked, any experience value is accepted and stored.
- **Cause**: `expCap = locked ? symbolsRequired[level] : total`; at max level `symbolsRequired[max]` is `undefined`, and `Number(v) >= undefined` is always false (`Calculator.tsx`, experience `onChange`).
- **Suggested fix**: Treat `isMaxLevel` as cap 0 in the exp handler (and disable the field at max).

### KI-005 · M · Applying overflow can leave experience on a max-level symbol

- **Symptom**: Level 19 with 2679 unlocked exp, click the check icon → level 20 with 2307 exp. The click also sets `locked: true`, so the symbol ends up locked at max level with leftover exp, a negative `symbolsRemaining`, and an exp field with no cap (KI-004).
- **Cause**: The overflow walk in `Calculator.tsx` applies `overflowExperience` whenever `overflowLevel > level`, including when it reaches max.
- **Suggested fix**: When `overflowLevel` is max, set `experience: 0`.

### KI-007 · L · Invalid DOM nesting from the `TooltipTrigger` button fallback

- **Symptom**: React logs `validateDOMNesting` ("`<button>` cannot appear as a descendant of `<button>`") in dev, and in tests only with `--silent=false`: the Header language button and the Calculator lock/unlock trigger nested inside the level/exp trigger. The level/exp inputs and Overview's target input also sit inside a trigger `<button>`, which is invalid HTML (interactive content inside a button) but React 18 does not warn about it.
- **Cause**: `TooltipTrigger` renders a `<button>` unless `asChild` receives a single valid element (see AGENTS.md gotcha 4 for why the `{" "}` sites also hit this path).
- **Suggested fix**: Give `TooltipTrigger` a `as="div"`/`span` option, or wrap those inputs in a `<div>` passed with `asChild`.

### KI-008 · L · Fragile date and tick edge cases

- `advanceDayCount` compares against next Monday at millisecond precision (`isBefore`/`isSame` with no unit). Since the 2.0 preparation it uses one `now` value, so the race between separate `dayjs()` calls is gone; the unit-less comparison remains.
- `Graph.tsx` computes `diff(…, "day") + 1`, which overshoots by one exactly at local midnight.
- `Graph.tsx` clears both tick arrays when `ticks[0] === ticks[2]` ("bandaid" comments) instead of fixing the degenerate range.
- `Tools.tsx` has one `tabIndex` expression hard-coding `level === 20` (should be mode-aware) and the catalyst walk reads `symbolsRequired[-1]` on its first iteration (harmless `undefined` comparison).

### KI-009 · L · Deployment and analytics hygiene

- `vercel.json` marks every static extension immutable for a year, including un-hashed `public/` images; replacing an image in place is invisible to returning visitors. Rename instead, or scope the rule to `/assets/`.
- The Umami script in `index.html` has no `data-domains`, so `vite dev` and preview deployments count as production traffic.
- Production (2026-09-16) is still a Firebase deploy from March 2026: `main` has `firebase.json`, two Firebase deploy workflows and no `vercel.json`, and the live `/handbook`, `/changelog`, `/credits` return 404. `development` removes all of it; `docs/SEO.md` §0 has the cut-over order.
- `Tooltip.tsx` registers floating-ui's `arrow()` middleware and `useDelayGroup` but never renders an arrow or a `FloatingDelayGroup`; both are inert.

### KI-010 · L · The level input stores 0 for "00", "0.5", and "-0"

- **Symptom**: The level handler in `Calculator.tsx` remaps only the literal string `"0"` to 1; `"00"`, `"000"`, `"0.5"`, and `"-0"` fall through to `parseInt` and store level 0 (or -0), which no other code expects (the experience handler special-cases `"00"`/`"000"`; the level handler does not).
- **Suggested fix**: guard on `Number(value) === 0` (and `Object.is(value, -0)`) instead of the string, and floor non-integers.

## Resolved

### KI-002 · resolved on `v2` (derived on read, 2026-09-16) · `symbolsRemaining`/`daysRemaining`/`completion` are no longer stored; `progressToMax` (`lib/calculator.ts`) derives them per row in `collapsedRowLabels`, and Tools derives its clamp with `getRemainingToMax`. Every Overview row is fresh after a reload. (Was: `partialize` zeroed the cached fields and only Calculator's effect refilled them, for the selected symbol only.)

### KI-006 · resolved on `v2` (identity refactor, 2026-09-16) · `setMode` switches mode and selection atomically and Calculator/Tools use `currentSymbol.type`, so the swap transient cannot occur. (Was: the derived-field effect keyed on `swapped` while `selectedSymbol` lagged one effect behind.)
