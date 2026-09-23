# Design system

How the UI is built, with the exact class strings the existing components use, so new work looks like it belongs. Sections 2–9 describe what exists; section 10 says what to prefer when there is a choice; section 11 is the checklist for a new component. Tailwind 3 only; the single stylesheet is `src/global.css`.

## 1. Look and feel

Dark, quiet, one accent. Near-black gradient cards (`#1b1b1b`→`#1d1d1d`) on a `#212121` page, light-grey body text, white for emphasis and hover, and a single purple accent (`#b18bd0`) for selection, highlighted words, focus rings, and the graph line. Rounded corners everywhere (`rounded-lg` by default, `rounded-3xl` for pills and floating panels), hairline dividers at 10% white, and small hover motions (colour, scale, letter-spacing). Maven Pro throughout, slightly letter-spaced. Phone layouts are fixed 360 px cards; desktop layouts are fluid up to a max width.

## 2. Tokens

Tailwind 4: tokens are CSS variables in the `@theme` block of `src/global.css` (there is no `tailwind.config.js` any more). Most are namespace-specific on purpose, so the same word can mean different colours per utility (`text-secondary` is `#bfbfbf`; `bg-secondary`/`border-secondary` are `#333333`); the `--color-*` ones work with every colour utility and opacity modifier. The docs test checks that this table and the `@theme` block match exactly, both ways.

<!-- tokens:start -->

| Variable                       | Class                                   | Value                       | Used for                                                                                |
| ------------------------------ | --------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| `--color-accent`               | `text-/bg-/border-/fill-/shadow-accent` | `#b18bd0`                   | selection, highlighted words (every `<span>`), focus rings, graph line, `shadow-accent` |
| `--color-card`                 | `from-card, to-card`                    | `#1d1d1d`                   | card gradient stop (`from-card` in most cards)                                          |
| `--color-card-grad`            | `to-card-grad`                          | `#1b1b1b`                   | card gradient stop (the top edge)                                                       |
| `--color-card-tool`            | `from-/to-card-tool`                    | `#1c1c1c`                   | the seam colour shared by Calculator (bottom) and Tools (top), and TabLayout's bottom   |
| `--color-dark`                 | `bg-dark`                               | `#212121`                   | inner "well" surfaces: pills, panels, table row hover/current, stat boxes; page bottom  |
| `--color-light`                | `bg-light`                              | `#262626`                   | hover/selected surfaces: tab buttons, changelog versions, graph tooltip                 |
| `--text-color-primary`         | `text-primary`                          | `#ffffff`                   | emphasis text, hover text, selected labels                                              |
| `--text-color-secondary`       | `text-secondary`                        | `#bfbfbf`                   | body text (set on `body`), inputs, buttons                                              |
| `--text-color-tertiary`        | `text-tertiary`                         | `#8c8c8c`                   | muted captions, placeholders, footer, table headers in Overview                         |
| `--text-color-upgrade`         | `text-upgrade`                          | `#00b800`                   | unused                                                                                  |
| `--background-color-hover`     | `bg-hover`                              | `#444444`                   | `hover:bg-hover` / `focus:bg-hover` on inputs and toggle buttons                        |
| `--background-color-secondary` | `bg-secondary`                          | `#333333`                   | input and button backgrounds, selected pill                                             |
| `--background-color-tertiary`  | `bg-tertiary`                           | `transparent`               | unused                                                                                  |
| `--border-color-unchecked`     | `border-unchecked`                      | `#ab0000`                   | bottom border of an OFF daily/weekly/extra toggle (`border-unchecked/80`)               |
| `--border-color-checked`       | `border-checked`                        | `#00a500`                   | bottom border of an ON toggle (`border-checked/80`)                                     |
| `--border-color-secondary`     | `border-secondary`                      | `#333333`                   | RadioButton ring, Overview expanded panel                                               |
| `--outline-color-basic`        | `outline-basic`                         | `#444444`                   | unused                                                                                  |
| `--fill-basic`                 | `fill-basic`                            | `#bfbfbf`                   | `fill-basic/75` on the Header globe icon                                                |
| `--shadow-input`               | `shadow-input`                          | `0 0 9px 0 rgb(0 0 0/.25)`  | TabLayout nav bar, `.tooltip`                                                           |
| `--shadow-level`               | `shadow-level`                          | `0 0 2.5px 0 rgb(0 0 0/.1)` | paired with `shadow-accent` (the Tools pill drops it when the symbol has no level)      |
| `--breakpoint-laptop`          | `laptop:`                               | `1150px`                    | unused as a class prefix; mirrors `isTablet`                                            |
| `--breakpoint-phone`           | `phone:`                                | `550px`                     | unused                                                                                  |
| `--transition-property-height` | `transition-height`                     | `height`                    | the Header mobile menu                                                                  |

<!-- tokens:end -->

**Tailwind 4 notes** (migrated 2026-09-16 with `@tailwindcss/upgrade`): gradients are `bg-linear-to-t` (was `bg-gradient-to-t`); `outline-hidden` replaces the old `outline-none` on inputs; child selectors are `*:pointer-events-none` (was `[&>*]:…`); a compat rule in `global.css` keeps v3's default border colour (remove it only after giving every colourless `border-*` element an explicit colour); Tailwind runs through `@tailwindcss/postcss` (`postcss.config.js`), and Prettier's class sorting reads `tailwindStylesheet: ./src/global.css` from `.prettierrc`.

Tailwind built-ins that are part of the palette: `bg-white/10` (dividers, ≈21 uses), `border-white/5` (table cells), `text-white` / `fill-white` / `stroke-white` (nav-active and icon hovers), `bg-white/40` (Tools' disabled seam). White is written two ways: `text-primary` for text, `text-white`/`fill-white`/`stroke-white` for nav links and icons.

## 3. Colours outside the token system

- **Brand hexes** on social icons are intentional: Discord `#7289DA`, PayPal `#009CDE`, Twitch `#6441a5`, YouTube `#e00000` (`hover:fill-[…]` in `Footer.tsx`, `CreditText.tsx`).
- **Recharts props** take raw strings: `#b18bd0` (accent) for the line/dots, `#8c8c8c` (tertiary) for axes and cursor, in `Graph.tsx`. Keep them equal to the token values. The chart tooltip's `FaArrowRight` also uses `fill="#8c8c8c"` (there is no `fill-tertiary` token).
- **Calculator icon colours** via `color=`: `#718571` (green-grey, "can apply"), `#857871` (warm grey, inactive), `#B2B2B2` (the slash). No token equivalents.
- `.tooltip` background `#111111` and the body gradient top stop `#202020` live in `global.css`. `.tooltip` is capped at `max-w-[260px] md:max-w-[300px]` with `text-balance`: tooltip copy never contains `<br>` (I18N-11), so width decides where lines break in every language.
- `Footer.tsx` uses `hover:fill-[#B18BD0]` where `hover:fill-accent` would do (see §10).

## 4. Typography

Maven Pro, self-hosted: one variable `woff2` (latin subset, weights 400–900) in `public/fonts/`, declared by `@font-face` at the top of `global.css` and preloaded in `index.html`. `body` sets `font-family: "Maven Pro", "Maven Pro Fallback", Arial, Helvetica, sans-serif`; `Maven Pro Fallback` is local Arial with metric overrides so the swap does not shift layout (SEO-19 has the numbers). Weights in use: 400 body, `font-semibold` (600) for titles/labels; `font-light` appears once and is a no-op (the face starts at 400). Body has `tracking-wide`; titles, inputs, toggle buttons and Overview headers add `tracking-wider`; the MAX LEVEL / DISABLED states use `tracking-widest`.

Mobile-first size pairs (base = phone, `md:` = ≥768 px):

| Pair                                                      | Role                                                                    |
| --------------------------------------------------------- | ----------------------------------------------------------------------- |
| `text-sm md:text-base`                                    | body/UI text: buttons, labels, table `th`, RadioButton, tabs (≈30 uses) |
| `text-xs md:text-sm`                                      | small text: table `td`, changelog bullets, credits, `.tooltip`          |
| `text-lg font-semibold md:text-2xl`                       | card titles in Handbook panes; MAX LEVEL / DISABLED                     |
| `text-lg font-semibold md:text-xl`                        | group titles (Credits), the Calculator symbol name (`uppercase`)        |
| `text-base font-semibold md:text-xl`                      | "Level N → Level N+1"                                                   |
| `text-[11px] leading-[15px] md:text-xs md:leading-[16px]` | Selector "Lv. N" captions                                               |

Heading elements are loosely semantic: `<h1>` is used for card and group titles (a Handbook page has several), `<h2>` for section labels, `<p>` for almost all copy. Two things are **not** headings any more: tab labels (`SlideButton` renders a `<span>`) and the changelog date (a `<time dateTime>`), because a heading must describe content that follows it (SEO-8). Every route must still render at least one `<h1>`, which `src/test/seo.test.tsx` checks. Preflight resets heading styles, so an `<h1>` without classes looks like a `<p>`. Accent words inside copy are bare `<span>`s (global rule, §9).

## 5. Layout

**Page wrapper**: `<section className="flex justify-center">` (Selector and TabLayout add `mx-4` / `mx-4 md:mx-8`). The app shell is `flex min-h-screen flex-col` with the Footer `mt-auto`.

**Cards** are all `bg-gradient-to-t` (the `from-` colour is the bottom edge):

| Component                    | Gradient                      | Rounding       | Size and spacing                                                                             |
| ---------------------------- | ----------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| Header                       | `from-card to-card-grad`      | none           | full width, `mb-16 p-1.5 px-4 md:p-3 md:px-8`; inner `mx-auto w-full max-w-[1125px]`         |
| Selector                     | `from-card to-card-grad`      | `rounded-3xl`  | `mb-6 w-[360px] max-w-[700px] px-8 py-8 md:w-full md:py-6`                                   |
| Calculator (top)             | `from-card-tool to-card-grad` | `rounded-t-lg` | `mx-4 w-[360px] py-8 md:w-full md:max-w-[700px] md:py-16`                                    |
| Tools (bottom)               | `from-card to-card-tool`      | `rounded-b-lg` | same width, `md:h-[225px]`; opens with the seam divider `h-px w-full bg-white/10`            |
| Overview, Graph              | `from-card to-card-grad`      | `rounded-lg`   | `mx-4 mt-16 w-[360px] max-w-[1050px] px-8 py-8 md:mx-8 md:mt-28 md:w-full md:px-10 md:py-10` |
| TabLayout (Handbook, Extras) | `from-card-tool to-card-grad` | `rounded-lg`   | `h-[650px] w-[360px] max-w-[800px] py-8 md:h-[700px] md:w-full md:py-10`                     |
| Footer                       | `from-card-grad to-card`      | none           | `mt-16 p-6`, `gap-4 md:gap-5`                                                                |

Calculator + Tools form one visual card: the gradient is continuous across the seam because both stop at `card-tool`. Use `from-card to-card-grad` for a standalone card; use the `card-tool` pairing only for a stacked pair.

**Inner wells** (`bg-dark`): Tools selector panel `focus mx-10 flex flex-col items-center justify-center space-y-5 rounded-3xl bg-dark py-6 md:flex-row md:space-x-10 md:space-y-0 md:py-3` (the catalyst panel uses `md:space-x-8`); Graph power box `flex items-center justify-between gap-3 rounded-lg bg-dark px-8 py-4 md:flex-col md:justify-center` and target box `flex w-full max-w-[325px] flex-col items-center justify-center gap-3 rounded-lg bg-dark px-8 py-4`; Header language button `group flex h-[40px] w-[80px] cursor-default items-center justify-center gap-3 bg-dark`.

**Dividers**: horizontal `<div className="h-px w-full bg-white/10" />`; vertical `<div className="h-full w-px bg-white/10" />`; the Calculator flips orientation with `mx-auto h-px w-full bg-white/10 md:h-full md:w-px`. Handbook panes use `mb-6 mt-4 h-px bg-white/10` under the header. (Overview and Graph use `<hr className="h-px w-full opacity-10">`; prefer the div form.)

**Tab pane skeleton** (Handbook tables; Changelog shares only the two outer wrappers and has its own header: version `<h1 className="text-xl font-semibold transition-all group-hover:text-white md:text-2xl">`, date `<h2>`, GitHub link, divider `mt-4 h-px bg-white/10`): outer `flex h-[535px] pt-10 md:h-[555px]` → `mx-8 flex w-full flex-col md:mx-10` → header row `flex justify-between` containing `flex items-center gap-5 md:gap-6` (symbol `<img width={!isMobile ? 32.5 : 30} className="scale-110">`, a vertical divider, `<h1 className="text-lg font-semibold md:text-2xl">`) and a help tooltip on the right → divider → scrollable content.

**Fixed geometry** to respect: phone cards are exactly 360 px wide; TabLayout panes are 650/700 px tall with 535/555 px inner panes (Credits is a fixed `h-[555px] py-10` at every breakpoint); the Selector's mobile grid is `w-[151px]` (three 35 px icons per row) beside a `h-[138px]` divider. New content inside these must scroll or fit.

## 6. Component recipes

**Number input** (Calculator level/exp; the Tools, Overview and Graph variants change width, height and padding, and Overview's drops `tracking-wider`, `text-secondary` and the `hover:/focus:text-primary` pair):

```tsx
<input
  type="number"
  placeholder="Level"
  value={isNaN(value) ? "" : value}
  onWheel={(e) => e.currentTarget.blur()}
  onChange={…clamp, then setSymbols(updateSymbol(…))…}
  className="w-1/2 bg-secondary p-2 text-center text-sm tracking-wider text-secondary outline-none transition-colors hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary focus:outline-none md:p-2.5"
/>
```

Inputs opt out of the global accent focus ring and show focus with `bg-hover` instead. Spinner buttons are removed globally. Always add the `onWheel` blur (one input in Tools lacks it).

**Toggle button** (Calculator daily/weekly/extra): state is the bottom border colour. Each toggle is wrapped in a tooltip whose trigger receives the bare `<button>` (a valid element, so no `{" "}`); the row container is `flex gap-3 pb-4 md:gap-2.5` with `w-full` buttons.

```tsx
<Tooltip placement="bottom">
  <TooltipTrigger asChild={true}>
    <button
      className={cn(
        "w-full border-b-[2px] border-unchecked/80 bg-secondary py-1.5 text-sm tracking-wider text-secondary transition-[background-color] select-none hover:bg-hover hover:text-primary focus:outline-accent md:border-unchecked md:text-base",
        currentSymbol.bonus && "border-checked/80 md:border-checked",
        typeof currentSymbol.bonus === "undefined" && "hidden"
      )}
      onClick={() => setSymbols(updateSymbol(symbols, selectedId, { bonus: !currentSymbol.bonus }))}
    >
      {m.bonus}
    </button>
  </TooltipTrigger>
  <TooltipContent className="tooltip">
    <Message text={m.bonusTooltip} values={{ quest: currentSymbol.bonusName }} />
  </TooltipContent>
</Tooltip>
```

Its copy goes in the catalogue (`bonus: "Bonus"`, `bonusTooltip: "<b>[Bonus Quest]</b> {quest}"` in `src/i18n/en/calculator.ts`), read with `const m = useMessages().calculator;`. A new toggle also needs the checklist in ARCHITECTURE §9 (effect deps, `getDailySymbols`, tests).

**Pill button** (Tools tool switcher): `flex max-w-[200px] select-none items-center justify-center rounded-2xl bg-dark px-3 py-2 tracking-wide text-secondary hover:bg-secondary hover:text-primary focus:outline-accent md:w-full md:max-w-[215px] md:gap-4 md:rounded-3xl md:px-4 md:transition-colors`, selected adds `gap-2 bg-secondary text-primary md:gap-4`; on mobile the unselected pill shows only its icon plus `shadow-accent shadow-level`. **Action button** (Apply): `flex w-[175px] select-none items-center justify-center rounded-2xl bg-secondary px-2 py-1.5 tracking-wide text-secondary hover:bg-hover hover:text-primary focus:outline-accent md:w-[100px] md:rounded-3xl md:px-4 md:py-2 md:transition-colors`, disabled adds `pointer-events-none opacity-25`.

**Nav link** (Header): `cn("transition-all hover:text-white", isActive && "text-white")` on an `<a href>` that calls `navigate` after `preventDefault`. **Changelog version button**: `w-full cursor-pointer select-none py-[20.2px] text-center text-xs transition-all hover:bg-light hover:tracking-wider hover:text-accent md:text-base`, selected adds `bg-light font-semibold tracking-wider text-accent`.

**Table** (Handbook): scroll container `flex overflow-y-auto`; `<table className="mb-1 w-full md:mr-10">`; `th` `pb-5 text-sm font-semibold md:text-base`; `td` `border border-white/5 py-[5px] text-center text-xs md:text-sm`; `tr` `cn("hover:bg-dark", isCurrentLevel && "bg-dark text-accent")` with a 12–16 px symbol icon beside the current level; first data row shows `-`; numbers via `toLocaleString()`. After the table, a desktop-only scrollbar spacer `cn("w-[11px] bg-dark", <shorter-dataset condition> && "hidden", isMobile && "hidden")` reserves scrollbar width on the dataset that does not overflow so columns don't shift. The condition is hand-set per table: CostTable `symbol.type === "arcane"`, ExpTable `mode === "arcane"` (20 vs 11 rows), RatioTable `mode === "sacred"` (9 arcane vs 16 sacred rows).

**Tooltip** (`placement` is `top` by default, or `bottom` / `left` / `right`):

```tsx
<Tooltip placement="bottom">
  <TooltipTrigger>
    <MdOutlineInfo
      size={20}
      className="cursor-default fill-accent transition-colors hover:fill-white md:mt-0.5"
    />
  </TooltipTrigger>
  <TooltipContent className="tooltip">
    <span>[Daily Quest]</span>
    <br></br> {dailyName}
  </TooltipContent>
</Tooltip>
```

`.tooltip` = `bg-[#111111] px-2.5 py-1.5 text-center text-xs md:text-sm rounded-lg shadow-input`. Conventions: bracketed label in a `<span>` on the first line, `<br></br>` line breaks, accent words as bare `<span>`s. The help icon on card headers is `HiOutlineQuestionMarkCircle size={!isMobile ? 30 : 27.5} className="cursor-default transition-all hover:stroke-white"`. Pick the trigger form by child (AGENTS.md gotcha 4): a single DOM element (`<button>`, `<input>`, `<div>`) goes in with `asChild`; an icon goes in without `asChild`, and the trigger renders its own `<button>`; content that holds inputs, buttons or a `RadioButton` uses `as="div"` so nothing interactive is nested in a button. Not `as="span"` around text: global CSS turns every span, and the text it inherits into, accent purple. The old `asChild` + `{" "}` form is gone; don't reintroduce it.

**RadioButton** (`ui/RadioButton.tsx`): a `<button type="button" role="radio" aria-checked>`, tabbable only when selected; arrow keys move focus and selection within the nearest `role="radiogroup"`, so always wrap a set in an element with `role="radiogroup"` and an `aria-label` (Selector "Symbol type", Graph "X-axis spacing"). Being a button, it gets the global `rounded-lg` and accent focus outline (§9), limited to keyboard focus with `focus:outline-none focus-visible:outline-solid` so a mouse click leaves no outline (Brian's call, 2026-09-16). Wrapper `group flex cursor-pointer items-center gap-4`; dot `h-[17.5px] w-[17.5px] rounded-full border-[3px] border-secondary transition-colors md:h-[20px] md:w-[20px]` + `selected ? "border-accent" : "group-hover:border-accent/25"`; label `text-sm transition-colors group-hover:text-primary md:text-base` + `selected && "text-primary"`.

**SlideButton / TabLayout** (`ui/`): nav `flex bg-dark text-center shadow-input transition-all`; each tab `group relative flex w-1/2 cursor-pointer flex-col justify-center py-4 transition-colors hover:bg-light hover:text-white md:py-5` + `selected && "bg-light text-white"`, label `<span className="text-sm md:text-base">` (a tab label is not a heading, SEO-8), underline `absolute bottom-0 left-0 right-0 mx-auto h-px w-0 bg-accent transition-all` + `selected ? "w-full" : "group-hover:w-1/4"`. `TabLayout` is uncontrolled by default and controlled when `activeTab`/`onTabChange` are passed; `mobileLabel` swaps in on phones. `TabLayout` is uncontrolled by default (Handbook) or controlled with `activeTab` + `onTabChange` (Extras, URL-driven); either way `onSelect` observes a change to a different tab, for side effects such as analytics, without taking over the state.

**Overview row**: a `<button>` row `flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-center hover:bg-dark md:justify-normal md:px-0 md:py-[17px]` (mobile adds `bg-dark`; disabled symbols `pointer-events-none opacity-25`; expanded `rounded-t-3xl bg-dark hover:bg-gradient-to-b hover:from-light`, else `rounded-3xl`) followed by an expander panel `flex flex-col items-center rounded-b-3xl bg-dark px-4 pb-4 text-center md:flex-row md:px-0`; the expanded wrapper gets `z-10 rounded-3xl shadow-level shadow-accent`. Desktop columns are `hidden md:block md:w-1/4`. The label/value pairs are wrappers `flex w-full items-center justify-between md:block md:w-1/4 md:justify-normal` that become the desktop columns; only the label inside them is phone-only (`<p className="block text-sm md:hidden">`).

**Icons**: `react-icons`, always imported from the pack subpath (`react-icons/fa6`, `hi`, `hi2`, `md`, `io`, `fi`, `tb`). Filled packs (fa6, md, io) recolour with `fill-*` / `hover:fill-white`; outline packs (hi, hi2, fi) with `stroke-*` / `hover:stroke-white`. Sizes branch in JS on `isMobile` (e.g. `FaArrowRight` 20/15, question icon 30/27.5, `FaGithub` 18/16) except social icons, which size via classes: `h-[22px] w-[22px] md:h-[26px] md:w-[26px]` in the Footer, `h-3.5 w-3.5 md:h-4 md:w-4` in CreditText. Symbol images are `/symbols/*.webp` at `width={40}` (Selector desktop) / 35 (phone) / 33 (Calculator title).

**Header menu** (`src/components/ServerMenu.tsx`, 2026-09-22): the trigger keeps the old language button's recipe (`h-[40px] min-w-[80px] bg-dark`, globe icon, dropped on phones); the panel is the tooltip look as a popover, `absolute right-0 z-50 mt-2 w-[230px] rounded-lg bg-[#111111] p-3 text-sm shadow-input`, with `text-xs text-tertiary` section labels, `rounded-lg px-2 py-1 hover:bg-light` rows (the current one `bg-light text-white`), a `h-px bg-white/10` divider and a native `<select>` (`rounded-lg bg-dark`). It closes on Escape and on a click outside.

## 7. Responsive rules

- Two systems, kept in sync by hand: Tailwind `md:` (≥768 px) for **styling**; `useBreakpoint()` → `isMobile` (≤767 px) / `isTablet` (≤1149 px) for **different markup, prop values, assets, or copy** (icon `size`, `<img width>`, Recharts config, `logo-sm` vs `logo-lg`, `mobileLabel`, tooltip `placement`). JS-branched elements are absent on the other breakpoint; `md:hidden` ones remain in the DOM (matters for tests).
- Only `md:` is used as a class prefix; `sm:`/`lg:`/`xl:`/`laptop:`/`phone:`/`dark:` appear nowhere.
- `isTablet` is rare: Header collapses to the compact layout, Overview shortens copy ("Level too low"), Graph shrinks dot radius.
- Phone widths are fixed at 360 px; desktop is `md:w-full` with a `max-w-[700px|800px|1050px]` cap.

## 8. Motion

- Defaults: `transition-all` or `transition-colors` at Tailwind's 150 ms. Calculator toggles animate only `transition-[background-color]`; Tools pills transition only on desktop (`md:transition-colors`).
- Selector indicator bar: `mt-1 h-[3px] w-[40px] rounded-full bg-accent transition-all duration-[350ms] md:mt-3 md:w-[50px]` + a `translate-x-[…]` from `BAR_POSITIONS` (six slots by position within the shown type; 80 px pitch = 40 px icon + `md:gap-10`), desktop only.
- Header mobile menu: `flex h-[55px] flex-col overflow-hidden transition-height` → `h-[110px]` when open.
- Hovers: `hover:scale-110` on social icons; `hover:tracking-wider` on changelog versions; the changelog GitHub icon spins (`transition-all duration-1000 hover:rotate-[360deg] hover:scale-110 hover:fill-white`); `group-hover:w-1/4` grows the tab underline. State rotations (`rotate-180` on chevrons) snap, no transition.
- Tooltips fade over 250 ms (`useTransitionStyles`, initial `opacity: 0`); hover opens after 400 ms and closes after 250 ms; focus opens instantly; offset 12 px, `flip` + `shift`.
- Recharts line animation is off (`isAnimationActive={false}`).

## 9. Global CSS side effects (`src/global.css`)

- `button:not(:disabled), [role="button"]`: `cursor: pointer`, restoring Tailwind 3 behaviour that Tailwind 4 preflight removed. A `cursor-*` utility on the element still wins.
- `body`: Maven Pro, `text-secondary`, `tracking-wide`, `bg-gradient-to-t from-dark to-[#202020]`, `overflow-x-hidden` (hides horizontal overflow bugs).
- `button, input, .focus`: `rounded-lg` plus a 2 px accent outline on keyboard focus only (`:focus-visible`; a mouse click draws none). Every button and input gets these unless overridden; `.focus` is applied to the two Tools panels so a focusable trigger shows the ring.
- `span { text-accent }`: **every span is purple**. All 40-odd spans in the app rely on this; a plain span will never be grey.
- `img { select-none pointer-events-none }`: images cannot be dragged or clicked; put handlers and `cursor-pointer` on the parent.
- `input::placeholder` is tertiary, secondary on hover/focus; number-input spinners are removed; scrollbars are thin, `#444444` thumb on `#212121` track (15 px in WebKit).
- `.tooltip` (see §6).

## 10. Preferred going forward

The codebase mixes some patterns; new code should pick these sides.

1. **`cn()` for every conditional class.** Never `` `${cond && "hidden"}` `` in a template literal: it emits `false`/`undefined` into the class attribute and bypasses tailwind-merge (the static `w-1/2 w-[80px]` in Tools.tsx is the same class of bug: a className that never went through `cn()`).
2. **Tokens over hex**: `hover:fill-accent`, not `hover:fill-[#B18BD0]`. Brand colours on social icons and Recharts string props are the accepted exceptions; keep the latter equal to token values.
3. **Text is `text-primary`/`secondary`/`tertiary`**; `text-white`, `fill-white`, `stroke-white` stay for nav-active state and icon hovers.
4. **Dividers are `<div className="h-px w-full bg-white/10" />`**, not `<hr>` with opacity.
5. **`md:` first, JS second**: reach for `useBreakpoint()` only when the difference is not expressible as a class.
6. **Don't hand-order classes** (Prettier's Tailwind plugin sorts them) and don't add tokens or breakpoints to the `@theme` block without asking; the unused ones (`text-upgrade`, `bg-tertiary`, `outline-basic`, `laptop`, `phone`) are candidates for removal, not for casual use.
7. **New number inputs** get the `onWheel` blur; **icon-only buttons** get an `aria-label`; **new static maps** are hoisted outside the component.
8. **Card gradient**: standalone → `from-card to-card-grad`; a stacked pair → meet at `card-tool`.

## 11. New component checklist

1. Pick the recipe (§5 card / tab pane, §6 control) and the closest sibling file; copy its banner comment and section order.
2. Skeleton:

```tsx
// Import depths shown for src/components/Thing.tsx; use ../../ from Calculator/, Handbook/, Extras/, ui/.
import { cn } from "../lib/utils";
import { useAppStore } from "../state/store";
import { useBreakpoint } from "../hooks/useBreakpoint";

interface ThingProps {
  label: string;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Thing component does one thing, stated in a sentence.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Thing = ({ label }: ThingProps) => {
  const mode = useAppStore((s) => s.mode);
  const { isMobile } = useBreakpoint();

  return (
    <section className="flex justify-center">
      <div className="mx-4 w-[360px] rounded-lg bg-gradient-to-t from-card to-card-grad px-8 py-8 md:w-full md:max-w-[700px] md:px-10 md:py-10">
        <p className={cn("text-sm md:text-base", mode === "sacred" && "text-accent")}>{label}</p>
        {isMobile && <p className="text-xs text-tertiary">phone-only copy</p>}
      </div>
    </section>
  );
};

export default Thing;
```

3. Store via selectors, not props, for feature components; props only for `ui/` primitives.
4. Every conditional class through `cn()`; tokens only; `md:` before `useBreakpoint()`.
5. Tooltips with `className="tooltip"` and `<span>` accent words; icon children go in a trigger without `asChild`, and triggers around inputs, buttons or radios use `as="div"`. Radio sets sit in a named `role="radiogroup"`.
6. Respect the fixed geometry (360 px phone width, pane heights); content scrolls inside.
7. Colocated `Thing.test.tsx` from `docs/TESTING.md`; then `pnpm lint && pnpm test`.
8. Run `/new-component` to have this scaffolded for you.
