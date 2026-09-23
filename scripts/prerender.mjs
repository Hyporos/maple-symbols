// ---------------------------------------------------------------------------
// prerender.mjs — Fills every built page's #root with its rendered HTML.
//
// Runs last in `pnpm build`, after the client build (which writes one HTML file
// per page and edition, vite.config.ts) and the server build of
// src/entry-server.tsx into dist-ssr/. Each file then carries its whole page,
// not just its head, for search engines that run little or no JavaScript
// (docs/REGIONS.md §4, SEO-9). Fails the build if a page is missing or empty.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const dist = resolve("dist");
const { EDITIONS, ROUTES, hrefFor, renderPage } = await import(
  pathToFileURL(resolve("dist-ssr/entry-server.js")).href
);

const EMPTY_ROOT = '<div id="root"></div>';
let pages = 0;

for (const edition of EDITIONS) {
  for (const route of ROUTES) {
    const href = hrefFor(route.path, edition);
    const file = resolve(dist, href === "/" ? "index.html" : `.${href}.html`);
    const html = readFileSync(file, "utf8");
    if (!html.includes(EMPTY_ROOT)) throw new Error(`prerender: no empty #root in ${file}`);

    const body = await renderPage(href);
    if (!body.includes("<h1")) throw new Error(`prerender: ${href} rendered without a heading`);
    writeFileSync(file, html.replace(EMPTY_ROOT, `<div id="root">${body}</div>`));
    pages++;
  }
}

console.log(`prerender: filled ${pages} pages`);
