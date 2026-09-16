import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
