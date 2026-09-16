// ---------------------------------------------------------------------------
// setup.ts — runs before every test file (see vitest.config.ts setupFiles).
// Wiring only; reusable helpers live in ./helpers.ts.
// ---------------------------------------------------------------------------

import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { getViewport, resetStore, resetViewport } from "./helpers";

// BreakpointContext calls window.matchMedia, which jsdom does not implement.
// Nothing matches by default (= desktop). Tests call setViewport("mobile" | "tablet")
// from ./helpers BEFORE rendering a <BreakpointProvider>; only the initial read matters.
const queryMatches = (query: string) =>
  (query === "(max-width: 767px)" && getViewport() === "mobile") ||
  (query === "(max-width: 1149px)" && getViewport() !== "desktop");

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: vi.fn((query: string) => ({
    matches: queryMatches(query),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// recharts constructs `new ResizeObserver` unguarded (ResponsiveContainer).
// floating-ui guards its observers itself, so tooltips need nothing.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverStub);

afterEach(() => {
  cleanup(); // RTL only auto-registers this when `afterEach` is a global; we don't use globals.
  vi.useRealTimers(); // also undoes vi.setSystemTime
  resetViewport();
  resetStore(); // writes to localStorage through the persist middleware…
  window.localStorage.clear(); // …so clear storage afterwards, not before.
  document.head.querySelector("script[data-seo-ld]")?.remove(); // SEO.tsx leaks this otherwise
  window.history.replaceState(null, "", "/");
});
