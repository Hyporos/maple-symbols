// ---------------------------------------------------------------------------
// routes.ts — The single source of truth for the site's pages.
//
// Everything that needs a path, title, description, canonical URL or sitemap
// entry reads this file: App.tsx (which page to render and its <SEO> props),
// Header (nav links), Extras (tab paths), SEO.tsx (defaults and JSON-LD), and
// the routes plugin in vite.config.ts, which fills the __PLACEHOLDER__ tokens
// in index.html and emits sitemap.xml at build time and in dev.
// Add or change a page here and nowhere else.
//
// Titles, descriptions and nav labels are English catalogue messages (I18N-4), with
// their game terms filled per edition (`pageMetaFor`, src/i18n/terms.ts). This file
// imports the English area and the terms module directly, never ../i18n (whose index
// imports this file), and nothing it imports may contain JSX: vite.config.ts loads it
// at build time.
// ---------------------------------------------------------------------------

import { pages } from "../i18n/en/pages";
import { pages as jaPages } from "../i18n/ja/pages";
import { pages as koPages } from "../i18n/ko/pages";
import { pages as zhHansPages } from "../i18n/zh-Hans/pages";
import { pages as zhHantPages } from "../i18n/zh-Hant/pages";
import type { Messages } from "../i18n";
import { fillTerms, termsFor, type NameSet, type PageValues, type TermValues } from "../i18n/terms";
import type { Region } from "./regions";

export const SITE_URL = "https://maplesymbols.com";
export const SITE_NAME = "Maple Symbols";
/**
 * The BCP-47 tag of the UI the app is serving. One value today; I18N-1 turns this
 * into a per-request locale and `RoutePath` gains a locale prefix (I18N-4).
 * Everything that names a language reads this: `src/lib/format.ts`, the JSON-LD in
 * `src/components/SEO.tsx`, and `<html lang>` and `og:locale` in `index.html` (via
 * `applyToIndexHtml`). `public/manifest.webmanifest` is copied verbatim, so its
 * `"lang"` is a literal that `src/test/seo.test.tsx` holds equal to this value.
 */
export const DEFAULT_LOCALE = "en";

/** The languages whose catalogue is published: production serves these. */
export const PUBLISHED_LANGUAGES = ["en"] as const;

/**
 * The languages whose catalogue is written but still a draft (src/i18n/drafts.ts): a machine
 * draft awaiting a native player's review (REGIONS D-12). Publishing one moves it to
 * PUBLISHED_LANGUAGES.
 */
export const DRAFT_LANGUAGES = ["ko", "ja", "zh-Hant", "zh-Hans"] as const;
export type DraftLanguage = (typeof DRAFT_LANGUAGES)[number];

declare const __SERVES_DRAFTS__: boolean | undefined;
const buildEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env;

/**
 * Whether this build serves the drafts too. Vercel preview builds do (`VERCEL_ENV=preview`),
 * so a native player can review a translation on a preview link; production never does
 * (Brian, 2026-09-23). `SERVE_DRAFTS=1` does the same for a local build. vite.config.ts turns
 * the answer into the constant `__SERVES_DRAFTS__`, so a production bundle drops the drafts;
 * outside a Vite build (the config itself, tests) it is read from the environment.
 */
export const SERVES_DRAFTS: boolean =
  typeof __SERVES_DRAFTS__ === "boolean"
    ? __SERVES_DRAFTS__
    : buildEnv?.VERCEL_ENV === "preview" || buildEnv?.SERVE_DRAFTS === "1";

/**
 * The languages this build serves: the published ones, plus the drafts on a preview.
 * `LOCALES` in src/i18n/index.ts is this list. An edition in any other language falls back
 * to English and is kept out of search (noindex, no hreflang, no sitemap).
 */
export const CATALOGUE_LANGUAGES: readonly string[] = SERVES_DRAFTS
  ? [...PUBLISHED_LANGUAGES, ...DRAFT_LANGUAGES]
  : PUBLISHED_LANGUAGES;

// ---------------------------------------------------------------------------
// Editions: one indexable site per server (docs/REGIONS.md §2, D-2 to D-4)
// ---------------------------------------------------------------------------

/** One site version: its server's numbers, in its language, at its own URL prefix. */
export interface Edition {
  /** The server; also the edition's id. */
  region: Region;
  /** Path prefix ("" for GMS at the root). Server codes, lowercase (D-3). */
  prefix: "" | `/${string}`;
  /** Short server name as players write it. */
  name: string;
  /** The BCP-47 tag of the edition's language. */
  language: string;
  /** The language's name in itself, for the site-version menu. */
  languageName: string;
  /** Its client's vocabulary (src/i18n/terms.ts); a page uses it through `nameSetFor`. */
  nameSet: NameSet;
  /** hreflang values for this edition's pages; GMS also takes x-default. */
  hreflang: readonly string[];
}

export const EDITIONS: readonly Edition[] = [
  {
    region: "gms",
    prefix: "",
    name: "GMS",
    language: "en",
    languageName: "English",
    nameSet: "en-gms",
    hreflang: ["en", "x-default"],
  },
  {
    region: "msea",
    prefix: "/msea",
    name: "MSEA",
    language: "en",
    languageName: "English",
    nameSet: "en-msea",
    hreflang: ["en-SG", "en-MY", "en-PH", "en-TH"],
  },
  {
    region: "kms",
    prefix: "/kms",
    name: "KMS",
    language: "ko",
    languageName: "한국어",
    nameSet: "ko",
    hreflang: ["ko"],
  },
  {
    region: "jms",
    prefix: "/jms",
    name: "JMS",
    language: "ja",
    languageName: "日本語",
    nameSet: "ja",
    hreflang: ["ja"],
  },
  {
    region: "tms",
    prefix: "/tms",
    name: "TMS",
    language: "zh-Hant",
    languageName: "繁體中文",
    nameSet: "zh-Hant",
    hreflang: ["zh-Hant", "zh-TW", "zh-HK", "zh-MO"],
  },
  {
    region: "cms",
    prefix: "/cms",
    name: "CMS",
    language: "zh-Hans",
    languageName: "简体中文",
    nameSet: "zh-Hans",
    hreflang: ["zh-Hans", "zh-CN"],
  },
];

export const DEFAULT_EDITION: Edition = EDITIONS[0];

/** The edition of a server (every server has exactly one). */
export const editionOf = (region: Region): Edition =>
  EDITIONS.find((e) => e.region === region) ?? DEFAULT_EDITION;

/** Whether the edition's language has its catalogue; until then it is noindex. */
export const isIndexable = (edition: Edition): boolean =>
  (CATALOGUE_LANGUAGES as readonly string[]).includes(edition.language);

/** The language the edition is actually served in: its own once translated, else English. */
export const servedLocale = (edition: Edition): string =>
  isIndexable(edition) ? edition.language : DEFAULT_LOCALE;

/**
 * The vocabulary a page of the edition uses: its own client's once the page is served in the
 * edition's language, GMS English until then, so an untranslated KMS page (English today)
 * never mixes Korean game words into English copy.
 */
export const nameSetFor = (edition: Edition): NameSet =>
  servedLocale(edition) === edition.language ? edition.nameSet : DEFAULT_EDITION.nameSet;

/** The values that come with an edition's pages rather than its name set (src/i18n/terms.ts). */
export const pageValuesFor = (edition: Edition): PageValues => ({
  pageServer: edition.name,
  pageGame: edition.prefix ? edition.name : "MapleStory",
});

export const termValuesFor = (edition: Edition): TermValues => ({
  ...termsFor(nameSetFor(edition)),
  ...pageValuesFor(edition),
});

/** Split a pathname into its edition and the page path inside it ("/kms/handbook" → kms, "/handbook"). */
export function splitPath(pathname: string): { edition: Edition; rest: string } {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const first = "/" + (clean.split("/")[1] ?? "");
  const edition = EDITIONS.find((e) => e.prefix !== "" && e.prefix === first) ?? DEFAULT_EDITION;
  const rest = edition.prefix ? clean.slice(edition.prefix.length) || "/" : clean;
  return { edition, rest };
}

/** The edition a pathname belongs to. */
export const editionFor = (pathname: string): Edition => splitPath(pathname).edition;

/**
 * BCP-47 tag → Open Graph `og:locale` (`language_TERRITORY`). An explicit table, not
 * string munging: the script subtags of I18N-1 have no territory to derive
 * (`zh-Hant` is `zh_TW`, `zh-Hans` is `zh_CN`). Add a row when a locale lands.
 */
export const OG_LOCALES: Readonly<Record<string, string>> = {
  en: "en_US",
  ko: "ko_KR",
  ja: "ja_JP",
  "zh-Hant": "zh_TW",
  "zh-Hans": "zh_CN",
};

/** The `og:locale` value for a tag; throws on a tag with no row, so a new locale cannot ship a blank. */
export const ogLocaleFor = (locale: string): string => {
  const value = OG_LOCALES[locale];
  if (value === undefined) throw new Error(`routes.ts: no og:locale mapping for "${locale}"`);
  return value;
};
type PageCopy = Messages["pages"];

/**
 * Each served language's page copy, term placeholders still in it. The drafts are here only
 * in a build that serves them (`SERVES_DRAFTS`), so a production bundle leaves them out.
 */
const PAGE_COPY: Readonly<Record<string, PageCopy>> = SERVES_DRAFTS
  ? { en: pages, ko: koPages, ja: jaPages, "zh-Hant": zhHantPages, "zh-Hans": zhHansPages }
  : { en: pages };

/** An edition's page copy in its served language, terms filled. Memoised per edition. */
const pageCopy = new Map<Edition, PageCopy>();
const pagesFor = (edition: Edition): PageCopy => {
  let copy = pageCopy.get(edition);
  if (copy === undefined) {
    copy = fillTerms(PAGE_COPY[servedLocale(edition)] ?? pages, termValuesFor(edition));
    pageCopy.set(edition, copy);
  }
  return copy;
};

export const OG_IMAGE = {
  url: `${SITE_URL}/main/og-image.png`,
  alt: pagesFor(DEFAULT_EDITION).ogImageAlt,
} as const;

export type RoutePath = "/" | "/handbook" | "/changelog" | "/credits";

/** A page's entry in the page copy (src/i18n/en/pages.ts). */
type PageKey = "calculator" | "handbook" | "changelog" | "credits";

export interface Route {
  path: RoutePath;
  /** Where its title and description live in the page copy. */
  page: PageKey;
  /** The GMS title and description. Any edition's: `pageMetaFor(path, edition)`. */
  title: string;
  description: string;
  /** Present when the page has a Header link; `activeFor` lists the paths that highlight it. */
  nav?: { label: string; activeFor?: readonly RoutePath[] };
  /** Sitemap entry. `/release` bumps `lastmod` (YYYY-MM-DD). */
  sitemap: { lastmod: string; changefreq: "weekly" | "monthly" | "yearly"; priority: number };
}

const gms = pagesFor(DEFAULT_EDITION);

export const ROUTES: readonly Route[] = [
  {
    path: "/",
    page: "calculator",
    title: gms.calculator.title,
    description: gms.calculator.description,
    nav: { label: gms.calculator.nav },
    sitemap: { lastmod: "2026-09-16", changefreq: "weekly", priority: 1.0 },
  },
  {
    path: "/handbook",
    page: "handbook",
    title: gms.handbook.title,
    description: gms.handbook.description,
    nav: { label: gms.handbook.nav },
    sitemap: { lastmod: "2026-03-11", changefreq: "monthly", priority: 0.8 },
  },
  {
    path: "/changelog",
    page: "changelog",
    title: gms.changelog.title,
    description: gms.changelog.description,
    nav: { label: gms.changelog.nav, activeFor: ["/changelog", "/credits"] },
    sitemap: { lastmod: "2026-09-16", changefreq: "monthly", priority: 0.6 },
  },
  {
    path: "/credits",
    page: "credits",
    title: gms.credits.title,
    description: gms.credits.description,
    sitemap: { lastmod: "2025-08-22", changefreq: "yearly", priority: 0.4 },
  },
];

/** The paths the Extras page shows as tabs, in tab order. */
export const EXTRAS_TABS: readonly RoutePath[] = ["/changelog", "/credits"];

/**
 * Header links, in order. `label` is the GMS English one; the Header shows the page's own
 * (`pages[page].nav` in the page's catalogue), so a translated edition's links are too.
 */
export const NAV = ROUTES.flatMap((r) =>
  r.nav
    ? [{ path: r.path, page: r.page, label: r.nav.label, activeFor: r.nav.activeFor ?? [] }]
    : []
);

/** The site path of a page in an edition: "/" and "/handbook" for GMS, "/kms" and "/kms/handbook". */
export const hrefFor = (path: RoutePath, edition: Edition = DEFAULT_EDITION): string =>
  edition.prefix + (path === "/" ? "" : path) || "/";

/**
 * Canonical URL for a page in an edition. The site root keeps its trailing slash; every
 * other URL has none, matching vercel.json's `trailingSlash: false` (SEO-2).
 */
export const urlFor = (path: RoutePath, edition: Edition = DEFAULT_EDITION): string => {
  const href = hrefFor(path, edition);
  return href === "/" ? `${SITE_URL}/` : `${SITE_URL}${href}`;
};

/** The route for a pathname, with or without an edition prefix; unknown paths fall through to the calculator ("/"). */
export const routeFor = (pathname: string): Route => {
  const { rest } = splitPath(pathname);
  return ROUTES.find((r) => r.path === rest) ?? ROUTES[0];
};

/** Whether a pathname names a real page (after its edition prefix). */
export const isKnownPath = (pathname: string): boolean => {
  const { rest } = splitPath(pathname);
  return ROUTES.some((r) => r.path === rest);
};

/** The hreflang alternates of a page: every indexable edition's URL, one entry per hreflang value. */
export function alternatesFor(path: RoutePath): { hreflang: string; href: string }[] {
  return EDITIONS.filter(isIndexable).flatMap((edition) =>
    edition.hreflang.map((hreflang) => ({ hreflang, href: urlFor(path, edition) }))
  );
}

// ---------------------------------------------------------------------------
// Generators used by the Vite plugin (and by src/test/seo.test.tsx)
// ---------------------------------------------------------------------------

export interface PageMeta {
  title: string;
  description: string;
  url: string;
}

/** A page's title, description and canonical URL in one edition, in that edition's own terms. */
export function pageMetaFor(path: RoutePath, edition: Edition = DEFAULT_EDITION): PageMeta {
  const { title, description } = pagesFor(edition)[routeFor(path).page];
  return { title, description, url: urlFor(path, edition) };
}

/**
 * Site path → title/description/url for one edition's pages, the shape index.html's
 * bootstrap script reads (keyed by the full path, prefix included).
 */
export function pageMap(edition: Edition = DEFAULT_EDITION): Record<string, PageMeta> {
  const map: Record<string, PageMeta> = {};
  for (const r of ROUTES) map[hrefFor(r.path, edition)] = pageMetaFor(r.path, edition);
  return map;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The alternate-language links (or, for an untranslated edition, a noindex) for a page's head. */
/**
 * Search-engine ownership tokens (docs/REGIONS.md D-20, SEO §5). Google and Bing verify the
 * domain by DNS; these engines read a meta tag in the prebuilt head. Each value is the
 * `content` of that engine's tag, pasted from its console; an empty one emits nothing.
 */
export const SITE_VERIFICATION: Readonly<Record<"naver" | "baidu", string>> = {
  naver: "",
  baidu: "",
};

const VERIFICATION_TAGS = { naver: "naver-site-verification", baidu: "baidu-site-verification" };

/** The verification meta tags for the tokens that are set (every page carries them). */
export const verificationTags = (
  tokens: Readonly<Record<string, string>> = SITE_VERIFICATION
): string[] =>
  Object.entries(VERIFICATION_TAGS)
    .filter(([engine]) => tokens[engine])
    .map(([engine, name]) => `<meta name="${name}" content="${escapeHtml(tokens[engine])}" />`);

export function headLinks(path: RoutePath, edition: Edition = DEFAULT_EDITION): string {
  const links = isIndexable(edition)
    ? alternatesFor(path).map(
        (a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`
      )
    : ['<meta name="robots" content="noindex" />'];
  return [...links, ...verificationTags()].join("\n    ");
}

/**
 * Fill the `__PLACEHOLDER__` tokens in index.html for one page of one edition: its static
 * tags, its hreflang links, and the `pageMap` the inline bootstrap script uses before React
 * loads (for URLs that fall back to this file). The build writes one filled file per page
 * and edition (vite.config.ts). Throws on an unknown token.
 */
export function applyToIndexHtml(
  html: string,
  edition: Edition = DEFAULT_EDITION,
  path: RoutePath = "/"
): string {
  const page = routeFor(path);
  const meta = pageMetaFor(page.path, edition);
  const locale = servedLocale(edition);
  const values: Record<string, string> = {
    __LOCALE__: locale,
    __OG_LOCALE__: ogLocaleFor(locale),
    __ROOT_TITLE__: escapeHtml(meta.title),
    __ROOT_DESCRIPTION__: escapeHtml(meta.description),
    __ROOT_URL__: meta.url,
    __HEAD_LINKS__: headLinks(page.path, edition),
    __OG_IMAGE__: OG_IMAGE.url,
    __OG_IMAGE_ALT__: escapeHtml(OG_IMAGE.alt),
    // Inside a <script>; "</" must not terminate it.
    __PAGE_MAP__: JSON.stringify(pageMap(edition)).replace(/</g, "\\u003c"),
  };
  return html.replace(/__[A-Z_]+__/g, (token) => {
    const value = values[token];
    if (value === undefined) throw new Error(`index.html: unknown placeholder ${token}`);
    return value;
  });
}

/** The editions that get a sitemap (and hreflang): the translated ones. */
export const sitemapEditions = (): Edition[] => EDITIONS.filter(isIndexable);

/** Where an edition's sitemap is served, e.g. /sitemaps/gms.xml. */
export const sitemapPath = (edition: Edition): string => `/sitemaps/${edition.region}.xml`;

/** The sitemap index served at /sitemap.xml (robots.txt points at it), one entry per edition. */
export function sitemapIndexXml(): string {
  const entries = sitemapEditions().map(
    (e) => `  <sitemap>
    <loc>${SITE_URL}${sitemapPath(e)}</loc>
  </sitemap>`
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</sitemapindex>
`;
}

/** One edition's sitemap, each URL with its hreflang alternates (Google reads them here too). */
export function sitemapXml(edition: Edition = DEFAULT_EDITION): string {
  const entries = ROUTES.map(
    (r) => `  <url>
    <loc>${urlFor(r.path, edition)}</loc>
${alternatesFor(r.path)
  .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
  .join("\n")}
    <lastmod>${r.sitemap.lastmod}</lastmod>
    <changefreq>${r.sitemap.changefreq}</changefreq>
    <priority>${r.sitemap.priority.toFixed(1)}</priority>
  </url>`
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${entries.join("\n\n")}

</urlset>
`;
}
