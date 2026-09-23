// ---------------------------------------------------------------------------
// routing.ts — The /next redesign's paths (docs/superpowers/specs/2026-09-23-visual-redesign-design.md).
//
// A /next segment right after the edition prefix ("/next/handbook", "/kms/next") hands the
// page to src/next/NextApp.tsx. Served by the dev server and by builds that serve drafts (every
// Vercel preview); production treats /next as an unknown page (its edition's calculator).
// ---------------------------------------------------------------------------

import { useRouter } from "../contexts/RouterContext";
import {
  routeFor,
  SERVES_DRAFTS,
  splitPath,
  type Edition,
  type Route,
  type RoutePath,
} from "../lib/routes";

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
