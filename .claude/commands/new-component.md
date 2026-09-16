---
description: Scaffold a component in the house style with a colocated test
argument-hint: <Name> [folder: Calculator|Handbook|Extras|ui|(root)] [kind: card|section|primitive]
---

Scaffold a new component. Args: $ARGUMENTS (Name; optional folder under `src/components/`; optional kind).

Before writing anything, read `docs/DESIGN_SYSTEM.md` ("Recipes" and "New component checklist") and the closest existing component in the target folder, and copy its exact conventions.

Produce:

1. `src/components/<folder>/<Name>.tsx` in the house style:
   - imports → `interface <Name>Props` (only if it takes props) → the three-line `―――` banner comment → `const <Name> = (…) => { … };` → `export default <Name>;`
   - `cn()` for every conditional className; design tokens, never raw hex; `md:` classes for style-only responsiveness, `useBreakpoint()` only when markup, prop values, or copy differ.
   - kind `card`: `<section className="flex justify-center">` wrapping the card recipe. kind `section`: a block inside an existing card. kind `primitive`: lives in `ui/`, props only, no store access.
   - Store access through individual selectors; tooltips via `Tooltip`/`TooltipTrigger`/`TooltipContent` with `className="tooltip"`.
2. `src/components/<folder>/<Name>.test.tsx` from the component recipe in `docs/TESTING.md`, using the store and viewport helpers if the component needs them.
3. If it is a new page section, wire it into `src/App.tsx` and list the metadata places from `AGENTS.md` that a new route would touch.

Then run `pnpm test <Name>` (no `--`) and `pnpm lint` and show me the results. Do not add tokens to the `@theme` block in `src/global.css` without asking.
