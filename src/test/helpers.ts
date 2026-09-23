// ---------------------------------------------------------------------------
// helpers.ts — shared test utilities. Import what you need from "../test/helpers".
// ---------------------------------------------------------------------------

import { vi } from "vitest";
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

/**
 * Patch one symbol by id (1–6 arcane, 7–12 sacred, 13–14 grand) and, by default, select it
 * (switching mode). A grand id is patched but not selected: the interface does not list it.
 */
export function seedSymbol(id: number, patch: Partial<SymbolData>, select = true): SymbolData {
  const symbols = useAppStore.getState().symbols.map((s) => (s.id === id ? { ...s, ...patch } : s));
  useAppStore.setState({ symbols });
  if (select) useAppStore.getState().selectSymbol(id);
  return symbols.find((s) => s.id === id)!;
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
// machine `new Date("2026-09-16")` is Tuesday 20:00 local and shifts the weekday maths.
export const SUN = new Date(2026, 8, 13, 10);
export const MON = new Date(2026, 8, 14, 10);
export const WED = new Date(2026, 8, 16, 10);
export const SAT = new Date(2026, 8, 19, 10);

// ── Browser language and time zone (SuggestionBanner, the local reset hint) ──
/**
 * Pretend the browser prefers `languages` and sits in `timeZone`: spies on
 * `navigator.languages` and on what `Intl.DateTimeFormat().resolvedOptions()` reports.
 * Spies, so undo with `vi.restoreAllMocks()` (the calling file's afterEach, or inline).
 * Omit `languages` to change only the zone. Formatting in an explicit zone is unaffected.
 */
export function mockBrowser({ languages, timeZone }: { languages?: string[]; timeZone?: string }) {
  if (languages) vi.spyOn(navigator, "languages", "get").mockReturnValue(languages);
  if (timeZone) {
    const resolved = Intl.DateTimeFormat.prototype.resolvedOptions;
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(function (
      this: Intl.DateTimeFormat
    ) {
      return { ...resolved.call(this), timeZone };
    });
  }
}

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

// ── Display width (SEO-6, SEO-7) ──────────────────────────────────────────
// East Asian Wide and Fullwidth code points (Unicode UAX #11), which take two columns
// in a search result: Hangul, CJK ideographs and punctuation, kana, fullwidth forms.
// Halfwidth katakana and Hangul (U+FF61–FFDC) are narrow and stay 1.
const WIDE_RANGES: readonly (readonly [number, number])[] = [
  [0x1100, 0x115f], // Hangul Jamo (leading consonants)
  [0x2e80, 0x303e], // CJK radicals, Kangxi, ideographic description, CJK symbols and punctuation
  [0x3041, 0x33ff], // Hiragana, Katakana, Bopomofo, Hangul compatibility Jamo, CJK compatibility
  [0x3400, 0x4dbf], // CJK Extension A
  [0x4e00, 0x9fff], // CJK Unified Ideographs
  [0xa000, 0xa4cf], // Yi
  [0xa960, 0xa97f], // Hangul Jamo Extended-A
  [0xac00, 0xd7a3], // Hangul syllables
  [0xf900, 0xfaff], // CJK compatibility ideographs
  [0xfe10, 0xfe19], // vertical forms
  [0xfe30, 0xfe6f], // CJK compatibility forms, small form variants
  [0xff00, 0xff60], // fullwidth ASCII and punctuation
  [0xffe0, 0xffe6], // fullwidth signs
  [0x20000, 0x3fffd], // CJK Extensions B onwards (planes 2 and 3)
];

/** Columns a string takes: 2 per East Asian wide or fullwidth character, 1 per other code point. */
export const displayWidth = (text: string): number => {
  let width = 0;
  for (const char of text) {
    const cp = char.codePointAt(0)!;
    width += WIDE_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi) ? 2 : 1;
  }
  return width;
};
