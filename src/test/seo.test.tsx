// ---------------------------------------------------------------------------
// Page metadata has one source, src/lib/routes.ts. This test checks the two
// generated artefacts (index.html after the routes plugin, sitemap.xml) and the
// rendered <head> at every route against it.
// ---------------------------------------------------------------------------

import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { RouterProvider } from "../contexts/RouterContext";
import {
  applyToIndexHtml,
  DEFAULT_LOCALE,
  EDITIONS,
  type Edition,
  OG_LOCALES,
  ogLocaleFor,
  pageMap,
  pageMetaFor,
  ROUTES,
  sitemapXml,
  urlFor,
} from "../lib/routes";
import { changelogEntries } from "../lib/changelog";
import { dayjs } from "../lib/dayjs";
import { displayWidth, seedHeadMeta } from "./helpers";

const source = readFileSync("index.html", "utf8");
const html = applyToIndexHtml(source);
const decode = (s: string) => s.replace(/&amp;/g, "&");
const content = (selector: string) =>
  document.head.querySelector(selector)?.getAttribute("content");

describe("index.html after the routes plugin", () => {
  it("keeps its placeholders in the source and fills every one of them", () => {
    for (const token of ["__PAGE_MAP__", "__ROOT_TITLE__", "__LOCALE__", "__OG_LOCALE__"]) {
      expect(source).toContain(token);
    }
    expect(html).not.toMatch(/__[A-Z_]+__/);
  });

  it("I18N-1: names the language from DEFAULT_LOCALE alone, in index.html and the manifest", () => {
    // index.html carries no literal locale; the generated file does.
    expect(source).not.toMatch(/<html lang="[a-z]/);
    expect(source).not.toMatch(/og:locale" content="[a-z]/);
    expect(html.match(/<html lang="(.*?)"/)![1]).toBe(DEFAULT_LOCALE);
    expect(html.match(/<meta property="og:locale" content="(.*?)"/)![1]).toBe(
      ogLocaleFor(DEFAULT_LOCALE)
    );
    expect(ogLocaleFor(DEFAULT_LOCALE)).toBe("en_US");

    // The manifest is copied verbatim, so its literal is held to the source here.
    const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));
    expect(manifest.lang).toBe(DEFAULT_LOCALE);
  });

  it("maps every I18N-1 locale to an Open Graph language_TERRITORY and rejects an unmapped one", () => {
    expect(OG_LOCALES).toEqual({
      en: "en_US",
      ko: "ko_KR",
      ja: "ja_JP",
      "zh-Hant": "zh_TW",
      "zh-Hans": "zh_CN",
    });
    expect(() => ogLocaleFor("fr")).toThrow(/fr/);
  });

  it("carries the root route in the static tags and the full pageMap in the bootstrap script", () => {
    const root = pageMap()["/"];
    expect(decode(html.match(/<title>(.*?)<\/title>/)![1])).toBe(root.title);
    expect(decode(html.match(/<meta name="description" content="(.*?)"/)![1])).toBe(
      root.description
    );
    expect(html.match(/<link rel="canonical" href="(.*?)"/)![1]).toBe(root.url);

    const literal = html.match(/const pageMap = (\{.*\});/)![1];
    expect(JSON.parse(literal)).toEqual(pageMap());
  });

  it("rejects an unknown placeholder instead of shipping it", () => {
    expect(() => applyToIndexHtml("<title>__NOPE__</title>")).toThrow(/__NOPE__/);
  });
});

describe("sitemap.xml", () => {
  it("lists exactly the routes with a dated lastmod", () => {
    const xml = sitemapXml();
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(ROUTES.map((r) => urlFor(r.path)));
    for (const [, lastmod] of xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)) {
      expect(lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("rendering each route writes its metadata into <head>", () => {
  it.each(ROUTES.map((r) => r.path))(
    "%s",
    async (path) => {
      const route = ROUTES.find((r) => r.path === path)!;
      seedHeadMeta();
      window.history.replaceState(null, "", path);

      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );

      // "/" mounts <SEO> inside the same Suspense boundary as the four lazy calculator
      // chunks (recharts included), so the title can take a few seconds to land in jsdom.
      await waitFor(() => expect(document.title).toBe(route.title), { timeout: 15_000 });
      expect(content('meta[name="description"]')).toBe(route.description);
      expect(content('meta[property="og:url"]')).toBe(urlFor(path));
      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
        urlFor(path)
      );
      // SEO-8: every page names itself in a heading. Tab labels and button text are not headings.
      expect(document.querySelectorAll("h1").length).toBeGreaterThan(0);
    },
    20_000
  );
});

describe("an edition's page", () => {
  it("names its own canonical URL and language, indexable once translated", async () => {
    seedHeadMeta();
    window.history.replaceState(null, "", "/kms/handbook");

    render(
      <RouterProvider>
        <App />
      </RouterProvider>
    );

    await waitFor(() =>
      expect(document.title).toBe("메이플 심볼 강화 비용·성장치 표 | Maple Symbols")
    );
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://maplesymbols.com/kms/handbook"
    );
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
    expect(
      document.head.querySelector('link[rel="alternate"][hreflang="ko"]')?.getAttribute("href")
    ).toBe("https://maplesymbols.com/kms/handbook");
    expect(document.documentElement.lang).toBe("ko");
  });

  it("an indexable edition lists its alternates in the head", async () => {
    seedHeadMeta();
    window.history.replaceState(null, "", "/msea/credits");

    render(
      <RouterProvider>
        <App />
      </RouterProvider>
    );

    await waitFor(() =>
      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
        "https://maplesymbols.com/msea/credits"
      )
    );
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
    const hreflangs = [...document.head.querySelectorAll('link[rel="alternate"]')].map((l) =>
      l.getAttribute("hreflang")
    );
    expect(hreflangs).toEqual(EDITIONS.flatMap((e) => e.hreflang));
  });

  it("writes the edition's own title and description, in its own terms", async () => {
    seedHeadMeta();
    window.history.replaceState(null, "", "/msea/handbook");

    render(
      <RouterProvider>
        <App />
      </RouterProvider>
    );

    const msea = EDITIONS.find((e) => e.region === "msea")!;
    const meta = pageMetaFor("/handbook", msea);
    expect(meta.description).toContain(
      "Arcane and Authentic Symbol reference for MapleStory (MSEA)"
    );
    await waitFor(() => expect(content('meta[name="description"]')).toBe(meta.description));
    expect(document.title).toBe(meta.title);
    // The page itself reads MSEA's words too: the symbol-type toggle.
    expect(screen.getByRole("radio", { name: "Authentic" })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// The rules in docs/SEO.md that can be checked without a browser. Each assertion
// cites the rule it enforces; a rule with no assertion is marked "[test: todo]"
// in that doc, so do not read silence here as coverage.
// ---------------------------------------------------------------------------

describe("titles and descriptions follow docs/SEO.md", () => {
  // Every page of every edition, as its head gets it. pageMap is the per-edition source that
  // the head, the bootstrap script and the prerender read; if titles move to another
  // per-edition function, this line is the one to change.
  const pagesOf = (edition: Edition) => Object.values(pageMap(edition));
  const editions = EDITIONS.map((e) => [e.region, e] as const);

  it("measures display width with East Asian wide characters as 2", () => {
    expect(displayWidth("abc")).toBe(3);
    expect(displayWidth("한국어")).toBe(6);
    expect(displayWidth("日本語abc")).toBe(9);
    expect(displayWidth("繁體中文 · 简体中文")).toBe(19);
    expect(displayWidth("ＡＢ")).toBe(4); // fullwidth forms
    expect(displayWidth("ｱｲ")).toBe(2); // halfwidth katakana stays narrow
  });

  it.each(editions)(
    "SEO-6 (%s): titles are unique, end with the brand, and fit 60 columns of display width",
    (_region, edition) => {
      const titles = pagesOf(edition).map((p) => p.title);
      expect(titles).toHaveLength(ROUTES.length);
      expect(new Set(titles).size).toBe(titles.length);
      for (const title of titles) {
        expect(displayWidth(title), title).toBeLessThanOrEqual(60);
        expect(title.endsWith("| Maple Symbols")).toBe(true);
      }
    }
  );

  it.each(editions)(
    "SEO-7 (%s): descriptions are unique, fit 155 columns of display width, no superlatives",
    (_region, edition) => {
      const descriptions = pagesOf(edition).map((p) => p.description);
      expect(descriptions).toHaveLength(ROUTES.length);
      expect(new Set(descriptions).size).toBe(descriptions.length);
      for (const description of descriptions) {
        expect(displayWidth(description), description).toBeLessThanOrEqual(155);
        expect(description).not.toMatch(/\b(ultimate|best|greatest|#1)\b/i);
      }
    }
  );

  it("SEO-1/SEO-5: every route has a dated lastmod and a path that starts with /", () => {
    for (const route of ROUTES) {
      expect(route.path.startsWith("/")).toBe(true);
      expect(route.sitemap.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("source-level SEO rules", () => {
  const sources = readdirSync("src", { recursive: true, encoding: "utf8" })
    .filter((f) => /\.tsx$/.test(f) && !/\.test\.tsx$/.test(f))
    .map((f) => [`src/${f}`.replace(/\\\\/g, "/"), readFileSync(`src/${f}`, "utf8")] as const);

  it("SEO-15: every <img> has an alt attribute", () => {
    const offenders: string[] = [];
    for (const [file, code] of sources) {
      for (const match of code.matchAll(/<img\b[\s\S]*?\/?>/g)) {
        if (!/\salt[=\s]/.test(match[0])) offenders.push(`${file}: ${match[0].slice(0, 60)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('SEO-22: every target="_blank" link carries a rel', () => {
    const offenders: string[] = [];
    for (const [file, code] of sources) {
      for (const match of code.matchAll(/<a\b[\s\S]*?>/g)) {
        if (match[0].includes('target="_blank"') && !/\srel=/.test(match[0])) {
          offenders.push(`${file}: ${match[0].slice(0, 60)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("SEO-1: no page title or description string lives outside src/lib/routes.ts", () => {
    const strings = ROUTES.flatMap((r) => [r.title, r.description]);
    for (const [file, code] of sources) {
      if (file.endsWith("src/lib/routes.ts")) continue;
      for (const value of strings) expect(code).not.toContain(value);
    }
  });

  it("SEO-13: no SearchAction is emitted (no search box exists)", () => {
    expect(readFileSync("src/components/SEO.tsx", "utf8")).not.toContain("SearchAction");
  });
});

describe("static files follow docs/SEO.md", () => {
  it("SEO-11: index.html ships no keywords meta, and no redundant robots meta", () => {
    expect(source).not.toMatch(/<meta name="keywords"/);
    expect(source).not.toMatch(/<meta name="robots"/);
  });

  it("SEO-2: vercel.json disables trailing slashes", () => {
    const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
    expect(vercel.trailingSlash).toBe(false);
  });

  it("SEO-4: robots.txt allows everything and names the sitemap", () => {
    const robots = readFileSync("public/robots.txt", "utf8");
    expect(robots).toMatch(/User-agent: \*/);
    expect(robots).not.toMatch(/Disallow: \/\s*$/m);
    expect(robots).toContain(`${urlFor("/")}sitemap.xml`.replace("//sitemap", "/sitemap"));
  });

  it("SEO-12: every changelog date is an ISO day that exists on the calendar", () => {
    for (const entry of changelogEntries) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // dayjs rolls an impossible day over ("2023-02-30" → Mar 2), so only a real one round-trips.
      expect(dayjs(entry.date).format("YYYY-MM-DD")).toBe(entry.date);
    }
  });
});

// Google Search Console found these paths, which were never pages. They 308 to the home
// page so they drop out of the index instead of lingering as duplicates of "/".
describe("vercel.json redirects", () => {
  const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as {
    redirects?: { source: string; destination: string; permanent: boolean }[];
  };

  it("permanently redirects the stray section URLs to the home page", () => {
    expect(vercel.redirects).toEqual(
      ["/calculator", "/graph", "/tools"].map((source) => ({
        source,
        destination: "/",
        permanent: true,
      }))
    );
  });

  it("never redirects a real page", () => {
    for (const { source } of vercel.redirects ?? []) {
      expect(ROUTES.map((r) => r.path)).not.toContain(source);
    }
  });
});
