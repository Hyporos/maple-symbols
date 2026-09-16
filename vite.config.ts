import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";
import { applyToIndexHtml, sitemapXml } from "./src/lib/routes";

/**
 * Page metadata comes from src/lib/routes.ts: fill index.html's placeholders (root tags and
 * the bootstrap pageMap), emit sitemap.xml into dist, and serve it in dev.
 */
function routes(): Plugin {
  return {
    name: "maple-routes",
    transformIndexHtml: { order: "pre", handler: (html) => applyToIndexHtml(html) },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemapXml() });
    },
    configureServer(server) {
      server.middlewares.use("/sitemap.xml", (_req, res) => {
        res.setHeader("Content-Type", "application/xml");
        res.end(sitemapXml());
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    routes(),
    react(),
    // Pre-compress assets with Brotli/gzip — Vercel and other CDNs serve the
    // pre-compressed file to supporting browsers, reducing transfer size.
    compression({ algorithm: "brotliCompress", ext: ".br" }),
    compression({ algorithm: "gzip", ext: ".gz" }),
  ],
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
