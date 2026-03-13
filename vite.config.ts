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
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "zustand"],
          "recharts-vendor": ["recharts"],
          "dayjs-vendor": ["dayjs"],
        },
      },
    },
  },
});
