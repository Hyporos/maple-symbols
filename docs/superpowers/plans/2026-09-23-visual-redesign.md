# Visual Redesign (`/next`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 2.0 redesign as a deletable copy of the UI in src/next/, reachable at `/next` on dev and Vercel previews, sharing the app's data, maths, store, saves and copy.

**Architecture:** A `/next` path segment after the edition prefix makes `App` hand the whole page to `NextApp` (lazy). `NextApp` renders a new shell and pages built only from a small component kit in src/next/ui/. Everything below the UI (src/lib, src/state, src/i18n, src/hooks) is shared; the only shared changes are Grand Sacred selection, the Sacred Power total including Grand, a `grand` term, and a `next` catalogue area.

**Tech Stack:** React 19, TypeScript strict, Vite 8, Tailwind 4 (`cn()`), Zustand 5, @floating-ui/react (popover), Recharts 3, Vitest + Testing Library (jsdom), pnpm.

**Spec:** `docs/superpowers/specs/2026-09-23-visual-redesign-design.md` (read it first).

## Global Constraints

- Package manager pnpm only. Run tests as `pnpm exec vitest run <path> --maxWorkers=2` (parallel agents; never `pnpm test -- …`). Finish every task with `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2`, `pnpm build`, all green.
- `src/components/` is not changed except where Task 1 says so. The current UI must keep working and its tests keep passing.
- No English literal in JSX: every string comes from the catalogue (`useMessages()`), whole sentences, `<b>…</b>` for accent words, `{name}` placeholders; game words are term placeholders (`{sacredSymbol}` …). New copy goes only in the `next` area created by Task 1; other tasks do not add catalogue keys (if one is truly missing, stop and report it).
- Colours only from the `@theme` tokens in src/global.css (`accent`, `card`, `card-grad`, `dark`, `light`, `secondary`, `hover`, text `primary`/`secondary`/`tertiary`) plus `white/…` alphas; no new hex values.
- Conditional classes via `cn()` from src/lib/utils.ts; never hand-order Tailwind classes (Prettier sorts them).
- Components: `const Name = () => { … }; export default Name;`, `interface NameProps` above, and the three-line `―――` banner comment copied from a sibling in src/components. Colocated `Name.test.tsx` with explicit `import { describe, expect, it } from "vitest"`.
- Accessibility: real roles (`switch`, `radiogroup`/`radio`, `tablist`/`tab`/`tabpanel`, `dialog`), keyboard operable, no interactive element nested in another (src/test/interactiveNesting.test.tsx must cover the new pages).
- Store access one selector per line: `const symbols = useAppStore((s) => s.symbols);`.
- Motion: transitions only on `transform`, `opacity`, `width`, `background-color`; every transition class paired with `motion-reduce:transition-none`.
- Breakpoints: `useBreakpoint()` (`isMobile` < 768, `isTablet` < 1150) when markup differs; `md:` / `min-[1150px]:` classes when only style differs.
- Commits: capitalised imperative subject, no prefix, no period; stage files by name (never `git add -A`); body ends with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
- Parallel tasks each run in their own worktree created from `v2` (`git worktree add -b <branch> <path> v2`), never `isolation: "worktree"` (MISTAKES M-018).

## Review Focus

- **An unset symbol** (level blank, NaN) in every card: the calculator shows its "enter a level" state, rings show empty, overview row shows its blank placeholders, tools are disabled, nothing throws. Pinned in Task 4 and Task 5 tests.
- **A Grand Sacred symbol selected**: no weekly/extra rows, no Catalyst button, Selector only on Tallahart, no main-stat box, Sacred Power total includes it. Pinned in Task 4.
- **The phone layout at 360 px** with the longest label (Korean/Japanese copy, MSEA's "Authentic"): nothing overflows horizontally. Pinned by Task 7's screenshot pass and a test that the page root has no fixed widths wider than the viewport (Task 3).
- **Returning to `/` from `/next`** keeps the same saved levels, and a `/next` URL on production falls back to the calculator. Pinned in Task 1.
- **Keyboard only**: the family switch, quest switches, bottom tabs, tools popover (Escape closes, focus returns) all work without a mouse. Pinned in Task 2 kit tests and Task 4.

---

### Task 1: Foundation (shared changes, `/next` routing, copy)

Sequential, before everything else. One agent.

**Files:**
- Modify: `src/state/store.ts` (mode type, selection), `src/components/Calculator/Calculator.tsx:45`, `Graph.tsx:139`, `Overview.tsx:23`, `Tools.tsx:29`, `src/components/Handbook/ExpTable.tsx:19`, `RatioTable.tsx:17`, `src/components/Selector.tsx:33` (read `useMode()`), `src/hooks/usePower.ts`, `src/lib/graph.ts` (`buildDateSymbols` family filter), `src/lib/game.ts` (`inFamily`), `src/i18n/terms.ts` (`grand` term), `src/i18n/en/index.ts` and the four translations' `index.ts`, `src/App.tsx`, `src/main.tsx`
- Create: `src/next/routing.ts`, `src/next/routing.test.ts`, `src/next/testing.tsx`, `src/next/NextApp.tsx`, `src/next/NextApp.test.tsx`, `src/next/NextApp.production.test.tsx`, `src/next/pages/CalculatorPage.tsx`, `src/next/pages/HandbookPage.tsx`, `src/next/pages/ExtrasPage.tsx`, `src/next/shell/NextShell.tsx`, `src/i18n/en/next.ts`, `src/i18n/ko/next.ts`, `src/i18n/ja/next.ts`, `src/i18n/zh-Hant/next.ts`, `src/i18n/zh-Hans/next.ts`
- Test: `src/state/store.test.ts`, `src/hooks/usePower.test.ts`, `src/test/grandHidden.test.tsx`, `src/next/routing.test.ts`, `src/next/NextApp.test.tsx`

**Interfaces:**
- Produces:
  - `useAppStore` state `mode: SymbolType` ("arcane" | "sacred" | "grand"), `setMode(mode: SymbolType)`, `selectSymbol(id)` accepts Grand ids 13/14, `lastSelected: Record<SymbolType, number>`, `DEFAULT_SELECTION = { arcane: 1, sacred: 7, grand: 13 }`.
  - `useMode(): Mode` in src/state/store.ts (grand → "sacred"), for the current UI only.
  - `inFamily(type: SymbolType, family: SymbolType): boolean` in src/lib/game.ts: true when equal, or when `family === "sacred"` and `type === "grand"`.
  - `usePower(symbols, family)` sums every symbol `inFamily(symbol.type, family)`.
  - `buildDateSymbols(symbols, family, now, region)` includes symbols `inFamily(symbol.type, family)`.
  - term `grand` in every `TERMS` table.
  - src/next/routing.ts: `NEXT_UI: boolean`, `splitNext(rest: string): { next: boolean; rest: string }`, `nextHref(path: RoutePath, edition: Edition): string`, `useNextRoute(): { edition: Edition; route: Route; path: RoutePath }`.
  - `useMessages().next` with the keys below.
  - src/next/testing.tsx: `renderNextAt(path: string): RenderResult` renders `<RouterProvider><App /></RouterProvider>` at `path` (every /next page test uses it; it lives in src/next/ so deleting the folder removes it).
  - Default-exported components with no props: `NextApp`, `NextShell` (children), `CalculatorPage`, `HandbookPage`, `ExtrasPage` (minimal until Tasks 3–6 replace them).

- [ ] **Step 1: Write the failing store test**

In `src/state/store.test.ts` add:

```ts
describe("Grand Sacred selection (spec §1)", () => {
  it("selects a Grand Sacred symbol and remembers it for the grand family", () => {
    useAppStore.getState().selectSymbol(13);
    expect(useAppStore.getState().selectedId).toBe(13);
    expect(useAppStore.getState().mode).toBe("grand");
    useAppStore.getState().setMode("arcane");
    useAppStore.getState().setMode("grand");
    expect(useAppStore.getState().selectedId).toBe(13);
  });

  it("starts the grand family on Tallahart", () => {
    useAppStore.getState().setMode("grand");
    expect(useAppStore.getState().selectedId).toBe(13);
  });
});
```

- [ ] **Step 2: Run it and see it fail**

Run: `pnpm exec vitest run src/state/store.test.ts --maxWorkers=2`
Expected: FAIL (selectSymbol(13) is ignored; `setMode("grand")` is a type error).

- [ ] **Step 3: Change the store**

In `src/state/store.ts`: import `SymbolType` instead of `Mode` for the state; replace the `isMode` guard.

```ts
import type { Mode, SymbolData, SymbolType } from "../lib/types";

/** First symbol of each family in symbols.json (Vanishing Journey, Cernium, Tallahart). */
export const DEFAULT_SELECTION: Record<SymbolType, number> = { arcane: 1, sacred: 7, grand: 13 };
```

In `AppStore`: `mode: SymbolType; setMode: (mode: SymbolType) => void; lastSelected: Record<SymbolType, number>;`, and in `selectSymbol` delete the `if (!isMode(type)) return;` line (keep the unknown-id guard). Update the `selectSymbol` doc comment: "An unknown id changes nothing." Remove the now-unused `isMode` import.

Add after `useSelectedSymbol`:

```ts
/**
 * The family the current UI shows (src/components): Arcane or Sacred. That UI has no Grand
 * tab, so a Grand selection (made in /next, src/next/) reads as Sacred there.
 */
export const useMode = (): Mode => useAppStore((s) => (s.mode === "grand" ? "sacred" : s.mode));
```

In each of the seven current-UI files listed under Files, replace `const mode = useAppStore((s) => s.mode);` with `const mode = useMode();` and import `useMode` from the store.

- [ ] **Step 4: Run the store test and the current UI's tests**

Run: `pnpm exec vitest run src/state src/components src/test --maxWorkers=2`
Expected: the new store tests PASS. `src/test/grandHidden.test.tsx` FAILS where it asserts `selectSymbol(13)` is ignored and that the Sacred total stays "50 / 110".

- [ ] **Step 5: Family maths — failing tests**

In `src/hooks/usePower.test.ts` add:

```ts
it("counts Grand Sacred toward the Sacred Power total (spec §1)", () => {
  const symbols = [
    { type: "sacred" as const, level: 5 },
    { type: "grand" as const, level: 2 },
    { type: "arcane" as const, level: 3 },
  ];
  const { result } = renderHook(() => usePower(symbols, "sacred"));
  expect(result.current).toBe(70); // 50 + 20
  const { result: grand } = renderHook(() => usePower(symbols, "grand"));
  expect(grand.current).toBe(20);
});
```

In `src/lib/game.test.ts` (create if absent) add:

```ts
import { describe, expect, it } from "vitest";
import { inFamily } from "./game";

describe("inFamily", () => {
  it("puts Grand Sacred inside the Sacred family, and nothing else across families", () => {
    expect(inFamily("grand", "sacred")).toBe(true);
    expect(inFamily("sacred", "sacred")).toBe(true);
    expect(inFamily("grand", "grand")).toBe(true);
    expect(inFamily("sacred", "grand")).toBe(false);
    expect(inFamily("arcane", "sacred")).toBe(false);
  });
});
```

Run: `pnpm exec vitest run src/lib/game src/hooks --maxWorkers=2` → FAIL.

- [ ] **Step 6: Implement the family maths**

`src/lib/game.ts`:

```ts
/**
 * Whether a symbol of `type` counts toward `family`'s power and graph: its own family, and
 * Grand Sacred inside Sacred (their power adds to Sacred Power, Brian 2026-09-23).
 */
export const inFamily = (type: SymbolType, family: SymbolType): boolean =>
  type === family || (family === "sacred" && type === "grand");
```

`src/hooks/usePower.ts`: replace `symbol.type !== type` with `!inFamily(symbol.type, type)`; keep the arcane base (`type === "arcane"`) but key it on the symbol: `(symbol.type === "arcane" ? ARCANE_BASE_POWER : 0)`.

`src/lib/graph.ts` `buildDateSymbols`: replace the `symbol.type === type` filter with `inFamily(symbol.type, type)` and compute `maxLevel` per symbol with `MAX_LEVEL[symbol.type]`.

Update `src/test/grandHidden.test.tsx`: the Sacred total now includes the seeded Grand symbols (change the expected "50 / 110" to the new value the test computes from its seeds, with a comment citing the spec); replace "selection is ignored" with "the current Selector offers no Grand symbol" (it renders exactly six chips in both modes). Run: `pnpm exec vitest run src --maxWorkers=2` → PASS.

- [ ] **Step 7: The `grand` term**

In `src/i18n/terms.ts` add to `Terms`: `/** The Grand Sacred family's short name (the picker's third tab). */ grand: string;` and a value in every table: en-gms `"Grand"`, en-msea `"Grand"` (maplesea v238: "Grand Authentic Symbol: Talahart"), ko `"그랜드"` (update 797: "그랜드 어센틱심볼 : 기어드락"), ja `"グランド"` (ver4.44: 「グランドオーセンティックシンボル:ギアードラック」), zh-Hant `"豪華"` (client string 豪華真實符文; mark "official text not found" in the comment), zh-Hans `"豪华"` (V227 page: 豪华原初徽章：神烬之地). The terms test requires every term to be used by the English catalogue: Step 8 uses `{grand}`.

- [ ] **Step 8: The `next` catalogue area**

Create `src/i18n/en/next.ts` (and register `next` in `src/i18n/en/index.ts` alphabetically):

```ts
// The redesigned interface at /next (docs/superpowers/specs/2026-09-23-visual-redesign-design.md).
// Only copy the current interface lacks; the rest is read from the existing areas.
// When /next replaces the current UI, these keys move to their pages' areas.
export const next = {
  shell: {
    characterChip: "Main",
    characterMenu: "Choose a character",
    charactersSoon:
      "Character profiles are coming in 2.0, so your main and your alts keep their own levels.",
    accessibility: "Text and contrast",
    accessibilitySoon:
      "An accessibility mode with higher contrast and larger text is coming in 2.0.",
    feedback: "Feedback",
    feedbackSoon: "Soon you can report a wrong number or suggest an improvement from here.",
    closeNote: "Close",
  },
  calculator: {
    sections: "Calculator sections",
    tabEdit: "Edit",
    tabOverview: "Overview",
    tabGraph: "Graph",
    pickerLabel: "Symbols",
    familyLabel: "Symbol family",
    familyGrand: "{grand}",
    familyPower: "{power}: <b>{value}</b> / {max}",
    symbolLevel: "{symbol}, level {level} of {max}",
    maxShort: "MAX",
    calculatorLabel: "Calculator",
    expOf: "/ {count} exp",
    perDay: "{count} / day",
    perWeek: "{count} / week",
    extraFactor: "×{factor}",
    extraQuest: "Extra ({quest})",
    nextLevel: "Next level",
    readyNow: "Ready now",
    inDays: { one: "In {count} day", other: "In {count} days" },
    notSet: "Not set",
    cost: "Cost",
    mainStat: "Main stat",
    toolsLabel: "Tools",
    toolsClose: "Close",
  },
  overview: {
    label: "Overview",
    allMaxedOn: "All maxed on <b>{date}</b>",
    allMaxedUnknown: "Enter each symbol's level and quests to see when everything is maxed",
    toMax: "{symbol}: {percent}% of the way to max",
  },
  graph: {
    label: "Power over time",
    now: "Now",
    target: "Target",
    reachedBy: "by <b>{date}</b>",
  },
  handbook: { label: "Handbook" },
  extras: { label: "Extras" },
} as const;
```

Create `src/i18n/ko/next.ts`, `ja/next.ts`, `zh-Hant/next.ts`, `zh-Hans/next.ts` with the same keys, translated in the vocabulary each catalogue already uses (read its `calculator.ts`, `overview.ts`, `graph.ts`, `shell.ts` first; keep every `{placeholder}` and `<b>` exactly; plural pairs get both forms). Register each in its language's `index.ts`. `src/i18n/drafts.test.ts` and `catalogue.test.ts` check keys, placeholders and markup.

- [ ] **Step 9: Routing — failing tests**

`src/next/routing.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { EDITIONS } from "../lib/routes";
import { nextHref, splitNext } from "./routing";

const kms = EDITIONS.find((e) => e.region === "kms")!;
const gms = EDITIONS[0];

describe("/next routing (spec §1)", () => {
  it("recognises a /next segment after the edition prefix and returns the page inside it", () => {
    expect(splitNext("/next")).toEqual({ next: true, rest: "/" });
    expect(splitNext("/next/handbook")).toEqual({ next: true, rest: "/handbook" });
    expect(splitNext("/handbook")).toEqual({ next: false, rest: "/handbook" });
    expect(splitNext("/nextx")).toEqual({ next: false, rest: "/nextx" });
  });

  it("builds /next links inside an edition", () => {
    expect(nextHref("/", gms)).toBe("/next");
    expect(nextHref("/handbook", gms)).toBe("/next/handbook");
    expect(nextHref("/", kms)).toBe("/kms/next");
    expect(nextHref("/credits", kms)).toBe("/kms/next/credits");
  });
});
```

`src/next/testing.tsx`:

```tsx
import { render, type RenderResult } from "@testing-library/react";
import App from "../App";
import { RouterProvider } from "../contexts/RouterContext";

/** Render the whole app at a path (a /next page test's starting point). */
export function renderNextAt(path: string): RenderResult {
  window.history.replaceState(null, "", path);
  return render(
    <RouterProvider>
      <App />
    </RouterProvider>
  );
}
```

`src/next/NextApp.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderNextAt as renderAt } from "./testing";

describe("NextApp", () => {
  it("takes over the page at /next, marked noindex", async () => {
    renderAt("/next");
    expect(await screen.findByTestId("next-app")).toBeInTheDocument();
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe(
      "noindex"
    );
  });

  it("leaves every other path to the current interface", () => {
    renderAt("/handbook");
    expect(screen.queryByTestId("next-app")).not.toBeInTheDocument();
  });
});
```

`src/next/NextApp.production.test.tsx` (a production build, where `NEXT_UI` is false):

```tsx
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderNextAt } from "./testing";

vi.mock("./routing", async (original) => ({
  ...(await original<typeof import("./routing")>()),
  NEXT_UI: false,
}));

describe("/next in production", () => {
  it("is an unknown page there, so it shows the edition's calculator", async () => {
    renderNextAt("/next");
    expect(screen.queryByTestId("next-app")).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
```

Run all three → FAIL (module missing).

- [ ] **Step 10: Implement routing and the hand-off**

`src/next/routing.ts`:

```ts
// ---------------------------------------------------------------------------
// routing.ts — The /next redesign's paths (docs/superpowers/specs/2026-09-23-visual-redesign-design.md).
//
// A /next segment right after the edition prefix ("/next/handbook", "/kms/next") hands the
// page to src/next/NextApp.tsx. Served by the dev server and by builds that serve drafts (every
// Vercel preview); production treats /next as an unknown page (its edition's calculator).
// ---------------------------------------------------------------------------

import { useRouter } from "../contexts/RouterContext";
import { routeFor, SERVES_DRAFTS, splitPath, type Edition, type Route, type RoutePath } from "../lib/routes";

export const NEXT_UI: boolean = import.meta.env.DEV || SERVES_DRAFTS;

/** Whether the page inside an edition is under /next, and the page path beneath it. */
export function splitNext(rest: string): { next: boolean; rest: string } {
  if (rest === "/next") return { next: true, rest: "/" };
  if (rest.startsWith("/next/")) return { next: true, rest: rest.slice("/next".length) };
  return { next: false, rest };
}

/** The /next link to a page of an edition. */
export const nextHref = (path: RoutePath, edition: Edition): string =>
  `${edition.prefix}/next${path === "/" ? "" : path}`;

/** The edition and page of the current /next URL (unknown pages are the calculator). */
export function useNextRoute(): { edition: Edition; route: Route; path: RoutePath } {
  const { edition, rest } = splitPath(useRouter().path);
  const route = routeFor(edition.prefix + splitNext(rest).rest);
  return { edition, route, path: route.path };
}
```

`src/next/NextApp.tsx` (the `noindex` meta is added on mount and removed on unmount):

```tsx
import { useEffect } from "react";
import { BreakpointProvider } from "../contexts/BreakpointContext";
import { useNextRoute } from "./routing";
import NextShell from "./shell/NextShell";
import CalculatorPage from "./pages/CalculatorPage";
import HandbookPage from "./pages/HandbookPage";
import ExtrasPage from "./pages/ExtrasPage";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * NextApp is the redesigned interface at /next: the shell and the page the URL names.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const NextApp = () => {
  const { path } = useNextRoute();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <BreakpointProvider>
      <div data-testid="next-app">
        <NextShell>
          {path === "/handbook" ? (
            <HandbookPage />
          ) : path === "/changelog" || path === "/credits" ? (
            <ExtrasPage />
          ) : (
            <CalculatorPage />
          )}
        </NextShell>
      </div>
    </BreakpointProvider>
  );
};

export default NextApp;
```

Minimal placeholders to be replaced by later tasks (each renders its page's catalogue label so Tasks 3–6 can start in parallel):

```tsx
// src/next/shell/NextShell.tsx
import type { ReactNode } from "react";
interface NextShellProps { children: ReactNode }
const NextShell = ({ children }: NextShellProps) => <main>{children}</main>;
export default NextShell;
```

```tsx
// src/next/pages/CalculatorPage.tsx (same shape for HandbookPage with m.handbook.label, ExtrasPage with m.extras.label)
import { useMessages } from "../../i18n";
const CalculatorPage = () => <h1>{useMessages().next.calculator.calculatorLabel}</h1>;
export default CalculatorPage;
```

`src/App.tsx`: at the top add `const NextApp = lazy(() => import("./next/NextApp"));` and import `{ NEXT_UI, splitNext }` from `./next/routing` and `splitPath` from `./lib/routes`. In `App`, after its hooks and before `return`, add:

```tsx
const { path } = useRouter();
if (NEXT_UI && splitNext(splitPath(path).rest).next) {
  return (
    <Suspense fallback={null}>
      <NextApp />
    </Suspense>
  );
}
```

`src/main.tsx`: a preview serves the calculator's prebuilt HTML for `/next` (an unknown path), so render `/next` fresh instead of hydrating:

```tsx
import { NEXT_UI, splitNext } from "./next/routing";
import { splitPath } from "./lib/routes";

const isNext = NEXT_UI && splitNext(splitPath(window.location.pathname).rest).next;
if (container.hasChildNodes() && !isNext) ReactDOM.hydrateRoot(container, app);
else {
  container.replaceChildren();
  ReactDOM.createRoot(container).render(app);
}
```

- [ ] **Step 11: Verify and commit**

Run: `pnpm lint && pnpm typecheck && pnpm exec vitest run --maxWorkers=2 && pnpm build`. Expected: all PASS, and the prebuilt pages don't contain the redesign (`grep -c next-app dist/index.html` prints 0).

Docs: ARCHITECTURE §2 (the `/next` segment, `NEXT_UI`), §3 (mode includes grand, `useMode` for the current UI), GAME §4 (Grand power counts toward Sacred), AGENTS map line (`next/` redesign copy), I18N §10 (`grand` term).

```bash
git add src/state/store.ts src/state/store.test.ts src/hooks/usePower.ts src/hooks/usePower.test.ts src/lib/game.ts src/lib/game.test.ts src/lib/graph.ts src/test/grandHidden.test.tsx src/components/Calculator/Calculator.tsx src/components/Calculator/Graph.tsx src/components/Calculator/Overview.tsx src/components/Calculator/Tools.tsx src/components/Handbook/ExpTable.tsx src/components/Handbook/RatioTable.tsx src/components/Selector.tsx src/i18n/terms.ts src/i18n/en/next.ts src/i18n/en/index.ts src/i18n/ko/next.ts src/i18n/ko/index.ts src/i18n/ja/next.ts src/i18n/ja/index.ts src/i18n/zh-Hant/next.ts src/i18n/zh-Hant/index.ts src/i18n/zh-Hans/next.ts src/i18n/zh-Hans/index.ts src/next src/App.tsx src/main.tsx docs/ARCHITECTURE.md docs/GAME.md docs/I18N.md AGENTS.md
git commit -m "Add the /next redesign entry, Grand Sacred selection and the next copy"
```

---

### Task 2: Component kit (src/next/ui/)

After Task 1. One agent. Each component: test first, then implementation, then run.

**Files:** Create in `src/next/ui/`: `Card.tsx`, `SegmentedSwitch.tsx`, `Switch.tsx`, `ProgressRing.tsx`, `ProgressBar.tsx`, `StatBox.tsx`, `NumberField.tsx`, `Sheet.tsx`, `Tabs.tsx`, `BottomTabBar.tsx`, `DataTable.tsx`, each with a colocated `.test.tsx`, and `index.ts` re-exporting all of them.

**Interfaces (Produces):**

```ts
Card: ({ label?: string; className?: string; children: ReactNode; as?: "section" | "div" })
SegmentedSwitch<T extends string>: ({ label: string; options: { value: T; label: string }[]; value: T; onChange: (value: T) => void; className?: string })
Switch: ({ checked: boolean; onChange: (checked: boolean) => void; label: string; disabled?: boolean })
ProgressRing: ({ value: number; max: number; label: string; size?: number; children: ReactNode })   // value/max clamp to 0..1; NaN → 0
ProgressBar: ({ value: number; max: number; label: string; className?: string })
StatBox: ({ caption: string; children: ReactNode; className?: string })
NumberField: ({ value: number; onChange: (raw: string) => void; placeholder: string; label: string; className?: string; disabled?: boolean })   // NaN renders ""
Sheet: ({ open: boolean; onClose: () => void; title: string; closeLabel: string; anchor?: HTMLElement | null; children: ReactNode })   // phone: bottom sheet; desktop: popover at anchor
Tabs<T extends string>: ({ label: string; tabs: { value: T; label: string }[]; value: T; onChange: (value: T) => void; idPrefix: string })   // renders tablist; panels use id `${idPrefix}-panel-${value}`
BottomTabBar<T extends string>: ({ label: string; tabs: { value: T; label: string; icon: ReactNode }[]; value: T; onChange: (value: T) => void; idPrefix: string })
DataTable: ({ columns: { key: string; header: string; align?: "left" | "right" | "center" }[]; rows: { key: string; cells: ReactNode[]; current?: boolean }[]; caption: string })
```

- [ ] **Step 1: Card test and implementation**

```tsx
// Card.test.tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  it("renders its content, with the small label above it when given", () => {
    render(<Card label="Symbols">body</Card>);
    expect(screen.getByText("Symbols")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });
  it("names a section after its label", () => {
    render(<Card label="Overview" as="section">x</Card>);
    expect(screen.getByRole("region", { name: "Overview" })).toBeInTheDocument();
  });
});
```

```tsx
// Card.tsx
import { useId, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps { label?: string; className?: string; children: ReactNode; as?: "section" | "div" }

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * Card is the redesign's surface: the gradient card with a hairline edge and a faint top highlight.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Card = ({ label, className, children, as = "div" }: CardProps) => {
  const id = useId();
  const Tag = as;
  return (
    <Tag
      aria-labelledby={label ? id : undefined}
      className={cn(
        "rounded-xl border border-white/6 bg-linear-to-t from-card to-card-grad p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_8px_24px_rgb(0_0_0/0.25)] md:p-5",
        className
      )}
    >
      {label && (
        <p id={id} className="mb-3 text-[11px] tracking-[0.08em] text-tertiary uppercase">
          {label}
        </p>
      )}
      {children}
    </Tag>
  );
};

export default Card;
```

Run `pnpm exec vitest run src/next/ui/Card --maxWorkers=2` → PASS.

- [ ] **Step 2: SegmentedSwitch (radiogroup with arrow keys)**

Test:

```tsx
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SegmentedSwitch from "./SegmentedSwitch";

const options = [
  { value: "arcane", label: "Arcane" },
  { value: "sacred", label: "Sacred" },
  { value: "grand", label: "Grand" },
] as const;

describe("SegmentedSwitch", () => {
  it("is a radiogroup with the current option checked", () => {
    render(<SegmentedSwitch label="Symbol family" options={[...options]} value="sacred" onChange={() => {}} />);
    expect(screen.getByRole("radiogroup", { name: "Symbol family" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Sacred" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Arcane" })).toHaveAttribute("tabindex", "-1");
  });
  it("changes on click and with the arrow keys, wrapping", () => {
    const onChange = vi.fn();
    render(<SegmentedSwitch label="f" options={[...options]} value="grand" onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Arcane" }));
    expect(onChange).toHaveBeenLastCalledWith("arcane");
    fireEvent.keyDown(screen.getByRole("radio", { name: "Grand" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("arcane");
    fireEvent.keyDown(screen.getByRole("radio", { name: "Grand" }), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith("sacred");
  });
});
```

Implementation: a `div role="radiogroup" aria-label={label}` with `inline-flex gap-0.5 rounded-lg bg-dark p-1`; each option a `<button type="button" role="radio" aria-checked tabIndex={checked ? 0 : -1}>` with `rounded-md px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none`, checked `bg-secondary text-primary`, else `text-secondary hover:text-primary`. `onKeyDown`: ArrowRight/ArrowDown → next (wrap), ArrowLeft/ArrowUp → previous (wrap); call `onChange` and focus the new button (`event.currentTarget.parentElement?.children[i] as HTMLElement`).

- [ ] **Step 3: Switch**

Test: `getByRole("switch", { name: "Daily" })` has `aria-checked="false"`; click calls `onChange(true)`; `disabled` → `toBeDisabled()` and click does nothing.

Implementation: `<button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}>` with a track `relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors motion-reduce:transition-none` (`checked ? "bg-accent/35" : "bg-secondary"`) and a knob `absolute top-0.5 left-0.5 size-4 rounded-full transition-transform motion-reduce:transition-none` (`checked ? "translate-x-4 bg-accent" : "bg-tertiary"`), `disabled:opacity-40`.

- [ ] **Step 4: ProgressRing and ProgressBar**

Tests: ring `getByRole("img", { name: "Vanishing Journey, level 12 of 20" })` renders its child; `value` NaN → the ring's `data-fraction` is "0"; value above max → "1". Bar: `getByRole("progressbar", { name: "Experience" })` has `aria-valuenow`/`aria-valuemax`; NaN → `aria-valuenow="0"`.

Implementations:

```tsx
// ProgressRing.tsx (conic-gradient ring around the child)
const fraction = Number.isFinite(value) && max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
return (
  <span
    role="img"
    aria-label={label}
    data-fraction={String(fraction)}
    className="grid shrink-0 place-items-center rounded-full"
    style={{
      width: size,
      height: size,
      background: `conic-gradient(var(--color-accent) ${fraction * 360}deg, var(--background-color-secondary) 0)`,
    }}
  >
    <span className="grid place-items-center rounded-full bg-card" style={{ width: size - 6, height: size - 6 }}>
      {children}
    </span>
  </span>
);
```

```tsx
// ProgressBar.tsx
const now = Number.isFinite(value) ? Math.min(Math.max(value, 0), max) : 0;
return (
  <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={now}
       className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}>
    <div className="h-full rounded-full bg-accent transition-[width] duration-300 motion-reduce:transition-none"
         style={{ width: `${max > 0 ? (now / max) * 100 : 0}%` }} />
  </div>
);
```

- [ ] **Step 5: StatBox and NumberField**

StatBox test: renders caption and value. Implementation `rounded-lg bg-dark px-3 py-2` with caption `text-xs text-tertiary` and value `text-sm text-primary`.

NumberField test: `getByRole("spinbutton", { name: "Level" })` shows "" for NaN and "12" for 12; typing calls `onChange("5")`; the mouse wheel blurs it (`fireEvent.wheel` → not focused). Implementation: `<input type="number" inputMode="numeric" aria-label={label} placeholder value={Number.isNaN(value) ? "" : value} onChange={(e) => onChange(e.target.value)} onWheel={(e) => e.currentTarget.blur()}>` styled `w-full rounded-lg bg-secondary px-3 py-2 text-center text-sm text-secondary outline-hidden transition-colors hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary motion-reduce:transition-none`.

- [ ] **Step 6: Sheet (bottom sheet on phones, popover on desktop)**

Test:

```tsx
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Sheet from "./Sheet";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { setViewport } from "../../test/helpers";

const renderSheet = (onClose = vi.fn()) =>
  render(
    <BreakpointProvider>
      <button>opener</button>
      <Sheet open title="Symbol Selector" closeLabel="Close" onClose={onClose}>
        <input aria-label="Count" />
      </Sheet>
    </BreakpointProvider>
  );

describe("Sheet", () => {
  it("is a dialog named by its title that takes focus, and Escape closes it", () => {
    setViewport("mobile");
    const onClose = vi.fn();
    renderSheet(onClose);
    const dialog = screen.getByRole("dialog", { name: "Symbol Selector" });
    expect(dialog.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
  it("closes from its close button", () => {
    setViewport("desktop");
    const onClose = vi.fn();
    renderSheet(onClose);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
  it("renders nothing while closed", () => {
    render(<BreakpointProvider><Sheet open={false} title="t" closeLabel="c" onClose={() => {}}>x</Sheet></BreakpointProvider>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
```

Implementation: return null when closed. Otherwise, portal to `document.body` (`createPortal`). Remember `document.activeElement` on open and restore focus to it on close (effect cleanup). Focus the first focusable element inside on open. `onKeyDown` Escape → `onClose()`. Phones (`useBreakpoint().isMobile`): a fixed backdrop `fixed inset-0 z-40 bg-black/50` (click → `onClose`) and the panel `fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-white/6 bg-light p-5 pb-8 shadow-[0_-8px_24px_rgb(0_0_0/0.4)] motion-safe:animate-[sheet-in_200ms_ease-out]` (add `@keyframes sheet-in { from { transform: translateY(16px); opacity: 0 } }` to src/global.css and document it in DESIGN_SYSTEM §9). Desktop: `useFloating({ elements: { reference: anchor }, placement: "bottom", middleware: [offset(8), flip(), shift({ padding: 8 })] })` from @floating-ui/react, panel `z-50 w-[340px] rounded-xl border border-white/6 bg-light p-5 shadow-input`. Both: `role="dialog" aria-modal="true" aria-labelledby` a header row with the title (`text-sm font-semibold text-primary`) and a close `<button aria-label={closeLabel}>` with an `HiXMark` icon.

- [ ] **Step 7: Tabs and BottomTabBar**

Test (Tabs): `getByRole("tablist", { name })`; current tab `aria-selected="true"` and `aria-controls="<prefix>-panel-<value>"`; ArrowRight moves and calls `onChange`. Test (BottomTabBar): same roles; it is `position: fixed` at the bottom (class `fixed`), and each tab shows its icon and label.

Tabs implementation: `div role="tablist"` `flex border-b border-white/8`; each `<button role="tab" id={`${idPrefix}-tab-${value}`} aria-selected aria-controls={`${idPrefix}-panel-${value}`} tabIndex={selected ? 0 : -1}>` `flex-1 py-3 text-sm transition-colors motion-reduce:transition-none` with selected `text-primary shadow-[inset_0_-2px_0_var(--color-accent)]` else `text-tertiary hover:text-secondary`; arrow keys as in SegmentedSwitch.

BottomTabBar: `nav` containing the same tablist markup, `fixed inset-x-0 bottom-0 z-30 flex border-t border-white/8 bg-card-grad/95 pb-[env(safe-area-inset-bottom)] backdrop-blur`, each tab `flex flex-1 flex-col items-center gap-1 py-2 text-xs` with selected `text-accent`.

- [ ] **Step 8: DataTable**

Test: `getByRole("table", { name: caption })`; headers render; a `current` row has `aria-current="true"`. Implementation: `<table>` with a visually-hidden `<caption className="sr-only">`, `th` `px-2 py-2 text-xs font-normal text-tertiary`, `td` `border-t border-white/5 px-2 py-2 text-sm`, current row `bg-dark text-primary`, `text-right` per column `align`.

- [ ] **Step 9: index.ts, verify, commit**

`src/next/ui/index.ts` re-exports every component as named exports (`export { default as Card } from "./Card";` …). Run lint, typecheck, all tests, build. Docs: DESIGN_SYSTEM gains a short "§12 The /next kit (redesign in progress)" listing each component and its class recipe. Commit: "Add the component kit for the /next redesign".

---

### Task 3: Shell (header, feedback button, footer)

After Task 2, in parallel with Tasks 4–6.

**Files:** Replace `src/next/shell/NextShell.tsx`; create `src/next/shell/NextHeader.tsx`, `CharacterChip.tsx`, `AccessibilityButton.tsx`, `FeedbackButton.tsx`, `ComingSoonNote.tsx`, `NextFooter.tsx`, `NextServerMenu.tsx`, and tests `NextHeader.test.tsx`, `FeedbackButton.test.tsx`, `NextShell.test.tsx`.

**Interfaces:**
- Consumes: kit (`Sheet`), `nextHref`, `useNextRoute`, `useMessages().next.shell`, `useMessages().shell` (nav, serverMenu, siteVersion, numbersFrom…), `NAV` and `pageMetaFor` from src/lib/routes.ts, `EDITIONS`, `useAppStore` region/regionOverride/setRegion, `SuggestionBanner` from src/components (reused as-is).
- Produces: `NextShell({ children })` renders header, the banner, `<main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-24 md:px-8 md:pb-16">`, the floating Feedback button and the footer.

- [ ] **Step 1: Tests first**

```tsx
// NextHeader.test.tsx (renders inside RouterProvider + BreakpointProvider at "/next/handbook")
it("links every page inside /next and marks the current one", () => {
  // desktop viewport
  expect(screen.getByRole("link", { name: "Calculator" })).toHaveAttribute("href", "/next");
  expect(screen.getByRole("link", { name: "Handbook" })).toHaveAttribute("aria-current", "page");
});
it("has the character chip, the server menu and the text-and-contrast button on desktop", () => {
  expect(screen.getByRole("button", { name: /Main/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Choose your server" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Text and contrast" })).toBeInTheDocument();
});
it("on phones keeps the character chip and moves the server and text buttons into the menu", () => {
  // mobile viewport
  expect(screen.getByRole("button", { name: /Main/ })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Text and contrast" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
  expect(screen.getByRole("button", { name: "Text and contrast" })).toBeInTheDocument();
});
it("opens a coming-soon note from the character chip", () => {
  fireEvent.click(screen.getByRole("button", { name: /Main/ }));
  expect(screen.getByRole("dialog", { name: "Choose a character" })).toHaveTextContent("Character profiles are coming in 2.0");
});
```

```tsx
// FeedbackButton.test.tsx
it("is always on screen and opens the coming-soon note", () => {
  render(<BreakpointProvider><FeedbackButton /></BreakpointProvider>);
  const button = screen.getByRole("button", { name: "Feedback" });
  expect(button.className).toMatch(/fixed/);
  fireEvent.click(button);
  expect(screen.getByRole("dialog", { name: "Feedback" })).toHaveTextContent("report a wrong number");
});
```

```tsx
// NextShell.test.tsx
it("wraps the page in a main landmark between the header and the footer", () => {
  expect(screen.getByRole("main")).toHaveTextContent("page");
  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
});
```

Run → FAIL.

- [ ] **Step 2: Implement**

- `ComingSoonNote({ open, onClose, title, text, anchor })`: a `Sheet` with a `<p className="text-sm text-secondary">` and the `next.shell.closeNote` label.
- `CharacterChip`: `<button aria-haspopup="dialog">` `flex items-center gap-2 rounded-lg bg-light px-3 py-2 text-sm text-secondary hover:text-primary` with a `HiOutlineUser` icon, `next.shell.characterChip` and `HiChevronDown`; opens `ComingSoonNote` titled `characterMenu` with `charactersSoon`.
- `AccessibilityButton`: `<button aria-label={accessibility}>` showing "Aa" (`font-semibold`), same chip style; opens the note with `accessibilitySoon`.
- `NextServerMenu`: the current ServerMenu's behaviour (site-version links built with `nextHref(path, edition)` so they stay in /next, and the "Numbers from" select calling `setRegion`), rendered inside a kit `Sheet` anchored to a chip showing the globe icon and `editionOf(region).name`. Copy from `useMessages().shell` (`serverMenu`, `siteVersion`, `numbersFrom`, `numbersFromPage`, `numbersFromNote`). Keep the analytics calls the current ServerMenu makes (`region_switch`, `edition_switch`).
- `NextHeader`: `<header>` `sticky top-0 z-30 border-b border-white/6 bg-linear-to-t from-card to-card-grad`; inner `mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-8`. Left: the logo text as today (`Maple <span>Symbols</span>`, link to `nextHref("/", edition)`). Centre (desktop, `!isMobile`): `NAV` links with labels from `messages.pages[page].nav` like the current Header, `aria-current="page"` on the active one (active = the route's path or its `activeFor`). Right: desktop `CharacterChip`, `NextServerMenu`, `AccessibilityButton`; phone `CharacterChip` and a menu button (`shell.openMenu`/`closeMenu`) that opens a panel under the header with the nav links, `NextServerMenu` and `AccessibilityButton`. Links navigate with the router's `navigate` (prevent default).
- `FeedbackButton`: `<button>` `fixed right-4 bottom-20 z-30 flex items-center gap-2 rounded-full border border-accent/40 bg-secondary px-4 py-2.5 text-sm text-primary shadow-[0_6px_18px_rgb(0_0_0/0.4)] hover:bg-hover md:bottom-6` with `HiOutlineChatBubbleLeftEllipsis`; on phones the label is visually hidden (`sr-only`) but kept as the accessible name; opens `ComingSoonNote` titled `feedback` with `feedbackSoon`.
- `NextFooter`: the current Footer's links and copyright, restyled: `<footer>` `border-t border-white/6 py-8 text-center text-sm text-tertiary`.
- `NextShell`: `<div className="flex min-h-screen flex-col">` with `NextHeader`, `SuggestionBanner` (from src/components, unchanged), `main`, `FeedbackButton`, `NextFooter`.

- [ ] **Step 3: Verify and commit**

Run the three tests, then lint, typecheck, all tests, build. Add the shell to src/test/interactiveNesting.test.tsx (render `/next` at desktop and mobile). Commit: "Add the /next shell with the character, server and feedback places".

---

### Task 4: Calculator page (picker, calculator card, tools, layout)

After Task 2, parallel with 3, 5, 6. Imports `OverviewCard` and `GraphCard` from Task 5 by path; until Task 5 lands, create them as `const OverviewCard = () => null` in this worktree only if they are missing, and delete those stubs when merging.

**Files:** Replace `src/next/pages/CalculatorPage.tsx`; create `src/next/calculator/SymbolPicker.tsx`, `CalculatorCard.tsx`, `useSymbolEditor.ts`, `QuestRow.tsx`, `ToolsSheet.tsx`, tests `SymbolPicker.test.tsx`, `CalculatorCard.test.tsx`, `useSymbolEditor.test.ts`, `ToolsSheet.test.tsx`, `CalculatorPage.test.tsx`.

**Interfaces:**
- Consumes: kit; store (`mode`, `setMode`, `selectSymbol`, `symbols`, `setSymbols`, `selectedId`, `region`); `useSelectedSymbol`; src/lib: `updateSymbol`, `getDailySymbols`, `calculateDaysRemaining`, `isMaxLevel`, `isValid`, `getOverflow`, `levelInputPatch`, `experienceInputValue`, `expCapFor`, `maxLevelFor`, `MAIN_STAT_PER_LEVEL`, `EXTRA_MULTIPLIER`, `CATALYST_RETENTION`, `MAX_POWER_PER_SYMBOL`, `inFamily`, `selectorWorksOn`, `selectorPreview`, `catalystPreview`, `formatPreview`, `getRemainingToMax`, `clampNumberInput`, `gameToday`, `weeklySymbolsFor`, `isPublished`, `mesosKind`, `REGION_PROFILES`, `formatMesos`; `usePower`; `track`/`trackOnce`; `symbolNames`, `useNameSet`, `useLocale`, `useMessages`.
- Produces: `CalculatorPage` (no props), `useSymbolEditor(): SymbolEditor`:

```ts
export interface SymbolEditor {
  symbol: SymbolData;
  nextExperience: number;       // symbolsRequired[level] (undefined past max → NaN)
  readyForUpgrade: boolean;
  dailySymbols: number;         // getDailySymbols(symbol)
  weeklySymbols: number;        // weeklySymbolsFor(region) when symbol.weekly, else 0
  daysToNextLevel: number;      // calculateDaysRemaining(...) or NaN on error
  setLevel: (raw: string) => void;
  setExperience: (raw: string) => void;
  toggle: (quest: "daily" | "weekly" | "extra") => void;
  unlockCap: () => void;        // locked → false (track "cap_unlocked")
  lockCap: () => void;
  applyOverflow: () => void;    // level/experience from getOverflow, locked true
}
```

- [ ] **Step 1: useSymbolEditor — tests first**

```ts
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSymbolEditor } from "./useSymbolEditor";
import { useAppStore } from "../../state/store";
import { seedSymbol } from "../../test/helpers";

describe("useSymbolEditor (the calculator card's rules, ported from src/components/Calculator)", () => {
  it("sets the level with the same clamping as today and caps experience at the next level while locked", () => {
    seedSymbol(1, { level: 5, experience: 0 });
    const { result } = renderHook(() => useSymbolEditor());
    act(() => result.current.setLevel("0"));
    expect(result.current.symbol.level).toBe(1);
    act(() => result.current.setLevel("12"));
    act(() => result.current.setExperience("9999"));
    expect(result.current.symbol.experience).toBe(result.current.nextExperience);
    expect(result.current.readyForUpgrade).toBe(true);
  });

  it("toggles quests and derives the day's symbols", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: false });
    const { result } = renderHook(() => useSymbolEditor());
    act(() => result.current.toggle("daily"));
    expect(result.current.dailySymbols).toBe(20);
    act(() => result.current.toggle("extra"));
    expect(result.current.dailySymbols).toBe(40);
  });

  it("unlocks the cap, and applying overflow turns spare experience into levels and relocks", () => {
    seedSymbol(1, { level: 1, experience: 12 });
    const { result } = renderHook(() => useSymbolEditor());
    act(() => result.current.unlockCap());
    act(() => result.current.setExperience("30"));
    act(() => result.current.applyOverflow());
    expect(result.current.symbol.level).toBe(3);
    expect(result.current.symbol.experience).toBe(3); // arcaneExpRequired: 12 (1→2) + 15 (2→3); 30 - 27 = 3
    expect(result.current.symbol.locked).toBe(true);
  });

  it("relocks a maxed symbol with no experience (the current Calculator's effect)", () => {
    seedSymbol(1, { level: 20, experience: 0, locked: false });
    renderHook(() => useSymbolEditor());
    expect(useAppStore.getState().symbols.find((s) => s.id === 1)!.locked).toBe(true);
  });
});
```


- [ ] **Step 2: Implement useSymbolEditor**

Port, do not reinvent: the body mirrors `src/components/Calculator/Calculator.tsx` lines 38–103 (declarations, `dailySymbols`, `daysToNextLevel` memo, `getOverflow` memo, the two effects with the same guards and the same deliberately curated dependency lists, AGENTS gotcha 6) and the handlers at lines 134–146 (level: `trackOnce("symbol_input:level", …)` then `levelInputPatch(raw, maxLevelFor(symbol.type))`), 241–259 (experience: `trackOnce("symbol_input:experience", …)`, `experienceInputValue(raw, level, expCapFor(symbol))`, null → store nothing), 169–224 (unlock/lock/apply overflow with `track("cap_unlocked")`), 277–338 (`track("quest_toggle", { quest, state })` then flip the field). Every write is `setSymbols(updateSymbol(useAppStore.getState().symbols, selectedId, patch))`. Run the hook tests → PASS.

- [ ] **Step 3: SymbolPicker — tests first**

```tsx
it("switches families, lists that family's symbols as chips with rings, and shows the power total", () => {
  // seed VJ level 12; render SymbolPicker inside BreakpointProvider
  expect(screen.getByRole("radiogroup", { name: "Symbol family" })).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: /level/ })).toHaveLength(6);
  expect(screen.getByRole("img", { name: "Vanishing Journey, level 12 of 20" })).toBeInTheDocument();
  expect(screen.getByText(/Arcane Power/)).toHaveTextContent("Arcane Power: 140 / 1,320");
  fireEvent.click(screen.getByRole("radio", { name: "Grand" }));
  expect(screen.getAllByRole("button", { name: /level/ })).toHaveLength(2);
  expect(useAppStore.getState().selectedId).toBe(13);
});
it("marks the selected chip and selects on click", () => {
  fireEvent.click(screen.getByRole("button", { name: /Chu Chu Island/ }));
  expect(useAppStore.getState().selectedId).toBe(2);
  expect(screen.getByRole("button", { name: /Chu Chu Island/ })).toHaveAttribute("aria-pressed", "true");
});
it("shows an unset symbol with an empty ring and a dash", () => {
  expect(screen.getByRole("img", { name: /Esfera, level 0 of 20/ })).toHaveAttribute("data-fraction", "0");
});
```

(12 × 10 + 20 = 140 for one Arcane symbol at level 12; the family max is 6 × 220 = 1,320.)

Implementation: `Card label={next.calculator.pickerLabel}`; `SegmentedSwitch` with options arcane `{shell.arcane}`, sacred `{shell.sacred}`, grand `{next.calculator.familyGrand}`, value `mode`, onChange `setMode` (+ `track("mode_switch", { to })` as the current Selector does); a `grid grid-cols-6 gap-2` (Sacred+Grand tab on the Sacred family shows only `symbol.type === mode`; the Grand tab shows the two Grand symbols); each chip a `<button aria-pressed={selected} aria-label={next.calculator.symbolLevel}>` `flex flex-col items-center gap-1 rounded-xl p-2 transition-colors motion-reduce:transition-none` (selected `bg-secondary shadow-[inset_0_0_0_1px_var(--color-accent)]`, else `hover:bg-light`) containing `ProgressRing value={level} max={maxLevelFor(type)} size={44}` around the symbol `<img width={30}>` and a caption (`maxShort` at max, "–" when unset, else the level). Below: `<p>` with `Message text={next.calculator.familyPower}` values `{ power: graph.power[mode === "grand" ? "sacred" : mode], value: usePower(symbols, familyForPower), max: sum of MAX_POWER_PER_SYMBOL[s.type] over symbols inFamily }, `value` and `max` through `formatNumber(n, locale)`` where `familyForPower` is `"sacred"` on the Grand tab.

- [ ] **Step 4: CalculatorCard and QuestRow — tests first**

```tsx
it("edits level and experience and shows the experience bar", () => {
  seedSymbol(1, { level: 12, experience: 40 });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Level" }), { target: { value: "13" } });
  expect(useAppStore.getState().symbols[0].level).toBe(13);
  expect(screen.getByRole("progressbar", { name: /Experience/ })).toBeInTheDocument();
});
it("has one switch per quest the symbol has, with its rate", () => {
  seedSymbol(1, { level: 12, experience: 40, daily: true });
  expect(screen.getByRole("switch", { name: "Daily" })).toHaveAttribute("aria-checked", "true");
  expect(screen.getByText("20 / day")).toBeInTheDocument();
  expect(screen.getByRole("switch", { name: "Weekly" })).toBeInTheDocument();
  expect(screen.getByRole("switch", { name: /Extra/ })).toBeInTheDocument();
});
it("gives a Grand Sacred symbol no weekly, extra, main stat or Catalyst", () => {
  seedSymbol(14, { level: 3, experience: 0, daily: true });
  expect(screen.queryByRole("switch", { name: "Weekly" })).not.toBeInTheDocument();
  expect(screen.queryByRole("switch", { name: /Extra/ })).not.toBeInTheDocument();
  expect(screen.queryByText("Main stat")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Catalyst/ })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Selector/ })).not.toBeInTheDocument(); // Geardock
});
it("shows the unset state for a symbol with no level", () => {
  seedSymbol(1, { level: NaN, experience: NaN });
  expect(screen.getByText("enter a level to enable this symbol")).toBeInTheDocument();
});
it("shows the next level's day count and cost", () => {
  seedSymbol(1, { level: 12, experience: 40, daily: true });
  expect(screen.getByText(/In \d+ days?/)).toBeInTheDocument();
  expect(screen.getByText("Cost")).toBeInTheDocument();
});
```

Implementation (`CalculatorCard`, using `useSymbolEditor`): `Card label={next.calculator.calculatorLabel}`. Title row: symbol `<img width={32}>` and `<h2 className="text-base font-semibold text-primary">` with the symbol's name. Inputs row: `NumberField` level (`calculator.levelPlaceholder`), `NumberField` experience (`calculator.experiencePlaceholder`), `<span className="text-sm text-tertiary">` `next.calculator.expOf` with `nextExperience`; the lock/unlock and apply-overflow controls from the current Calculator as small icon buttons with the same labels (`calculator.unlockCap`, `lockCap`, `applyOverflow`) and the same visibility rules; `ProgressBar value={experience} max={nextExperience} label={calculator.experiencePlaceholder}`. Quest rows (`QuestRow({ label, rate, checked, onChange, tooltip })`: `flex items-center justify-between gap-3 py-2` with the label (`text-sm text-secondary`), the rate (`text-xs text-tertiary`) and a `Switch`): Daily always (rate `perDay` with `getDailySymbols` of the symbol as if daily were on, i.e. `symbol.dailySymbols * (symbol.extra ? EXTRA_MULTIPLIER[type] ?? 1 : 1)`), Weekly when `symbol.weeklyName` exists (rate `perWeek` with `weeklySymbolsFor(region)`), Extra when `symbol.extraName` exists (label `extraQuest` with the extra region's name, rate `extraFactor` with `EXTRA_MULTIPLIER[type]`). Keep each row's current tooltip (`calculator.dailyTooltip` etc. with the quest name) on the label. Next level: when `isValid(level)` and not max, two `StatBox`es in a `grid grid-cols-2 gap-2`: `nextLevel` with `readyNow` / `inDays` (pluralMessage, count `daysToNextLevel`) / `notSet` (experience NaN or no quest), and `cost` with `formatMesos(mesosRequired[level], locale)` or, when `!isPublished(region, mesosKind(type))`, `calculator.mesosUnpublished`; a third `StatBox` `mainStat` with `+{MAIN_STAT_PER_LEVEL[type]}` and the Demon Avenger/Xenon tooltip from the current Calculator, only when `MAIN_STAT_PER_LEVEL[type]` is not null. At max: `calculator.maxLevel` in accent. Unset: `calculator.disabled` and `calculator.disabledHint`. Bottom: `toolsLabel` label and two buttons (`tools.symbolSelector` shown when `selectorWorksOn(symbol)`, the family's Catalyst name shown when `CATALYST_RETENTION[type] !== null`), each opening `ToolsSheet` anchored to itself.

- [ ] **Step 5: ToolsSheet — tests first**

```tsx
// renderCard = setViewport("desktop") then render(<BreakpointProvider><CalculatorCard /></BreakpointProvider>)
const openTool = (name: RegExp) => {
  const opener = screen.getByRole("button", { name });
  opener.focus();
  fireEvent.click(opener);
  return opener;
};

it("previews and applies Symbol Selector coupons (the Tools.test.tsx case)", () => {
  seedSymbol(1, { level: 1, experience: 0 });
  renderCard();
  openTool(/Symbol Selector/);
  fireEvent.change(screen.getByRole("spinbutton", { name: "Count" }), { target: { value: "30" } });
  expect(screen.getByText("3 / 3")).toBeInTheDocument(); // 12 + 15 = 27 → level 3 with 3 left
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(useAppStore.getState().symbols[0]).toMatchObject({ level: 3, experience: 3 });
});
it("previews the Catalyst's kept level", () => {
  seedSymbol(1, { level: 5, experience: 0 });
  renderCard();
  openTool(/Arcane Catalyst/);
  expect(screen.getByText("4 / 13")).toBeInTheDocument(); // 74 invested × 0.8 = 59.2 → level 4, 13 exp
  expect(screen.getByText("-20% EXP upon use")).toBeInTheDocument();
});
it("closes with Escape and returns focus to its button", () => {
  seedSymbol(1, { level: 5, experience: 0 });
  renderCard();
  const opener = openTool(/Arcane Catalyst/);
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(document.activeElement).toBe(opener);
});
```

Implementation: `ToolsSheet({ tool: "selector" | "catalyst"; open; onClose; anchor })` wraps kit `Sheet` (title `tools.symbolSelector` or the Catalyst name). Selector: a `NumberField` (`tools.countPlaceholder`, clamped with `clampNumberInput(raw, getRemainingToMax(symbol, maxLevelFor(type)))`, NaN when experience is unset), the before → after row using `formatPreview` exactly as `src/components/Calculator/Tools.tsx:44-66`, and an Apply button with the same enable rule and the same `updateSymbol` patch and `track("tool_used", { tool: "selector", action: "apply" })` as `Tools.tsx:230-245`. Catalyst: the preview with `catalystPreview(symbol, CATALYST_RETENTION[type]!)`, the loss line (`tools.arcaneExpLoss`/`sacredExpLoss`), the level-2 rule (`tools.catalystLevelTooLow`), and the world tag rule (`REGION_PROFILES[region].catalystRegularWorldOnly` → `tools.catalystWorldTag`). Opening a tool tracks `tool_used` with `action: "preview"` as today.

- [ ] **Step 6: CalculatorPage layout — tests first**

```tsx
// CalculatorPage.test.tsx: import { renderNextAt as renderAt } from "../testing";
it("reads the same saved levels as the current interface", () => {
  seedSymbol(1, { level: 12, experience: 40 });
  setViewport("desktop"); renderAt("/next");
  expect(screen.getByRole("spinbutton", { name: "Level" })).toHaveValue(12);
});
it("on desktop shows the edit column and the results column together", () => {
  setViewport("desktop"); renderAt("/next");
  expect(screen.getByRole("region", { name: "Symbols" })).toBeVisible();
  expect(screen.getByRole("region", { name: "Overview" })).toBeInTheDocument();
  expect(screen.queryByRole("tablist", { name: "Calculator sections" })).not.toBeInTheDocument();
});
it("on phones switches Edit, Overview and Graph with the bottom tabs, keeping all three in the page", () => {
  setViewport("mobile"); renderAt("/next");
  const tabs = screen.getByRole("tablist", { name: "Calculator sections" });
  expect(within(tabs).getByRole("tab", { name: "Edit" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tabpanel", { name: "Overview", hidden: true })).toHaveAttribute("hidden");
  fireEvent.click(within(tabs).getByRole("tab", { name: "Overview" }));
  expect(screen.getByRole("tabpanel", { name: "Overview" })).not.toHaveAttribute("hidden");
});
it("uses no fixed width wider than a phone", () => {
  setViewport("mobile"); const { container } = renderAt("/next");
  for (const el of container.querySelectorAll("[class*='w-[']")) {
    const px = Number(/w-\[(\d+)px\]/.exec(el.className)?.[1] ?? 0);
    expect(px).toBeLessThanOrEqual(360);
  }
});
```

Implementation: desktop/tablet (`!isMobile`): `<div className="grid gap-6 pt-8 min-[768px]:grid-cols-[minmax(320px,400px)_1fr]">` with the left column `flex flex-col gap-6 min-[1150px]:sticky min-[1150px]:top-24 min-[1150px]:self-start` (SymbolPicker, CalculatorCard) and the right column `flex flex-col gap-6` (OverviewCard, GraphCard). Phones: three `div role="tabpanel" id="calc-panel-edit|overview|graph" aria-labelledby="calc-tab-…" hidden={tab !== …}` holding the same cards (`edit`: picker + calculator; `overview`; `graph`), and a `BottomTabBar label={next.calculator.sections} idPrefix="calc"` with icons (`HiOutlinePencilSquare`, `HiOutlineTableCells`, `HiOutlineChartBar`). The tab state is local (`useState<"edit" | "overview" | "graph">("edit")`) and resets on reload.

- [ ] **Step 7: Verify and commit**

Run all Task 4 tests, add `/next` to src/test/interactiveNesting.test.tsx (desktop and mobile), then lint, typecheck, all tests, build. Commit: "Build the /next calculator page: picker, calculator card and tools".

---

### Task 5: Overview and Graph cards

After Task 2, parallel with 3, 4, 6.

**Files:** Create `src/next/calculator/OverviewCard.tsx`, `GraphCard.tsx`, `allMaxedOn.ts`, tests `OverviewCard.test.tsx`, `GraphCard.test.tsx`, `allMaxedOn.test.ts`.

**Interfaces:**
- Consumes: kit (`Card`, `DataTable`, `ProgressBar`, `NumberField`, `StatBox`, `SegmentedSwitch`); src/lib/overview.ts `collapsedRowLabels`, `targetPanelLabels`, `BLANK`; src/lib/calculator.ts `progressToMax`; src/lib/graph.ts `buildDateSymbols`, `buildGraphSeries`, `dateToPower`, `yAxisTicks`, `xAxisTicks`; `usePower`, `inFamily`, `MAX_POWER_PER_SYMBOL`, `formatDay`, `gameToday`, store (`symbols`, `mode`, `selectedId`, `region`, `selectSymbol`), `useMessages().overview/graph/next`.
- Produces: `OverviewCard` and `GraphCard` (no props); `allMaxedOn(symbols: SymbolData[], family: SymbolType, now: Dayjs, region: Region): string | null` — the latest completion day (YYYY-MM-DD) among the family's symbols that are not maxed, or null when any of them has no computable date.

- [ ] **Step 1: allMaxedOn — tests first**

```ts
import { describe, expect, it } from "vitest";
import { allMaxedOn } from "./allMaxedOn";
import { createInitialSymbols } from "../../lib/data";
import { dayjs } from "../../lib/dayjs";
import { WED } from "../../test/helpers";

const NOW = dayjs(WED);
const arcane = () => createInitialSymbols().filter((s) => s.type === "arcane");

describe("allMaxedOn", () => {
  it("is the latest completion day of the family", () => {
    const symbols = arcane().map((s) => ({ ...s, level: 20, experience: 0 }));
    symbols[0] = { ...symbols[0], level: 5, experience: 0, daily: true };
    expect(allMaxedOn(symbols, "arcane", NOW, "gms")).toBe("2027-01-25"); // Overview.test's 131-day case
  });
  it("is null while any symbol of the family cannot be dated", () => {
    expect(allMaxedOn(arcane(), "arcane", NOW, "gms")).toBeNull();
  });
});
```

Implementation: over `symbols.filter((s) => inFamily(s.type, family))`, skip maxed (`isMaxLevel`), and for each call `progressToMax(s, now, region).completion`; return null if any is `"Invalid Date"`, a non-finite day count, or a symbol has no level/quest; otherwise the maximum string (ISO days sort lexically).

- [ ] **Step 2: OverviewCard — tests first**

```tsx
it("lists the family's symbols with target, done-by date, symbols left and a bar each", () => {
  vi.setSystemTime(WED);
  seedSymbol(1, { level: 5, experience: 0, daily: true });
  render(<OverviewCard />);
  expect(screen.getByRole("table", { name: "Overview" })).toBeInTheDocument();
  expect(screen.getByRole("row", { name: /Vanishing Journey/ })).toHaveTextContent("2027-01-25");
  expect(screen.getByRole("progressbar", { name: /Vanishing Journey/ })).toBeInTheDocument();
});
it("highlights the selected symbol's row and selects a symbol from its row", () => {
  render(<OverviewCard />);
  fireEvent.click(screen.getByRole("button", { name: "Chu Chu Island" }));
  expect(useAppStore.getState().selectedId).toBe(2);
});
it("closes with the all-maxed line once every symbol can be dated, and asks for input before", () => {
  vi.setSystemTime(WED);
  render(<OverviewCard />);
  expect(screen.getByText(/Enter each symbol's level and quests/)).toBeInTheDocument();
  cleanup();
  for (const id of [2, 3, 4, 5, 6]) seedSymbol(id, { level: 20, experience: 0 }, false);
  seedSymbol(1, { level: 5, experience: 0, daily: true });
  render(<OverviewCard />);
  expect(screen.getByText(/All maxed on/)).toHaveTextContent("All maxed on 2027-01-25");
});
it("keeps the custom target level box for the selected symbol (the Overview.test.tsx case)", () => {
  vi.setSystemTime(WED);
  seedSymbol(1, { level: 5, experience: 0, daily: true });
  render(<OverviewCard />);
  fireEvent.change(screen.getByRole("spinbutton", { name: "Target Level" }), { target: { value: "6" } });
  expect(screen.getByText("2026-09-18")).toBeInTheDocument(); // 36 symbols at 20/day → 2 days
});
```

Implementation: `Card label={next.overview.label} as="section"`; `DataTable` caption `next.overview.label`, columns from `overview` area headers (the current Overview's column copy), rows for `symbols.filter(s => s.type === mode)` (Grand tab lists the Grand symbols); each row's first cell a `<button>` with the icon and name (selects the symbol) and a `ProgressBar` (value = cumulative experience invested, max = the family's total symbols to max; label `next.overview.toMax`), then `collapsedRowLabels(symbol, maxLevelFor(symbol.type), m, today, region, locale)` target/completion/remaining; `current` on the selected row. Target-level box (a `NumberField` labelled `overview.targetLevel`, "Target Level"): port the current Overview's target input and `targetPanelLabels` panel (src/components/Calculator/Overview.tsx:40-80 and its expanded row), shown under the table for the selected symbol. Footer line: `Message text={next.overview.allMaxedOn}` with `formatDay(date, locale)`, or `allMaxedUnknown`.

- [ ] **Step 3: GraphCard — tests first**

```tsx
it("shows the current and target power and the spacing switch", () => {
  seedSymbol(1, { level: 5, experience: 0, daily: true });
  expect(screen.getByText("Now")).toBeInTheDocument();
  expect(screen.getByRole("spinbutton", { name: "Target" })).toBeInTheDocument();
  expect(screen.getByRole("radiogroup", { name: "X-axis spacing" })).toBeInTheDocument();
});
it("answers a target power with its day", () => {
  fireEvent.change(screen.getByRole("spinbutton", { name: "Target" }), { target: { value: "100" } });
  expect(screen.getByText(/by/)).toHaveTextContent(/\d{4}-\d{2}-\d{2}/);
});
```

Implementation: port `src/components/Calculator/Graph.tsx`'s data (the `dateSymbols`, `buildGraphSeries`, ticks and `dateToPower` memos, lines 157–217, with `mode` → the power family: `"sacred"` on the Grand tab) and draw with Recharts `AreaChart` inside `ResponsiveContainer`: `<defs><linearGradient id="next-power-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b18bd0" stopOpacity={0.35} /><stop offset="100%" stopColor="#b18bd0" stopOpacity={0} /></linearGradient></defs>`, `<Area type="linear" dataKey="power" stroke="#b18bd0" strokeWidth={2} fill="url(#next-power-fill)" dot={{ r: 2.5, fill: "#b18bd0" }} isAnimationActive={false} />`, axes in `#8c8c8c` (DESIGN_SYSTEM §3 allows these raw strings for Recharts), `<ReferenceLine y={targetPower} stroke="#bfbfbf" strokeDasharray="4 4" />` and `<ReferenceLine x={attainmentDate} stroke="#b18bd0" strokeDasharray="3 4" />` when the target is set and reachable, and the current Graph's custom tooltip content. Above the chart: `StatBox` `next.graph.now` with the power, `StatBox` `next.graph.target` with a `NumberField` (`graph.targetPlaceholder`) and `next.graph.reachedBy` (`formatDay`) or the current Graph's error copy (`graph.enterTarget`, `targetTooLow`, `targetMustBeGreater`); `SegmentedSwitch label={graph.xAxisSpacing}` with `graph.dynamic`/`graph.linear`.

- [ ] **Step 4: Verify and commit**

Run the three test files, then lint, typecheck, all tests, build. Commit: "Build the /next Overview and Graph cards".

---

### Task 6: Handbook and Extras pages

After Task 2, parallel with 3, 4, 5.

**Files:** Replace `src/next/pages/HandbookPage.tsx`, `src/next/pages/ExtrasPage.tsx`; create `src/next/handbook/ExpPanel.tsx`, `CostPanel.tsx`, `RatioPanel.tsx`, `src/next/extras/ChangelogPanel.tsx`, `CreditsPanel.tsx`, tests `HandbookPage.test.tsx`, `ExtrasPage.test.tsx`.

**Interfaces:**
- Consumes: kit (`Card`, `Tabs`, `SegmentedSwitch`, `DataTable`); store (`mode`, `setMode`, `useSelectedSymbol`, `region`); the current tables' data logic (src/components/Handbook/ExpTable.tsx, CostTable.tsx, RatioTable.tsx; src/components/Extras/Changelog.tsx, Credits.tsx); `ratioData`, `changelogEntries`, `formatDate`, `formatNumber`, `isPublished`, `mesosKind`; `nextHref`, the router's `navigate`; `useMessages().handbook/extras/next`.
- Produces: `HandbookPage`, `ExtrasPage` (no props).

- [ ] **Step 1: Tests first**

```tsx
it("switches Experience, Meso cost and Damage ratio with tabs, each with the family switch", () => {
  renderAt("/next/handbook");
  const tabs = screen.getByRole("tablist", { name: "Handbook" });
  expect(within(tabs).getByRole("tab", { name: "Experience Table" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("radiogroup", { name: "Symbol family" })).toBeInTheDocument();
  fireEvent.click(within(tabs).getByRole("tab", { name: "Meso Cost Table" }));
  expect(screen.getByRole("table", { name: /Meso/ })).toBeInTheDocument();
});
it("highlights the selected symbol's current level", () => {
  seedSymbol(1, { level: 12, experience: 0 });
  renderAt("/next/handbook");
  expect(screen.getByRole("row", { current: true })).toHaveTextContent("12");
});
it("shows Grand Sacred on the Sacred EXP table and with their own costs", () => {
  renderAt("/next/handbook");
  fireEvent.click(screen.getByRole("radio", { name: "Grand" }));
  expect(screen.getByRole("table")).toHaveTextContent("1,100"); // 10 → 11 on the Sacred table
});
it("has no fixed height: the card grows with its table", () => {
  const { container } = renderAt("/next/handbook");
  expect(container.innerHTML).not.toMatch(/h-\[(650|700|535|555)px\]/);
});
// ExtrasPage.test.tsx
it("switches Changelog and Credits with tabs and updates the URL inside /next", () => {
  renderAt("/next/changelog");
  fireEvent.click(screen.getByRole("tab", { name: "Credits" }));
  expect(window.location.pathname).toBe("/next/credits");
});
it("shows the newest changelog entry first, with its date", () => {
  renderAt("/next/changelog");
  const newest = changelogEntries[changelogEntries.length - 1]; // the newest entry is last in changelog.ts
  const first = screen.getAllByRole("heading", { level: 3 })[0];
  expect(first).toHaveTextContent(newest.version);
  expect(screen.getAllByRole("time")[0]).toHaveAttribute("datetime", newest.date);
});
```

Both test files import `{ renderNextAt as renderAt }` from "../testing" (and `changelogEntries` from src/lib/changelog.ts). Tab labels come from `handbook.tabs.*.label` (and `mobileLabel` on phones), `extras.changelogTab`/`creditsTab`.

- [ ] **Step 2: Implement**

HandbookPage: `Card label={next.handbook.label} as="section" className="mx-auto mt-8 max-w-[860px]"` with `Tabs label={next.handbook.label} idPrefix="hb"` (value local state, default `"exp"`), and one `div role="tabpanel" id="hb-panel-…" aria-labelledby="hb-tab-…"` holding the active panel. Each panel starts with a row: the family heading (`handbook.symbolsHeading[family]` or the power heading for ratios) and `SegmentedSwitch label={next.calculator.familyLabel}` bound to the store's `mode`/`setMode`. ExpPanel: the current ExpTable's rows as a `DataTable` (level, symbols required, total), `current` on the selected symbol's level, Grand using the Sacred table. CostPanel: the current CostTable's per-symbol costs for the selected symbol (a symbol picker row of small buttons for the family's symbols, like today), the unpublished-costs message when `!isPublished(region, mesosKind(type))`, and the total row. RatioPanel: the current RatioTable's data with the `handbook.regionName[family]` heading and tooltips, Grand using the Sacred ratios. No fixed heights; the card grows.

ExtrasPage: the same Card + Tabs pattern with `ChangelogPanel` (versions as a vertical list on desktop and a `SegmentedSwitch`-like select on phones, newest first, the entry's notes from `useMessages().changelog[version]`, `<time dateTime>` with `formatDate(date, locale)`, the PR link with `extras.pullRequestLink`) and `CreditsPanel` (the current Credits content, restyled with the kit). Switching tabs navigates to `nextHref("/changelog" | "/credits", edition)`.

- [ ] **Step 3: Verify and commit**

Run the page tests, then lint, typecheck, all tests, build. Commit: "Build the /next Handbook and Extras pages".

---

### Task 7: Integration, screenshots, docs

Sequential, after Tasks 3–6 are merged into `v2` (the controller merges each branch, resolving only the Task 4 stubs of Task 5's cards, if any).

**Files:** Modify `docs/DESIGN_SYSTEM.md` (§12 the /next kit and page layouts), `docs/ARCHITECTURE.md` (§2 /next, §9 checklist "adopting /next"), `docs/V2_PLAN.md` (progress line), `AGENTS.md` (map: `next/` line), `docs/TESTING.md` (the /next tests); no product code unless a check fails.

- [ ] **Step 1: Full checks**

Run: `pnpm lint && pnpm typecheck && pnpm exec vitest run --maxWorkers=4 && pnpm build`. Expected: all PASS. Then `SERVE_DRAFTS=1 pnpm build && pnpm preview` and confirm `/next`, `/next/handbook`, `/kms/next` render, and that `dist/next.html` does not exist (never prebuilt).

- [ ] **Step 2: Screenshots**

With the dev server, Playwright screenshots of `/` and `/next` (and `/handbook` vs `/next/handbook`) at 360×780, 768×1024, 1280×800, 1440×900, in two states: empty, and seeded (VJ level 12 exp 40 daily+weekly on; Cernium level 5; Tallahart level 3). Save under `.playwright-mcp/redesign/` (git-ignored). Check each for horizontal overflow at 360 px (`document.documentElement.scrollWidth <= 360`).

- [ ] **Step 3: Docs and commit**

Update the docs listed above. Commit: "Document the /next redesign and its checks". Push `v2`, wait for the Vercel preview, and open `/next` on it with the bypass header (`.env` `VERCEL_AUTOMATION_BYPASS_SECRET`, header `x-vercel-protection-bypass`; never print it) to confirm it serves.

---

## Execution order

1. Task 1 (foundation), then Task 2 (kit), sequentially.
2. Tasks 3, 4, 5, 6 in parallel, each in its own worktree from `v2` after Task 2 is merged.
3. Merge 3–6 into `v2`, then Task 7.
