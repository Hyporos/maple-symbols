## What

<!-- One or two sentences. Link the issue if there is one. -->

## Why

<!-- The user-facing reason or the bug being fixed. -->

## Checklist

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pass locally (CI runs the same)
- [ ] Tests added or updated for behaviour changes
- [ ] User-facing change → entry appended to `src/lib/changelog.ts` (newest entry goes **last**)
- [ ] `src/lib`, `src/state`, `src/contexts`, `tailwind.config.js`, or `src/global.css` changed → docs updated (`/sync-docs`)
- [ ] `SymbolData` changed → `STORAGE_VERSION` considered (a bump wipes user data; see `docs/ARCHITECTURE.md`)
- [ ] Route, title, or description changed → `index.html` pageMap, `src/App.tsx` SEO props, `src/components/SEO.tsx` defaults, and `public/sitemap.xml` all updated
