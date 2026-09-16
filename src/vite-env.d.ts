/// <reference types="vite/client" />

/** Umami Cloud tracker (index.html). Absent in dev, tests and behind blockers; use src/lib/analytics.ts. */
interface Window {
  umami?: { track: (...args: unknown[]) => unknown };
}
