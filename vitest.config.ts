import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Standalone test config, deliberately NOT merged with vite.config.ts, so the
// build-only plugins there (brotli/gzip pre-compression, manualChunks) never
// touch the test run. If vite.config.ts ever gains path aliases, mirror them here.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/main.tsx", "src/test/**", "src/**/*.test.{ts,tsx}"],
      reporter: ["text", "html"],
    },
  },
});
