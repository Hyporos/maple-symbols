# Slash commands

Type these in Claude Code. `/help` lists every command available in a session; this page explains the ones that matter for this repo.

## Project commands (`.claude/commands/`)

| Command                               | What it does                                                                                                                                                                                                                                                                                                                                                                  | When to use                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `/release X.Y.Z [--dry-run]`          | Runs the whole release: checks the tree and CI gates, bumps `package.json`, appends the changelog entry (newest **last**), refreshes sitemap `lastmod` and the README badge, commits `Release vX.Y.Z`, opens the `development → main` PR, and after merge tags `vX.Y.Z` and merges `main` back. Asks before each irreversible step. `--dry-run` previews the file edits only. | Every release. Needs `gh` authenticated or the GitHub MCP tools.                 |
| `/sync-docs [area]`                   | Diffs the code since `AGENTS.md`/`docs/` were last committed, re-reads the affected code, edits the doc sections the "Keep the docs honest" table maps to, updates `KNOWN_ISSUES.md`, and runs the docs and metadata tests.                                                                                                                                                   | After a feature lands, or when the session-start banner says the docs are stale. |
| `/log-mistake [what went wrong]`      | Appends a formatted entry to `docs/MISTAKES.md` (id, date, area, what, root cause, rule, where). If the root cause repeats, promotes a one-line rule to the top of that file and to `AGENTS.md`. With no argument it reconstructs the mistake from the conversation.                                                                                                          | Whenever you correct me, or I find I was wrong.                                  |
| `/new-component Name [folder] [kind]` | Scaffolds `src/components/<folder>/<Name>.tsx` in the house style (banner comment, `NameProps`, `cn()`, tokens, the card/section/primitive recipe from `docs/DESIGN_SYSTEM.md`) plus a colocated `Name.test.tsx`, then runs the tests and lint. Kinds: `card`, `section`, `primitive` (goes in `ui/`).                                                                        | Any new UI piece.                                                                |

## Built-in and plugin commands worth knowing

| Command                                                  | What it does                                                                                                                                                         |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/code-review [PR#] [level]`                             | Reviews the current diff (or a PR) for correctness and simplification. `/code-review ultra` runs a multi-agent cloud review of the branch. `--fix` applies findings. |
| `/simplify`                                              | Reviews changed code for reuse, simplification and efficiency, then applies the cleanups (no bug hunting).                                                           |
| `/security-review`                                       | Security review of the pending changes on the branch.                                                                                                                |
| `/loop [interval] <command>`                             | Repeats a prompt or command on an interval (for example polling CI).                                                                                                 |
| `/schedule`                                              | Creates or manages scheduled cloud agents that run on a cron.                                                                                                        |
| `/init`                                                  | Bootstraps a `CLAUDE.md` for a repo that has none (this repo already has `AGENTS.md`; don't run it here).                                                            |
| `/vercel:deploy [prod]`, `/vercel:status`, `/vercel:env` | Deploy, inspect, and manage env vars for the Vercel project (the Vercel CLI must be installed and logged in).                                                        |
| `/fewer-permission-prompts`                              | Scans past sessions and adds an allowlist of safe read-only commands to `.claude/settings.json`.                                                                     |
| `/remember:remember`                                     | Saves session state so the next session can continue where this one stopped.                                                                                         |

Other plugin families you have installed (`/superpowers:*`, `/figma:*`, `/expo:*`, `/mongodb:*`, `/chrome-devtools-mcp:*`, `/supabase:*`) are general-purpose skills, not project workflows; `/help` shows their one-line descriptions.

## How commands work

A command is a Markdown file in `.claude/commands/` whose body is the prompt I receive, with `$ARGUMENTS` replaced by what you typed after the name. The frontmatter holds `description`, an optional `argument-hint`, and `allowed-tools`. To add one, copy an existing file; keep the steps explicit and name the docs the command must read first.
