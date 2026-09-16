# 2.0 overhaul plan

Working notes for the rewrite. Decisions here were made by Brian on 2026-09-16; change them here first, then act.

## Decisions so far

- **Scope**: everything: visual redesign, state/data model and persistence, routing/pages/new features, framework and major dependencies.
- **Branch**: a long-lived `v2` branch off `development`, created once the dependency upgrades are in; `development`/`main` stay releasable for 1.x fixes. Merge when 2.0 is ready.
- **Known issues** (`docs/KNOWN_ISSUES.md`): folded into 2.0. Current behaviour is pinned by tests marked with the `KI-` id; each fix is a deliberate test change plus a move to **Resolved**.
- **Preparations chosen**: characterization tests (done), extract logic seams into `src/lib` (done), dependency upgrades first and separately (React 19, Tailwind 4, tooling minors; Node to the latest 22 LTS). Not chosen: a persistence migration up front (part of the 2.0 data-model work), tagging 1.4.0 first, `noUncheckedIndexedAccess` (apply on the v2 code as it is written).

## What the safety net pins (as of 2026-09-16)

- 28 test files, 181 tests, about 92% statement coverage; `pnpm test`.
- Component tests assert **what the user sees and does** (text, roles, labels, store effects), never class names or DOM shape, so a redesigned component passes them if it keeps the behaviour. When a behaviour changes on purpose, change the test in the same commit and say why.
- Pure modules with table-driven tests, reusable as-is by the new UI: `src/lib/game.ts`, `src/lib/inputs.ts`, `src/lib/calculator.ts`, `src/lib/tools.ts`, `src/lib/overview.ts`, `src/lib/graph.ts`, `src/lib/utils.ts`, `src/lib/data.ts`, `src/hooks/usePower.ts`.
- Meta-tests: `src/test/docs.test.ts` (docs cite real paths, tokens and issues) and `src/test/seo.test.tsx` (page metadata agrees across its sources; extend `pageMap` when routes change).

## How to use it during the rewrite

1. Build the new component; run the old component test against it. Green means the behaviour survived.
2. Red for a reason you intended: edit the expectation, reference the decision (KI id or this file), commit together.
3. Red for a reason you did not intend: that is the net working. Fix the component.
4. New behaviour: add cases to the lib tables first, then a component test for the wiring.

## Dependency upgrades (first, on the old code, one commit each)

Chosen: React 18.3 → 19 (+ `@types/react*` 19, `@vitejs/plugin-react` 4 → 6), Tailwind 3 → 4 (config moves to a CSS `@theme`; the token table in `docs/DESIGN_SYSTEM.md` and its docs test follow; `prettier-plugin-tailwindcss` 0.5 → 0.6), tooling minors (eslint, typescript-eslint, lint-staged, dayjs, zustand, recharts patch), and jsdom 30 once Node is on the latest 22 LTS (add an `engines` field then). Peer check on 2026-09-16: recharts 3, @testing-library/react 16, react-error-boundary, zustand and @floating-ui/react 0.24 all accept React 19.

After each upgrade: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; log surprises in `docs/MISTAKES.md`.

## Open questions for 2.0 (ask before designing)

- Data model: keep `SymbolData` with NaN sentinels, or move to `level: number | null`? Either way, write a real `migrate` by `id` so returning users keep their levels (KI-001).
- Derived fields: compute on read (like Graph) instead of caching in the store (KI-002).
- Routing: keep the custom router, or adopt a library once there are more pages?
- Metadata: collapse the four metadata sources into one `routes` module that the inline script and `SEO.tsx` both read.
- Visual direction: the new look, and whether the fixed 360 px phone cards and fixed pane heights survive.
