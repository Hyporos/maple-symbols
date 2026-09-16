// ---------------------------------------------------------------------------
// helpers.ts — shared test utilities. Import what you need from "../test/helpers".
// ---------------------------------------------------------------------------

import { useAppStore } from "../state/store";
import { createInitialSymbols } from "../lib/data";
import type { SymbolData } from "../lib/types";

// ── Viewport (drives the matchMedia mock in setup.ts) ─────────────────────
export type Viewport = "desktop" | "tablet" | "mobile";
let viewport: Viewport = "desktop";
export const getViewport = () => viewport;
/** Call BEFORE rendering a <BreakpointProvider>; the mock is read once on mount. */
export const setViewport = (v: Viewport) => {
  viewport = v;
};
export const resetViewport = () => {
  viewport = "desktop";
};

// ── Store ─────────────────────────────────────────────────────────────────
/** Restore the store to a pristine state (actions included, so replace=true is safe). */
export function resetStore() {
  useAppStore.setState({ ...useAppStore.getInitialState(), symbols: createInitialSymbols() }, true);
}

/** Patch one symbol by index and (optionally) select it. Returns the patched symbol. */
export function seedSymbol(index: number, patch: Partial<SymbolData>, select = true): SymbolData {
  const symbols = useAppStore
    .getState()
    .symbols.map((s, i) => (i === index ? { ...s, ...patch } : s));
  useAppStore.setState({ symbols });
  if (select) {
    // Selector's mount effect restores selectedSymbol from selectedArcane/selectedSacred,
    // so set those too or the selection is overwritten on render.
    const isSacred = symbols[index].type === "sacred";
    useAppStore.setState({
      selectedSymbol: index,
      swapped: isSacred,
      ...(isSacred ? { selectedSacred: index } : { selectedArcane: index }),
    });
  }
  return symbols[index];
}

// ── Text matching ─────────────────────────────────────────────────────────
/**
 * Matcher for text split across child elements, e.g. `<p><span>2</span> days to go</p>`.
 * Testing Library's default matcher only sees an element's direct text nodes.
 * Usage: `screen.getByText(fullText("2 days to go"))`.
 */
export const fullText = (text: string) => (_content: string, element: Element | null) =>
  element?.textContent === text &&
  !Array.from(element.children).some((child) => child.textContent === text);

// ── Time ──────────────────────────────────────────────────────────────────
// Use with vi.setSystemTime(WED). Always the local-time constructor: on a UTC-4
// machine `new Date("2026-09-16")` is Tuesday 20:00 local and shifts the Monday math.
export const SUN = new Date(2026, 8, 13, 10);
export const MON = new Date(2026, 8, 14, 10);
export const WED = new Date(2026, 8, 16, 10);
export const SAT = new Date(2026, 8, 19, 10);

// ── Document head (for SEO.tsx, whose setMeta() no-ops on missing tags) ──
const HEAD_TAGS: Array<[tag: "meta" | "link", attr: string, value: string]> = [
  ["meta", "name", "description"],
  ["meta", "property", "og:title"],
  ["meta", "property", "og:description"],
  ["meta", "property", "og:url"],
  ["meta", "property", "og:image"],
  ["meta", "property", "og:image:alt"],
  ["meta", "name", "twitter:title"],
  ["meta", "name", "twitter:description"],
  ["meta", "name", "twitter:url"],
  ["meta", "name", "twitter:image"],
  ["meta", "name", "twitter:image:alt"],
  ["link", "rel", "canonical"],
];

/** Recreate the head tags index.html ships with, so SEO.tsx has something to update. */
export function seedHeadMeta() {
  for (const [tag, attr, value] of HEAD_TAGS) {
    if (document.head.querySelector(`${tag}[${attr}="${value}"]`)) continue;
    const el = document.createElement(tag);
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
}
