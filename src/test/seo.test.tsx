// ---------------------------------------------------------------------------
// Metadata consistency: page titles/descriptions/URLs live in four places
// (index.html static tags, the index.html pageMap script, App.tsx <SEO> props +
// SEO.tsx defaults, public/sitemap.xml). This test fails when they disagree.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import App from "../App";
import { RouterProvider } from "../contexts/RouterContext";
import { seedHeadMeta } from "./helpers";

type PageMeta = { title: string; description: string; url: string };

const html = readFileSync("index.html", "utf8");
const sitemap = readFileSync("public/sitemap.xml", "utf8");
const decode = (s: string) => s.replace(/&amp;/g, "&");

// The inline bootstrap script in index.html is the canonical route → metadata map.
// Parsed with a regex (no eval) that matches the literal's fixed shape:
//   "/route": { title: "…", description: "…", url: "…" },
function readPageMap(): Record<string, PageMeta> {
  const block = html.match(/const pageMap = \{([\s\S]*?)\n\s*\};/);
  if (!block) throw new Error("pageMap literal not found in index.html");
  const entry =
    /"(\/[\w-]*)":\s*\{\s*title:\s*"([^"]*)",\s*description:\s*"([^"]*)",\s*url:\s*"([^"]*)",?\s*\}/g;
  const map: Record<string, PageMeta> = {};
  for (const [, route, title, description, url] of block[1].matchAll(entry)) {
    map[route] = { title, description, url };
  }
  if (Object.keys(map).length === 0) throw new Error("pageMap entries did not parse");
  return map;
}

const pageMap = readPageMap();
const routes = Object.keys(pageMap);
const content = (selector: string) =>
  document.head.querySelector(selector)?.getAttribute("content");

describe("page metadata is consistent across index.html, sitemap.xml and the React SEO", () => {
  it("index.html static <title> and description match the root pageMap entry", () => {
    const title = decode(html.match(/<title>(.*?)<\/title>/)![1]);
    const description = decode(html.match(/<meta name="description" content="(.*?)"/)![1]);
    expect(title).toBe(pageMap["/"].title);
    expect(description).toBe(pageMap["/"].description);
  });

  it("sitemap.xml lists exactly the pageMap routes", () => {
    const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]).sort();
    expect(locs).toEqual(routes.map((r) => pageMap[r].url).sort());
  });

  it.each(routes)(
    "rendering %s yields the pageMap title, description and canonical",
    async (route) => {
      seedHeadMeta();
      window.history.replaceState(null, "", route);

      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );

      // "/" mounts <SEO> inside the same Suspense boundary as the four lazy calculator
      // chunks (recharts included), so the title can take a few seconds to land in jsdom.
      await waitFor(() => expect(document.title).toBe(pageMap[route].title), { timeout: 15_000 });
      expect(content('meta[name="description"]')).toBe(pageMap[route].description);
      expect(content('meta[property="og:url"]')).toBe(pageMap[route].url);
      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
        pageMap[route].url
      );
    },
    20_000
  );
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
      expect(sitemap).not.toContain(`<loc>https://maplesymbols.com${source}</loc>`);
    }
  });
});
