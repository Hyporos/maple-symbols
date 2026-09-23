# Visual redesign for 2.0: design spec

Agreed with Brian on 2026-09-23 in a brainstorming session (mockups in `.superpowers/brainstorm/`, git-ignored). This is the working spec for the redesign; once it ships, `docs/DESIGN_SYSTEM.md` records the result and this file can be deleted.

## Intent

Brian hand-drew the current design and wants it kept recognisable: same colours, same font, same dark cards and purple accent. The redesign should be better laid out, more intuitive, nicer, and properly responsive on phones; modern and stylish, not over the top, and without a generic AI-template look. Components are built once and reused. It is built as a copy beside the current app so the two can be compared, and the copy can be deleted without touching anything else.

Success: on any `v2` preview, `/next` shows the redesign with the same data and saves as `/`, it passes lint, typecheck, all tests and the build, and Brian prefers it in side-by-side screenshots at 360, 768, 1280 and 1440 px.

Out of scope for this pass (each gets its own design later; V2_PLAN "In 2.0, before launch"): character profiles, the accessibility mode, and the feedback form. This pass builds their places in the layout only; each opens a "coming soon" note.

## 1. Structure

- **Location**: the new UI lives in src/next/. `src/components/` is not changed. Both share `src/lib` (data, maths), `src/state` (the store and saves), `src/i18n` (copy, terms, names) and `src/hooks`.
- **Reaching it**: a `/next` segment after the edition prefix: `/next`, `/next/handbook`, `/next/changelog`, `/next/credits`, `/kms/next/handbook` and so on. Served by the dev server (`pnpm dev`) and by any build where `SERVES_DRAFTS` is true (every Vercel preview, or a local build with `SERVE_DRAFTS=1`; the flag already exists in `src/lib/routes.ts`). In production `/next` is an unknown page and falls back to that edition's calculator. `/next` pages are never prebuilt, never in a sitemap, and carry `noindex`.
- **Removing it**: delete src/next/ and its route line. **Adopting it**: point the page routes at src/next/, delete `src/components/`, wire the prerender to the new pages.
- **Shared changes** (the current UI must keep working through both):
  - The store can select a Grand Sacred symbol: `Mode` gains `"grand"`; `setMode("grand")` and `selectSymbol(13 | 14)` work. The current Selector still offers only Arcane and Sacred.
  - The Sacred Power total includes Grand Sacred symbols (Brian, 2026-09-23): `usePower` sums sacred and grand for the Sacred family. The current Graph's Sacred total changes accordingly.
  - Anything else shared that must change is listed in the implementation plan and approved there.

## 2. Component kit (src/next/ui/ (to be created))

Built first; every page uses these and nothing re-implements them.

| Component         | Role                                                                                                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Card`            | The surface: today's gradient (`from-card to-card-grad`) plus a 1 px hairline edge (`rgba(255,255,255,.06)`) and a faint top highlight; optional small uppercase `label` above the content. Rounding 12 px. |
| `SegmentedSwitch` | A row of options in a `bg-dark` track, the chosen one on `bg-secondary`; a `radiogroup` with arrow keys. Used for Arcane · Sacred · Grand, Dynamic · Linear, Selector · Catalyst.                           |
| `Switch`          | An on/off toggle (`role="switch"`): off `#333` with a grey knob, on accent-tinted track with an accent knob. Used by the quest rows.                                                                        |
| `ProgressRing`    | A thin accent ring around a symbol icon, filling toward max level; text alternative "level N of M".                                                                                                         |
| `ProgressBar`     | A thin accent bar (experience to next level, a symbol's progress to max).                                                                                                                                   |
| `StatBox`         | A small `bg-dark` box with a caption and a value.                                                                                                                                                           |
| `NumberField`     | The number input (level, experience, counts, target), styled as today's inputs, using `clampNumberInput`.                                                                                                   |
| `Sheet`           | A bottom sheet on phones and a popover on desktop, with focus moved in on open, Escape to close, and focus returned on close.                                                                               |
| `Tabs`            | A tab bar with an accent underline on the current tab (`tablist`).                                                                                                                                          |
| `BottomTabBar`    | The phone tab bar for the calculator page (Edit, Overview, Graph).                                                                                                                                          |
| `DataTable`       | The table style: muted header, hairline row borders, a highlighted current row.                                                                                                                             |

Rules: colours only from the `@theme` tokens (no new hexes except where DESIGN_SYSTEM §3 already allows), `cn()` for conditional classes, every string from the catalogue, the `―――` banner comment, a colocated test each.

## 3. Pages

**Shell (every page)**: the header keeps the logo on the left and the nav in the middle. The right side is one cluster: a character chip ("Main ▾", coming soon), the server menu (today's behaviour, restyled with the kit) and an "Aa" button (coming soon). A floating Feedback button sits at the bottom right of every page (coming soon). On phones the server menu and "Aa" move into the ☰ menu; the character chip stays in the header. The suggestion banner and the footer stay, restyled.

**Calculator page, desktop (1150 px and up)**: two columns.

- Left, about 400 px, sticky while the right column scrolls:
  - Picker card: `SegmentedSwitch` Arcane · Sacred · Grand; one chip per symbol with a `ProgressRing` and its level (MAX at max); the family's power total below ("Arcane Power 640 / 1,320").
  - Calculator card: symbol icon and name (sentence case); level and experience `NumberField`s with "/ N exp"; the experience `ProgressBar`; one row per quest (Daily, Weekly, Extra with its region) showing its rate and a `Switch`; the next level as two `StatBox`es (when: days or "ready now"; cost in mesos; main stat where the family has one); Selector and Catalyst buttons at the bottom.
  - Selector and Catalyst open in a `Sheet`: the count, the before → after preview, Apply. Same maths as today (`src/lib/tools.ts`).
- Right:
  - Overview card: the table (symbol, target level, done by, symbols left), a `ProgressBar` under each name, the selected symbol's row highlighted, the custom target-level box, and a closing line "All maxed on <date>".
  - Graph card: the family's power and the target power as `StatBox`es with the target `NumberField`; the `SegmentedSwitch` Dynamic · Linear; the chart with a soft accent area under the line, the target as a dashed horizontal line and the crossing day marked on the x axis.

**768 to 1150 px**: the same two columns, narrower.

**Phones (under 768 px)**: one column with a `BottomTabBar`: Edit (picker and calculator), Overview, Graph, one screen each; tools open as a bottom `Sheet`. Fluid width: no fixed 360 px cards and no fixed pane heights. All three screens are in the DOM (inactive ones hidden), so the content stays in the page for when it is prebuilt.

**Handbook and Extras**: one `Card` with `Tabs` that grows with its content (no fixed height, no inner scrolling). Handbook: Experience, Meso cost, Damage ratio, each with the Arcane · Sacred · Grand `SegmentedSwitch`; the row for the selected symbol's current level highlighted. Extras: Changelog, Credits.

**Grand Sacred rules in the interface**: no weekly or extra quest rows, no Catalyst, Selector only on Tallahart (`selectorWorksOn`), no main-stat box. Tables use the Sacred EXP table and their own meso costs. Power counts toward Sacred Power.

**Motion**: subtle only. Switch knobs slide, sheets slide up or fade in, bars ease to new values; all of it off under `prefers-reduced-motion`.

## 4. Copy, accessibility, search, testing

- **Copy**: every new label is a whole sentence in the catalogue (`src/i18n/en/` plus the four translations), with term placeholders for game words, in a new catalogue area named `next` until the redesign replaces the current UI (then its keys move to their pages' areas). No English literal in JSX.
- **Accessibility built in**: real ARIA controls (switch, radiogroup, tablist), keyboard operation, focus management in the sheet, text alternatives on rings and bars, WCAG AA contrast on the dark surfaces, and the existing keyboard-only focus ring. The later "Aa" mode adds on top of this.
- **Search**: `/next` is not indexed or prebuilt; SEO, prerender and AI-file rules apply once it replaces the current UI.
- **Testing**: kit components get their own tests. The `/next` pages get behaviour tests in the style of today's: entering level and experience updates the overview date; the quest switches change the rates; the tools preview and apply; Grand symbols are selectable and follow their rules; the bottom tabs switch screens; the interactive-nesting test covers the new pages. Existing tests keep covering the current UI. Lint, typecheck, all tests and the build pass. Screenshots at 360, 768, 1280 and 1440 px of both designs for comparison.

## 5. Build approach

Parallel agents after the plan is approved (Brian asked for multiple agents): the component kit first (everything depends on it), then in parallel the calculator page, the Handbook and Extras pages, and the shell (header, feedback button, footer, `/next` routing). Each agent works in its own worktree made from `v2` (MISTAKES M-018), and the parts are merged and checked together.
