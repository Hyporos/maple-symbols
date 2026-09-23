import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import {
  applyToIndexHtml,
  EDITIONS,
  editionFor,
  hrefFor,
  ROUTES,
  routeFor,
  sitemapEditions,
  sitemapIndexXml,
  sitemapPath,
  sitemapXml,
} from "./src/lib/routes";

/**
 * Page metadata comes from src/lib/routes.ts. Every page of every edition gets its own HTML
 * file with its title, description, canonical, language and hreflang already in the head
 * (docs/REGIONS.md §4): `dist/index.html` is the GMS calculator, the others are
 * `dist/<path>.html` (`handbook.html`, `kms.html`, `kms/handbook.html`), which vercel.json's
 * `cleanUrls` serves without the extension. Also emits the sitemap index and one sitemap per
 * indexable edition, and serves all of it in dev.
 */
function routes(): Plugin[] {
  let template = "";
  let outDir = "dist";
  const sitemaps = (): Record<string, string> => ({
    "/sitemap.xml": sitemapIndexXml(),
    ...Object.fromEntries(sitemapEditions().map((e) => [sitemapPath(e), sitemapXml(e)])),
  });

  // Dev fills the tokens before Vite's own HTML pass, which would otherwise read
  // href="__ROOT_URL__" as a relative link and prefix it with "/".
  const dev: Plugin = {
    name: "maple-routes-dev",
    apply: "serve",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const url = (ctx.originalUrl ?? ctx.path).split("?")[0];
        return applyToIndexHtml(html, editionFor(url), routeFor(url).path);
      },
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const xml = sitemaps()[(req.url ?? "").split("?")[0]];
        if (xml === undefined) return next();
        res.setHeader("Content-Type", "application/xml");
        res.end(xml);
      });
    },
  };

  // The build fills after Vite's pass, so every per-page copy carries the same asset tags.
  const build: Plugin = {
    name: "maple-routes",
    // The client build only: the server build of src/entry-server.tsx has no HTML.
    apply: (_config, env) => env.command === "build" && !env.isSsrBuild,
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml: {
      order: "post",
      handler(html) {
        template = html;
        return applyToIndexHtml(html);
      },
    },
    generateBundle() {
      for (const [path, source] of Object.entries(sitemaps())) {
        this.emitFile({ type: "asset", fileName: path.slice(1), source });
      }
    },
    writeBundle() {
      if (!template) throw new Error("routes plugin: index.html was never transformed");
      for (const edition of EDITIONS) {
        for (const route of ROUTES) {
          const href = hrefFor(route.path, edition);
          if (href === "/") continue; // dist/index.html itself
          const file = resolve(outDir, `.${href}.html`);
          mkdirSync(dirname(file), { recursive: true });
          writeFileSync(file, applyToIndexHtml(template, edition, route.path));
        }
      }
    },
  };

  return [dev, build];
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [...routes(), react()],
  // Vercel preview builds serve the draft translations for review; production does not
  // (SERVES_DRAFTS in src/lib/routes.ts). A constant, so production drops the drafts.
  define: {
    __SERVES_DRAFTS__: JSON.stringify(
      process.env.VERCEL_ENV === "preview" || process.env.SERVE_DRAFTS === "1"
    ),
  },
  build: {
    // Vite 8 bundles with rolldown; vendor splitting uses its codeSplitting groups
    // (the old rollup `manualChunks` object form is not supported).
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|scheduler|zustand|use-sync-external-store)[\\/]/,
            },
            {
              name: "recharts-vendor",
              test: /node_modules[\\/](recharts|victory-vendor|d3-[^\\/]+|internmap|delaunator|robust-predicates|@reduxjs|react-redux|reselect|immer|es-toolkit|eventemitter3|decimal\.js-light|tiny-invariant)[\\/]/,
            },
            { name: "dayjs-vendor", test: /node_modules[\\/]dayjs[\\/]/ },
          ],
        },
      },
    },
  },
});
