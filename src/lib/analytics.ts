// ---------------------------------------------------------------------------
// analytics.ts — The one door to Umami (docs/ANALYTICS.md).
//
// Every custom event the app sends is named in `EventData` below, with the exact
// shape of its data, so a typo or an unplanned event fails the type check instead
// of quietly polluting the dashboard. Components import `track` / `trackOnce`;
// nothing else touches `window.umami` (a test enforces that).
//
// The Umami script loads with `data-domains`, so on localhost, in previews and in
// tests `window.umami` is either absent or refuses to send; every call here is a
// silent no-op in those cases and never throws into a click handler.
// ---------------------------------------------------------------------------

import type { SymbolType } from "./types";

/** Bucketed target levels (AN-4: never send the raw number). */
export type TargetBucket = "2-5" | "6-10" | "11-15" | "16-20";

/**
 * The event catalogue, name → data. Keep in step with docs/ANALYTICS.md §3: a new
 * event needs its row (and the decision it informs) in the same commit.
 * Values are strings on purpose; Umami stores HTML-attribute data as strings, and
 * one representation keeps the dashboard's filters consistent.
 */
export interface EventData {
  not_found: { path: string };
  symbol_input: { field: "level" | "experience"; mode: SymbolType };
  quest_toggle: { quest: "daily" | "weekly" | "extra"; state: "on" | "off" };
  mode_switch: { to: SymbolType };
  symbol_select: { symbol: string; mode: SymbolType };
  tool_used: { tool: "selector" | "catalyst"; action: "preview" | "apply" };
  cap_unlocked: undefined;
  overview_target: { target_level: TargetBucket };
  graph_mode: { mode: "linear" | "exponential" };
  handbook_tab: { tab: "exp" | "cost" | "ratio" };
  extras_tab: { tab: "changelog" | "credits" };
  error_shown: { route: string };
}

export type EventName = keyof EventData;

type DataArgs<E extends EventName> = EventData[E] extends undefined ? [] : [data: EventData[E]];

/** Send one custom event. Fire-and-forget: never awaited, never throws. */
export function track<E extends EventName>(name: E, ...args: DataArgs<E>): void {
  try {
    const umami = typeof window === "undefined" ? undefined : window.umami;
    if (typeof umami?.track !== "function") return;
    if (args.length) umami.track(name, args[0]);
    else umami.track(name);
  } catch {
    // Analytics must never break the app (AN-8).
  }
}

const sentThisSession = new Set<string>();

/**
 * Send an event at most once per page load for a given `key` (AN-5: `symbol_input`
 * fires once per field per session, not per keystroke). A module-level set is enough:
 * a reload is a new session, and client-side navigation keeps the same module.
 */
export function trackOnce<E extends EventName>(key: string, name: E, ...args: DataArgs<E>): void {
  if (sentThisSession.has(key)) return;
  sentThisSession.add(key);
  track(name, ...args);
}

/** Test helper: forget which once-per-session events have fired. */
export function resetAnalyticsSession(): void {
  sentThisSession.clear();
}

/** Bucket a target level for `overview_target` (AN-4). Returns undefined when unset. */
export function targetBucket(level: number): TargetBucket | undefined {
  if (!Number.isFinite(level) || level < 2) return undefined;
  if (level <= 5) return "2-5";
  if (level <= 10) return "6-10";
  if (level <= 15) return "11-15";
  return "16-20";
}

/**
 * The first path segment of an unknown URL for `not_found`, so `/foo/bar?x=1` and
 * `/foo/baz` count together (AN-4). Capped at Umami's 50-character name-safe length.
 */
export function notFoundPath(pathname: string): string {
  const first = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean)[0] ?? "";
  return `/${first}`.slice(0, 50);
}
