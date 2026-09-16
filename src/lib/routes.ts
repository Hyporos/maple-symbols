// ---------------------------------------------------------------------------
// routes.ts — The single source of truth for the site's pages.
//
// Everything that needs a path, title, description, canonical URL or sitemap
// entry reads this file: App.tsx (which page to render and its <SEO> props),
// Header (nav links), Extras (tab paths), SEO.tsx (defaults and JSON-LD), and
// the routes plugin in vite.config.ts, which fills the __PLACEHOLDER__ tokens
// in index.html and emits sitemap.xml at build time and in dev.
// Add or change a page here and nowhere else.
// ---------------------------------------------------------------------------

export const SITE_URL = "https://maplesymbols.com";
export const SITE_NAME = "Maple Symbols";
export const OG_IMAGE = {
  url: `${SITE_URL}/main/og-image.png`,
  alt: "Maple Symbols — MapleStory Symbol Calculator",
} as const;

export type RoutePath = "/" | "/handbook" | "/changelog" | "/credits";

export interface Route {
  path: RoutePath;
  title: string;
  description: string;
  /** Present when the page has a Header link; `activeFor` lists the paths that highlight it. */
  nav?: { label: string; activeFor?: readonly RoutePath[] };
  /** Sitemap entry. `/release` bumps `lastmod` (YYYY-MM-DD). */
  sitemap: { lastmod: string; changefreq: "weekly" | "monthly" | "yearly"; priority: number };
}

export const ROUTES: readonly Route[] = [
  {
    path: "/",
    title: "MapleStory Arcane & Sacred Symbol Calculator | Maple Symbols",
    description:
      "MapleStory symbol calculator for Arcane and Sacred symbols. Track daily and weekly quests, estimate completion dates, and plan your leveling.",
    nav: { label: "Calculator" },
    sitemap: { lastmod: "2026-03-11", changefreq: "weekly", priority: 1.0 },
  },
  {
    path: "/handbook",
    title: "Symbol Handbook | Maple Symbols",
    description:
      "Complete Arcane and Sacred Symbol reference: experience tables, meso upgrade costs, and daily/weekly quest ratios for every MapleStory region.",
    nav: { label: "Handbook" },
    sitemap: { lastmod: "2026-03-11", changefreq: "monthly", priority: 0.8 },
  },
  {
    path: "/changelog",
    title: "Changelog | Maple Symbols",
    description:
      "Full version history and feature updates for Maple Symbols, the MapleStory Arcane and Sacred Symbol calculator.",
    nav: { label: "Extras", activeFor: ["/changelog", "/credits"] },
    sitemap: { lastmod: "2026-03-11", changefreq: "monthly", priority: 0.6 },
  },
  {
    path: "/credits",
    title: "Credits | Maple Symbols",
    description:
      "Credits for Maple Symbols: the resources, creators and community members behind the MapleStory Arcane and Sacred symbol calculator.",
    sitemap: { lastmod: "2025-08-22", changefreq: "yearly", priority: 0.4 },
  },
];

/** The paths the Extras page shows as tabs, in tab order. */
export const EXTRAS_TABS: readonly RoutePath[] = ["/changelog", "/credits"];

/** Header links, in order. */
export const NAV = ROUTES.flatMap((r) =>
  r.nav ? [{ path: r.path, label: r.nav.label, activeFor: r.nav.activeFor ?? [] }] : []
);

/** Canonical URL for a path (the root keeps its trailing slash). */
export const urlFor = (path: RoutePath): string =>
  path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;

/** The route for a pathname; unknown paths fall through to the calculator ("/"). */
export const routeFor = (pathname: string): Route =>
  ROUTES.find((r) => r.path === pathname) ?? ROUTES[0];

// ---------------------------------------------------------------------------
// Generators used by the Vite plugin (and by src/test/seo.test.tsx)
// ---------------------------------------------------------------------------

export interface PageMeta {
  title: string;
  description: string;
  url: string;
}

/** Path → title/description/url, the shape index.html's bootstrap script reads. */
export function pageMap(): Record<RoutePath, PageMeta> {
  const map = {} as Record<RoutePath, PageMeta>;
  for (const r of ROUTES) {
    map[r.path] = { title: r.title, description: r.description, url: urlFor(r.path) };
  }
  return map;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Fill the `__PLACEHOLDER__` tokens in index.html: the root page's static tags and the
 * `pageMap` the inline bootstrap script uses before React loads. Throws on an unknown token.
 */
export function applyToIndexHtml(html: string): string {
  const root = routeFor("/");
  const values: Record<string, string> = {
    __ROOT_TITLE__: escapeHtml(root.title),
    __ROOT_DESCRIPTION__: escapeHtml(root.description),
    __ROOT_URL__: urlFor("/"),
    __OG_IMAGE__: OG_IMAGE.url,
    __OG_IMAGE_ALT__: escapeHtml(OG_IMAGE.alt),
    // Inside a <script>; "</" must not terminate it.
    __PAGE_MAP__: JSON.stringify(pageMap()).replace(/</g, "\\u003c"),
  };
  return html.replace(/__[A-Z_]+__/g, (token) => {
    const value = values[token];
    if (value === undefined) throw new Error(`index.html: unknown placeholder ${token}`);
    return value;
  });
}

/** The sitemap served at /sitemap.xml (robots.txt points at it). */
export function sitemapXml(): string {
  const entries = ROUTES.map(
    (r) => `  <url>
    <loc>${urlFor(r.path)}</loc>
    <lastmod>${r.sitemap.lastmod}</lastmod>
    <changefreq>${r.sitemap.changefreq}</changefreq>
    <priority>${r.sitemap.priority.toFixed(1)}</priority>
  </url>`
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${entries.join("\n\n")}

</urlset>
`;
}
