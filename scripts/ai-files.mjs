// ---------------------------------------------------------------------------
// ai-files.mjs — Writes the files AI agents read into dist/ (docs/AI_SEARCH.md).
//
// Runs last in `pnpm build`, after prerender.mjs, from the same server build
// (dist-ssr/entry-server.js): /llms.txt, /llms-full.txt and one Markdown copy of
// every page of every edition served in English (/index.md, /handbook.md,
// /msea.md …). The generators live in src/lib/llms.ts. Fails the build if a file
// comes out empty.
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const dist = resolve("dist");
const { llmsTxt, llmsFullTxt, markdownFiles } = await import(
  pathToFileURL(resolve("dist-ssr/entry-server.js")).href
);

const generated = new Date().toISOString().slice(0, 10);
const files = {
  "/llms.txt": llmsTxt(generated),
  "/llms-full.txt": llmsFullTxt(generated),
  ...markdownFiles(generated),
};

for (const [path, text] of Object.entries(files)) {
  if (!text.trim()) throw new Error(`ai-files: ${path} is empty`);
  const file = resolve(dist, `.${path}`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

console.log(`ai-files: wrote ${Object.keys(files).length} files`);
