import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  alternatesFor,
  applyToIndexHtml,
  DEFAULT_EDITION,
  editionFor,
  editionOf,
  EDITIONS,
  hrefFor,
  isIndexable,
  isKnownPath,
  routeFor,
  servedLocale,
  sitemapIndexXml,
  sitemapXml,
  splitPath,
  urlFor,
} from "./routes";
import { REGIONS } from "./regions";

const byRegion = (region: string) => EDITIONS.find((e) => e.region === region)!;
const kms = byRegion("kms");
const msea = byRegion("msea");

describe("editions (docs/REGIONS.md §2)", () => {
  it("has one edition per server, GMS first at the root and the rest behind server codes (D-3)", () => {
    expect(EDITIONS.map((e) => e.region)).toEqual([...REGIONS]);
    expect(EDITIONS.map((e) => e.prefix)).toEqual(["", "/msea", "/kms", "/jms", "/tms", "/cms"]);
    expect(DEFAULT_EDITION.region).toBe("gms");
    for (const region of REGIONS) expect(editionOf(region).region).toBe(region);
  });

  it("splits a path into its edition and the page inside it", () => {
    expect(splitPath("/")).toEqual({ edition: DEFAULT_EDITION, rest: "/" });
    expect(splitPath("/handbook")).toEqual({ edition: DEFAULT_EDITION, rest: "/handbook" });
    expect(splitPath("/kms")).toEqual({ edition: kms, rest: "/" });
    expect(splitPath("/kms/")).toEqual({ edition: kms, rest: "/" });
    expect(splitPath("/kms/handbook")).toEqual({ edition: kms, rest: "/handbook" });
    // Only a whole first segment is a prefix: /kmsx is a GMS path.
    expect(editionFor("/kmsx")).toBe(DEFAULT_EDITION);
  });

  it("resolves pages inside an edition, and unknown pages to its calculator", () => {
    expect(routeFor("/kms/handbook").path).toBe("/handbook");
    expect(routeFor("/msea/credits").path).toBe("/credits");
    expect(routeFor("/kms/nope").path).toBe("/");
    expect(isKnownPath("/kms/changelog")).toBe(true);
    expect(isKnownPath("/kms/nope")).toBe(false);
  });

  it("builds site paths and canonical URLs per edition, the site root alone with a slash (SEO-2)", () => {
    expect(hrefFor("/")).toBe("/");
    expect(hrefFor("/handbook")).toBe("/handbook");
    expect(hrefFor("/", kms)).toBe("/kms");
    expect(hrefFor("/handbook", kms)).toBe("/kms/handbook");
    expect(urlFor("/")).toBe("https://maplesymbols.com/");
    expect(urlFor("/", kms)).toBe("https://maplesymbols.com/kms");
    expect(urlFor("/credits", msea)).toBe("https://maplesymbols.com/msea/credits");
  });

  it("serves an untranslated edition in English and keeps it out of search until its catalogue lands", () => {
    expect(isIndexable(DEFAULT_EDITION)).toBe(true);
    expect(isIndexable(msea)).toBe(true); // English, so already translated
    for (const region of ["kms", "jms", "tms", "cms"]) {
      expect(isIndexable(byRegion(region))).toBe(false);
      expect(servedLocale(byRegion(region))).toBe("en");
    }
  });

  it("lists every indexable edition's URL as an alternate, with x-default on GMS", () => {
    expect(alternatesFor("/handbook")).toEqual([
      { hreflang: "en", href: "https://maplesymbols.com/handbook" },
      { hreflang: "x-default", href: "https://maplesymbols.com/handbook" },
      { hreflang: "en-SG", href: "https://maplesymbols.com/msea/handbook" },
      { hreflang: "en-MY", href: "https://maplesymbols.com/msea/handbook" },
      { hreflang: "en-PH", href: "https://maplesymbols.com/msea/handbook" },
      { hreflang: "en-TH", href: "https://maplesymbols.com/msea/handbook" },
    ]);
  });
});

describe("each edition's built HTML", () => {
  const source = readFileSync("index.html", "utf8");

  it("carries the page's own title, canonical and hreflang in the head", () => {
    const html = applyToIndexHtml(source, msea, "/handbook");
    expect(html).toMatch(/<title>Symbol Handbook \| Maple Symbols<\/title>/);
    expect(html).toContain(
      '<link rel="canonical" href="https://maplesymbols.com/msea/handbook" />'
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="en-SG" href="https://maplesymbols.com/msea/handbook" />'
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://maplesymbols.com/handbook" />'
    );
    expect(html).not.toContain('name="robots"');
  });

  it("marks an untranslated edition noindex, with no alternates", () => {
    const html = applyToIndexHtml(source, kms, "/handbook");
    expect(html).toContain('<meta name="robots" content="noindex" />');
    expect(html).toContain('<link rel="canonical" href="https://maplesymbols.com/kms/handbook" />');
    expect(html).not.toContain('rel="alternate"');
    expect(html.match(/<html lang="(.*?)"/)![1]).toBe("en");
  });

  it("gives the bootstrap script only its own edition's pages, keyed by full path", () => {
    const html = applyToIndexHtml(source, kms);
    const map = JSON.parse(html.match(/const pageMap = (\{.*\});/)![1]);
    expect(Object.keys(map)).toEqual(["/kms", "/kms/handbook", "/kms/changelog", "/kms/credits"]);
    expect(map["/kms"].url).toBe("https://maplesymbols.com/kms");
  });
});

describe("sitemaps", () => {
  it("indexes one sitemap per indexable edition", () => {
    const locs = [...sitemapIndexXml().matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([
      "https://maplesymbols.com/sitemaps/gms.xml",
      "https://maplesymbols.com/sitemaps/msea.xml",
    ]);
  });

  it("lists an edition's pages, each with its alternates", () => {
    const xml = sitemapXml(msea);
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([
      "https://maplesymbols.com/msea",
      "https://maplesymbols.com/msea/handbook",
      "https://maplesymbols.com/msea/changelog",
      "https://maplesymbols.com/msea/credits",
    ]);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="en" href="https://maplesymbols.com/credits" />'
    );
  });
});

describe("vercel.json serves every edition", () => {
  const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));

  it("serves the built <path>.html files without the extension", () => {
    expect(vercel.cleanUrls).toBe(true);
  });

  it("sends an unknown path inside an edition to that edition's calculator, before the root fallback", () => {
    const rewrites: { source: string; destination: string }[] = vercel.rewrites;
    for (const edition of EDITIONS.filter((e) => e.prefix)) {
      const i = rewrites.findIndex((r) => r.source === `${edition.prefix}/(.*)`);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(rewrites[i].destination).toBe(`${edition.prefix}.html`);
      expect(i).toBeLessThan(rewrites.findIndex((r) => r.source === "/(.*)"));
    }
  });
});
