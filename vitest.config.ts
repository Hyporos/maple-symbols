import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Standalone test config, deliberately NOT merged with vite.config.ts, so the
// build-only plugins there (routes placeholders/sitemap, brotli/gzip pre-compression,
// codeSplitting groups) never touch the test run; seo.test.tsx calls the routes generators directly. If vite.config.ts ever gains path aliases, mirror them here.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Every run sees the same clock zone as CI, so a machine in Seoul or Tokyo neither
    // shows the suggestion banner in unrelated tests nor shifts a local-time hint.
    env: { TZ: "UTC" },
    css: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/main.tsx", "src/test/**", "src/**/*.test.{ts,tsx}"],
      reporter: ["text", "html"],
    },
  },
});
