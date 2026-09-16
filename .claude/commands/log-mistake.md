---
description: Append a mistake to docs/MISTAKES.md; promote a rule to AGENTS.md when a pattern repeats
argument-hint: <what went wrong> (optional; reconstructed from the conversation if empty)
---

Log a mistake in `docs/MISTAKES.md`, following that file's format exactly.

What went wrong: $ARGUMENTS

Steps:

1. Read `docs/MISTAKES.md`. Take the next entry id (`M-NNN`).
2. If no description was given, reconstruct it from this conversation: what I did, why it was wrong, how it was discovered (user correction, failing test, wrong assumption).
3. Append an entry to the **Log** section (newest last): id, today's date (YYYY-MM-DD), area tag, what happened, root cause, the rule going forward, and the file or identifier involved. Six lines or fewer.
4. Search the Log for the same root cause. If this is the second occurrence, or it cost real time, add a one-line rule to **Distilled rules** at the top of `docs/MISTAKES.md` and to the **Rules for working here** section of `AGENTS.md`, each referencing the id.
5. Show me the diff.
