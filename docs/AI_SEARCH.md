# AI search — how agents and LLMs find, read and cite Maple Symbols

Goal: when someone asks ChatGPT, Claude, Perplexity, Gemini, Copilot or a regional assistant "how many Arcane Symbols to max" or "best symbol calculator for KMS", the answer quotes this site's numbers and links it. The companion of `docs/SEO.md` (classic search): SEO makes the pages rank; this doc makes them easy for a machine to read, trust and cite. Created 2026-09-23 at Brian's request; keep it current as the work goes on (AGENTS rule 4 applies to the files listed in §1).

The site is an interactive app, which is the worst shape for an agent: most of its value is computed in the browser. Everything here exists to hand an agent the same facts as plain text, generated from the same data, so it never has to run the app or guess.

## 0. State (2026-09-23, `v2`, not live yet)

Built on `v2`, ships with 2.0: `llms.txt`, `llms-full.txt`, a Markdown copy of every page of every English edition, a `rel="alternate" type="text/markdown"` link to it and a `rel="describedby"` link to `llms.txt` in each page's head, `robots.txt` naming the AI crawlers, and `text/markdown` + `noindex` headers for the copies. Production (1.x) has none of it.

## 1. Where it lives

| What                                            | Where                                                                                                                                   |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| The generators (pure, from the site's own data) | `src/lib/llms.ts`: `llmsTxt`, `llmsFullTxt`, `markdownFiles`, `pageMarkdown`; tests in `src/lib/llms.test.ts`                           |
| Which editions get Markdown, and the file paths | `markdownEditions`, `markdownPath`, `markdownUrl` in `src/lib/routes.ts` (the head link needs them, and routes.ts must stay JSON-free)  |
| Writing the files                               | `scripts/ai-files.mjs`, last step of `pnpm build`, from the server bundle (`dist-ssr/entry-server.js`, which re-exports the generators) |
| The head link to each page's copy               | `headLinks` in `src/lib/routes.ts` (so it is in every prebuilt HTML file)                                                               |
| Crawler policy                                  | `public/robots.txt`                                                                                                                     |
| Content types and `noindex` for the copies      | `vercel.json` `headers` (`/(.*)\.md`, `/llms(.*)\.txt`)                                                                                 |
| Freshness pings                                 | `pnpm indexnow` after a release (SEO §5), which also reaches Copilot through Bing                                                       |

Files written (production build): `/llms.txt`, `/llms-full.txt`, `/index.md`, `/handbook.md`, `/changelog.md`, `/credits.md`, and the same under `/msea/`. The dev server does not serve them (they come from the server bundle); run `pnpm build && pnpm preview`.

## 2. Rules

- **AI-1 Every fact an agent can read comes from the data, never typed into a text file.** The Markdown copies and `llms.txt` are generated from `symbols.json`, `regions.json`, `ratioData.ts`, the terms and names tables and the catalogue, at build time. A patch that changes a number changes the text in the same build. `src/lib/llms.test.ts` checks the totals against the data.
- **AI-2 Unpublished numbers stay hidden in the text too** (REGIONS D-6): a cost the site hides is written "not published yet for <server>", never guessed. Each calculator copy lists the trust status per kind of number (confirmed, sourced, inferred, unpublished) and the sources line from `regions.json`.
- **AI-3 Each edition speaks its own server's words** (term placeholders and name sets, I18N §10): MSEA's copy says "Authentic Symbol" and "Road to Extinction". No term placeholder may survive into a file (tested).
- **AI-4 The HTML page is the canonical; the Markdown is a copy.** Copies are served `noindex` (so search results show the page, not the file) and each page links its copy with `rel="alternate" type="text/markdown"`. `llms.txt` itself stays indexable.
- **AI-5 Every AI crawler is allowed, and named.** Training, search and user-triggered fetchers alike (Brian, 2026-09-23: visibility beats withholding for a free tool). `robots.txt` lists them in one `Allow: /` group so the intent is on record; the catch-all `User-agent: *` already allows everything.
- **AI-6 Only English editions get copies until the translations are published.** A translated edition gets its copies (in its own language) when its catalogue moves to `PUBLISHED_LANGUAGES`; see the backlog.
- **AI-8 A Markdown or text file that does not exist is a 404**, never the calculator (the SEO-3 fallback skips `.md` and `.txt`), so an agent can tell a missing copy from a real one. Found on a preview on 2026-09-23: `/kms.md` returned the calculator's HTML labelled `text/markdown`.
- **AI-7 Say who made it and when.** Every copy names its source page, server and generation date; `llms.txt` names the editions. Credit the GitHub handle, never a person's name (the site never shows one).

## 3. Crawlers (from each operator's own docs, checked 2026-09-23)

All allowed (AI-5), and named in `public/robots.txt`. Only documented user agents are listed there; a name seen only in blogs is left out.

| Operator        | Training                                                                         | Search index                                       | Fetch for a user        | Honours robots.txt                                         |
| --------------- | -------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- | ---------------------------------------------------------- |
| OpenAI          | GPTBot                                                                           | OAI-SearchBot (needed to appear in ChatGPT search) | ChatGPT-User            | GPTBot and OAI-SearchBot yes; ChatGPT-User "may not apply" |
| Anthropic       | ClaudeBot                                                                        | Claude-SearchBot                                   | Claude-User             | all three, plus `Crawl-delay`                              |
| Perplexity      | none claimed                                                                     | PerplexityBot                                      | Perplexity-User         | the bot yes; the user fetcher "generally ignores"          |
| Google          | Google-Extended (a token only: Gemini apps, not Search, AI Overviews or AI Mode) | Googlebot                                          | user-triggered fetchers | Googlebot yes; user fetchers generally not                 |
| Apple           | Applebot-Extended (a token only)                                                 | Applebot                                           | none                    | yes                                                        |
| Meta            | Meta-ExternalAgent                                                               | Meta-WebIndexer                                    | Meta-ExternalFetcher    | the fetcher may not                                        |
| Amazon          | Amazonbot                                                                        | Amzn-SearchBot                                     | Amzn-User               | yes; the user fetcher may not                              |
| Moonshot (Kimi) | KimiBot                                                                          | Kimi-SearchBot                                     | Kimi-User               | yes; the user fetcher may not                              |
| Common Crawl    | CCBot (an open dataset many models train on)                                     | none                                               | none                    | yes                                                        |
| Microsoft       | none separate                                                                    | Bingbot, which also grounds Copilot                | none                    | yes                                                        |
| ByteDance       | Bytespider (no official docs)                                                    | none documented                                    | none documented         | reportedly not                                             |
| Naver, Baidu    | none documented ("Baiduspider-AI" is a blog rumour, not a Baidu token)           | Yeti, Baiduspider (covered by `*`; SEO §5)         | none documented         | yes                                                        |

None of these crawlers runs JavaScript (Vercel's study of GPTBot fetches found none, and the same holds for the others), so what an AI reads is the prebuilt HTML and these text files, never the rendered app.

## 4. What actually helps (the evidence, checked 2026-09-23)

- **`llms.txt` is cheap and unproven.** No answer engine commits to reading it, and Google says Search ignores it (AI optimization guide, 2026-07-10). An Ahrefs study (2026-06) found 97 % of 38k files got no requests; most fetches came from coding agents. Kept because it costs nothing and coding agents do read it; not worth more investment.
- **Markdown copies**: only coding agents ask for Markdown (`Accept: text/markdown`); ChatGPT, Claude.ai and Perplexity fetch the HTML. Generated, so free to keep; not the main lever.
- **The visible HTML is the main lever.** Answer engines quote the page text: real `<table>`s (the Handbook already prebuilds them), sentences stating the facts with their numbers, and a visible Q&A. That is SEO-9's copy (backlog AI-B).
- **Freshness and provenance**: AI-cited pages skew fresher than organic results (Ahrefs, 17M citations). A visible "numbers from <server>, checked <date>" line, `dateModified` and a true sitemap `lastmod` are worth having (AI-B).
- **Structured data** is not needed for AI features (Google), and adding JSON-LD moved citations by a few percent either way (Ahrefs, 2026-05). FAQ rich results were dropped (2026-05-07); the SoftwareApplication rich result needs real ratings, which the site must not invent. The WebApplication JSON-LD stays as it is.
- **Freshness pings**: IndexNow keeps Bing, and so Copilot, current: run `pnpm indexnow` after data changes as well as releases.

## 5. Backlog

| #    | What                                                                                                                                                                                         | Why                                                                                    |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| AI-A | Markdown copies of the translated editions, in their own language (AI-6). **Due**: the four were published for 2.0 on 2026-09-23                                                             | Naver, Baidu and the Japanese and Chinese assistants read their own language first     |
| AI-B | The SEO-9 explanatory copy on the pages themselves (SEO §3 draft), with a visible "numbers from <server>, checked <date>" line and a short Q&A, once the 2.0 design places it                | Answer engines quote visible page text; today only the Markdown copy carries the prose |
| AI-C | Check the live files after the 2.0 release: content types, `noindex` on the copies, `llms.txt` reachable, and whether any crawler fetches them (Vercel logs, Umami can't see)                | M-016: hosting behaviour is verified on a real deployment                              |
| AI-D | The JSON-LD is written in the browser (`SEO.tsx`), so crawlers that run no JavaScript never see it; move it into the prebuilt head, with `dateModified`, if it is ever worth it              | Low value (§4); recorded so nobody assumes AI crawlers read it                         |
| AI-E | Measure: Bing Webmaster Tools' AI Performance report, Search Console's Generative AI report (impressions only), and Umami referrers (chatgpt.com, perplexity.ai, claude.ai, copilot, gemini) | The only way to know whether any of this works (ANALYTICS)                             |
| AI-F | Idea for 2.0: WebMCP (Chrome's public trial) lets a page offer tools to in-browser agents, such as "days to max for these inputs"; the API is still moving                                   | A calculator is the kind of page an agent would call rather than read                  |
