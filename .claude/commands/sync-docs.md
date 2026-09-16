---
description: Diff the code since the docs last changed and bring AGENTS.md + docs/ back in sync
argument-hint: [area to focus on, optional]
allowed-tools: Bash(git *), Bash(pnpm *)
---

Bring `AGENTS.md` and `docs/` back in sync with the code. Focus (optional): $ARGUMENTS

Context:

- Last doc commit: !`git log -1 --format='%h %ad %s' --date=short -- AGENTS.md docs`
- Uncommitted changes: !`git status --short`

Steps:

1. Find what changed: `git diff --stat <last-doc-commit>..HEAD -- src vite.config.ts vitest.config.ts package.json vercel.json index.html`, plus the uncommitted changes above.
2. Map each changed file to doc sections using the table in `AGENTS.md` → "Keep the docs honest".
3. For each affected section, read the current code (never rely on memory) and edit the doc to match. Prefer identifiers over line numbers.
4. `docs/KNOWN_ISSUES.md`: move fixed issues to **Resolved** with the commit; add any new issue that is evident from the diff.
5. Run `pnpm test src/test/docs.test.ts src/test/seo.test.tsx` (no `--`) so cited paths, tokens, and metadata are verified.
6. Report what changed in the docs and what you deliberately left alone.
