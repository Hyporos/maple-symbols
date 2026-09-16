// ---------------------------------------------------------------------------
// Page metadata has one source, src/lib/routes.ts. This test checks the two
// generated artefacts (index.html after the routes plugin, sitemap.xml) and the
// rendered <head> at every route against it.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import App from "../App";
import { RouterProvider } from "../contexts/RouterContext";
import { applyToIndexHtml, pageMap, ROUTES, sitemapXml, urlFor } from "../lib/routes";
import { seedHeadMeta } from "./helpers";

const source = readFileSync("index.html", "utf8");
const html = applyToIndexHtml(source);
const decode = (s: string) => s.replace(/&amp;/g, "&");
const content = (selector: string) =>
  document.head.querySelector(selector)?.getAttribute("content");

describe("index.html after the routes plugin", () => {
  it("keeps its placeholders in the source and fills every one of them", () => {
    expect(source).toContain("__PAGE_MAP__");
    expect(source).toContain("__ROOT_TITLE__");
    expect(html).not.toMatch(/__[A-Z_]+__/);
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
    },
    20_000
  );
});
