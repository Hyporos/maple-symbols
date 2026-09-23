# Regions: one site per MapleStory server

The plan of record for serving every MapleStory server (GMS, MSEA, KMS, JMS, TMS, CMS) with its own numbers, language, URLs and search presence. Read it before touching game data per region, routing by language or region, the head/SEO output, persistence, the reset clock, or the data watcher's regional coverage. What each region's numbers are, and how far to trust them, stays in GAME §5 and `docs/data-check/`; this doc is the design that uses them.

## 0. Decided (Brian, 2026-09-22)

- **Full regional data for all six servers.** Each server shows its own numbers, and every regional number carries a status (confirmed, sourced or unverified). A number nobody has published is hidden or marked, never guessed (D-6 decides which). This overturns the 2026-09-16 "interface only" decision in I18N §0.
- **All six editions launch together** in one release, not a pilot followed by one per release.
- **The weekly data check keeps reporting unreadable sources** as a GitHub issue (GAME §6).
- **Every other design decision**, made the same day (the §9 numbers):
  - D-2 **Edition URL plus an in-page "Server" switch**: each server has one address; the switch changes the numbers without changing the URL. Both live in **one header menu with two sections** (Brian, 2026-09-22): "Site version" links to the same page in each edition, and "Numbers from" picks the server whose numbers are shown, remembered in the browser; picking the page's own server clears it.
  - D-3 **Server codes in the address**: `/` (GMS), `/msea/`, `/kms/`, `/jms/`, `/tms/`, `/cms/`. The hreflang values still carry the languages (§2).
  - D-4 **All four pages in every edition, fully translated**, changelog and credits included: a KMS reader sees the changelog in Korean. This overturns I18N-7 (changelog history stays English) and means the changelog history is translated too.
  - D-5 **Head tags first, then full prerendered HTML** with React's own `prerender`; the custom router stays.
  - D-6 **An unpublished number is hidden** and the page says it is not published yet for that server. **Inferred numbers are shown** (Brian, 2026-09-22); their status stays in the data so the page can mark them.
  - D-7 **One save per server**; existing saves become the GMS save.
  - D-8 **The server's reset clock**, with a local-time hint (fixes KI-013).
  - D-9 **A suggestion banner** from the browser's language or time zone; never a redirect.
  - D-10 **System fonts** for Korean, Japanese and Chinese.
  - D-11 **Local meso units** (억/万, 億/万, 億/萬, 亿/万) in the calculator and prose, full digits in the Handbook tables.
  - D-12 **Machine draft plus a native player's review** for interface text; game names and terms only from the official clients.
  - D-14 **China: best effort on Vercel**, reachability measured after launch.
  - D-15 **No languages beyond the six servers' own** (no Spanish, Portuguese, French or German).
  - D-16 **Open API character import: later**, as its own decision.
  - D-17 **New analytics events** (server switch, suggestion banner); a same-domain Umami proxy only if China's data comes back empty.
  - D-18 **Grand Sacred gets its own `grand` type in the data**; where it sits in the interface is settled with the 2.0 visual design.
  - D-19 **MSEA uses its own client's terms** (Authentic Symbol, Authentic Force, Road to Extinction, Chew Chew Island, Lacheln, Moras, Hotel Arcs, Talahart, Geardrock). Symbol 8 is shown as "Arcs", the short form, as GMS shows "Arcus" (Brian, 2026-09-23).
  - D-20 **Verification by meta tags** in the prebuilt head (Naver, Daum, Baidu) **and DNS** (Google, Bing), each recorded in SEO §5.
- **Built on `v2`** (2026-09-22): phase 1 of §8. `src/lib/regions.json` holds every server's profile (reset offset, weekly structure, class gains, a status per kind of number, KMS's arcane costs) and `src/lib/regions.ts` reads it (`REGION_PROFILES`, `gameToday`, `weeklySymbolsFor`); `createInitialSymbols(region)` applies the overrides; every day count and date runs on the GMS game clock (KI-013 resolved); the watcher reads the GMS profile. No UI yet: the site still shows GMS only. Grand Sacred stays out of the data until the 2.0 design places it (D-18). Phase 2 too: saves are per server (`STORAGE_VERSION` 4, older saves become the GMS save) and the store has `region`, `regionOverride` and `setRegion`. The cards still compute with GMS; they read the store's `region` once phase 3 adds the server switch. Phase 3 too: the six editions in the router (`EDITIONS`, prefix-aware links), one prebuilt HTML file per page and edition with its own title, canonical, language and hreflang (untranslated editions `noindex`), a sitemap index with one sitemap per indexable edition, `cleanUrls` and per-edition fallbacks in `vercel.json`, the header server menu, and every card on the shown server's clock, weekly, class gains and meso costs (unpublished costs hidden: JMS and CMS today). Still to confirm on a Vercel preview: that `cleanUrls` serves `/kms/handbook` and the fallbacks rewrite as expected. Phase 5's terms table too (2026-09-22): catalogue copy names game terms by placeholder (`{sacredSymbol}`), filled per page from `TERMS[nameSet]` in `src/i18n/terms.ts`, page titles and descriptions included (`pageMetaFor`), so `/msea` reads "Authentic Symbol" and "Arcane Force" with MSEA's own region and quest names (I18N §10). Phase 8's watcher per region too (2026-09-23, §7 item 9): `pnpm check:data` checks every server against its own sources, with each server's expected numbers taken from its overlay, and reports one section per server. The rest of §3–§8 is not built.

## 1. What this overturns

- I18N §0 "interface only, numbers stay GMS" → each region gets its own game data (region dimension through symbols.json, store, persistence, maths).
- GAME §0/§5 "GMS only / never imply regional numbers" → regional numbers shown, each with a confirmed / sourced / unverified status.
- V2_PLAN, PLAYERS §1, I18N-1..4 (locale → "edition" = region + language), SEO-24 (per edition), SEO-6/7 (character counts wrong for CJK → display width), SEO-9 prerendering becomes a requirement, AGENTS gotcha 2 (one dataset → GMS base + region overlays), ARCHITECTURE D8 (double head write → prerendered heads).
- Existing bug: Handbook description claims "every MapleStory region" (KI-015).

## 2. Concepts

Facts: GMS NA and EU gateways both reset at UTC; GMS has no Spanish/Portuguese/French/German client. MSEA is English with its own data and KMS-derived names; SEA IPs cannot play GMS. KMS and JMS no longer have Reboot worlds, so the Catalyst world rule per region is unverified.

- **Region** = game data and rules (roster and release dates, rates, weekly structure, meso tables, class stat gains, Catalyst rules, reset clock, events, provenance status).
- **Language** = UI copy, number and date formatting, fonts.
- **Name set** = official client vocabulary: en-gms, en-msea, ko, ja, zh-Hant, zh-Hans.
- **Edition** = one indexable URL prefix (language + default region):

| Edition | Prefix | Language | Region | hreflang                     |
| ------- | ------ | -------- | ------ | ---------------------------- |
| gms     | /      | en       | gms    | en, x-default                |
| msea    | /msea/ | en       | msea   | en-SG, en-MY, en-PH, en-TH   |
| kms     | /kms/  | ko       | kms    | ko                           |
| jms     | /jms/  | ja       | jms    | ja                           |
| tms     | /tms/  | zh-Hant  | tms    | zh-Hant, zh-TW, zh-HK, zh-MO |
| cms     | /cms/  | zh-Hans  | cms    | zh-Hans, zh-CN               |

Self-canonical per edition; reciprocal hreflang in the page and the sitemap; an in-page "Server" override is client state only and never changes the URL.

## 3. Data model

- `symbols.json` stays the GMS base (plus Grand Sacred ids 13, 14); a JSON file per region under src/lib/regions (planned) holds sparse overrides by id. Every override field is `{ value, status, source, since }`, plus `availableFrom` for release timing.
- `REGION_PROFILES`: reset UTC offset (0 / 540 / 540 / 480 / 480 / 480; no zone uses DST), weekly day 4, weekly structure (KMS 1 × 240, others 3 × 80), Catalyst rule, class gains (KMS Xenon 66 / 132), default edition, name set, watcher sources.
- `createInitialSymbols(region)`. Move DEMON_AVENGER_HP / XENON_ALL_STAT / WEEKLY_SYMBOLS into data, and update the watcher's regexes in the same commit. ExpTable and CostTable read through `gameDataFor(region)`.
- Never generate unpublished tables. The KMS arcane table is the exception: it is derived from a rule confirmed three ways (`docs/data-check/kms-mesos-arcane.csv`).
- Grand Sacred: `SymbolType` gains "grand"; Sacred EXP table; max 11; power +10; no main stat (a bonus line instead); no Catalyst; the Sacred Symbol Selector covers Tallahart (Brian, in game, 2026-09-22) but not Geardock.
- Persistence: STORAGE_VERSION 4, `{ saves: { [region]: SavedSymbol[] }, regionOverride }`; existing saves migrate to gms; `setRegion` (built, phase 2). Phase 4 added `skipHydration` and `RestoreSaves` (`src/main.tsx`), so the prebuilt HTML and the first client render agree.
- Reset clock (fixes KI-013): `gameToday(region)` = UTC + fixed offset. Days count game days, the weekly lands on the game Thursday, completion dates are game dates, with a local-time hint. The `dayjs()` calls in Overview, Graph, calculator.ts, overview.ts and graph.ts take the game clock. Test instants on both sides of each offset.

## 4. SEO per region

- **Prerendering is required.**
  - Naver weakly renders JS and reportedly ignores hreflang (it relies on `lang` and a Korean sitemap).
  - Baidu needs static HTML.
  - Bing is unreliable on JS.
  - Yahoo Japan uses Google's results.
  - KakaoTalk, LINE and Discord previews read raw OG tags.
  - Step 1: the routes plugin emits dist/<edition>/<route>/index.html with a per-edition head (title, description, canonical, OG, `og:locale`, hreflang, manifest).
  - Step 2: React 19 `prerender` (`react-dom/static`) for the body, then `hydrateRoot`, with a mobile server snapshot for breakpoints.
  - `vercel.json` gets per-edition fallbacks before the catch-all; test them on a preview deploy.
- **Titles** (to be validated by native speakers and keyword tools):
  - MSEA: "MSEA Arcane & Authentic Symbol Calculator" (Brian, 2026-09-23; "MapleSEA …" ran to 61 columns with the brand, over SEO-6). Built: `{pageGame}` in the title is "MapleStory" on GMS and the server code elsewhere.
  - KMS: "메이플 심볼 계산기 (아케인·어센틱·그랜드)"
  - JMS: "メイプル シンボル計算機（アーケイン・オーセンティック）"
  - TMS: "新楓之谷 祕法符文・真實符文計算機"
  - CMS: "冒险岛 神秘徽章・原初徽章计算器"
- **Terms and competitors:**
  - KMS: 심볼 계산기 / 아케인심볼 계산기 / 심볼 강화 비용 (mitemprice.kr, devcomma, Inven, namu).
  - JMS: アーケインシンボル 計算 / シンボル シミュレーター, mesos are メル (shRoom, kiiten, wikiwiki).
  - TMS: 符文計算機, 祕法符文 and 秘法符文 both, 楓幣 (maple-kit.com, Bahamut).
  - CMS: 神秘徽章计算器, 金币 (mxd.dvg.cn, BWIKI).
  - MSEA: "maplesea symbol calculator".
  - The winning angle everywhere: region-correct numbers, a region-correct reset, and Grand Sacred coverage.
- **Sitemap index** with one sitemap per edition carrying `xhtml:link` alternates. Register with Naver Search Advisor, Daum, Baidu 搜索资源平台, Bing and IndexNow (verification in the prerendered head); Google's domain property already covers everything.
- **China:**
  - ICP licensing is out of reach.
  - `*.vercel.app` is blocked; custom domains usually work but can be slow, so measure with boce/17ce.
  - Google Fonts are blocked there, and none are used.
  - Umami Cloud reachability is unknown; fallback is a first-party proxy.
  - Add a zh-CN `Content-Language` meta.
  - Community links (NGA, Tieba, bilibili) matter most.
- **Structured data:** per-edition `inLanguage`, the local game name, localised OG images, a per-edition manifest.

## 5. Fonts

- Prerendered `<html lang>` per edition (Han unification).
- `:lang()` stacks with Maven Pro first, then:
  - ko: Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR, with `word-break: keep-all`
  - ja: Hiragino Sans, Meiryo, Noto Sans JP, with `line-break: strict`
  - zh-Hant: PingFang TC, Microsoft JhengHei
  - zh-Hans: PingFang SC, Microsoft YaHei
- Set explicit line-heights.
- Options: system stacks (0 KB, recommended at launch), or a build-time glyph subset later (UI text is static). Budget ≤ 100 KB of CJK font per page; LCP ≤ 2.5 s and CLS ≤ 0.1 per edition.

## 6. Text and translations

- **Catalogues:** src/i18n/ko, ja, zh-Hant and zh-Hans (planned), about 140 messages; `Catalogue<typeof en>` makes a missing key a type error.
- **Terms table** (built 2026-09-22, I18N §10): game terms are placeholders in the copy, filled from `TERMS[nameSet]` in `src/i18n/terms.ts`: Sacred ↔ Authentic, Power ↔ Force, Catalyst, Selector, Xenon, Demon Avenger, the Regular server. MSEA English gets "Authentic" with no second catalogue; `en-gms` and `en-msea` are complete, and each language's table lands with its catalogue. The meso word (메소 / メル / 楓幣 / 金币) changes only with the language, so each catalogue writes its own. MSEA terms still UNCONFIRMED (GMS wording or built from a confirmed term): the "Arcane"/"Authentic" toggle labels, "Arcane Symbol(s)", "Arcane Catalyst", "Symbol Selector", both typed Selector names, "Regular Server", "Demon Avenger", "Xenon".

- **Names:** `GAME_NAMES` (`src/i18n/gameNames.ts`), keyed by name set (built 2026-09-22): `en-msea` from `server-differences.csv` and the MSEA patch notes, `ja` and `zh-Hant` from their sheets (official sources; dormant until their catalogues). `ko` and `zh-Hans` wait for an official source (I18N §9).
- **SEO copy:** written per region, not translated.
- **Changelog and credits:** translated in full in every edition (D-4), including the history, so each new entry is written once and translated before release.
- **Credits:** add the regional sources.
- **Workflow:** a translator sheet per locale (key, English, context, maximum display width, screenshot, locked glossary). Machine draft plus a native player's review for UI copy only; names and terms only from official sources.
- **Formatting:**
  - `formatMesos`: 39억 3,010만 / 39億3010万 / 39億3010萬 / 39亿3010万. `Intl` compact notation rounds, so it needs a custom function. Built on `v2` 2026-09-22 in `src/lib/format.ts`, for prose only (the Calculator's meso line); 조/兆 above 10^12, none in Simplified Chinese, where 兆 is ambiguous.
  - `Intl` dates with a weekday, e.g. 2026. 9. 24.(목). Built 2026-09-23 as `formatDay` (`src/lib/format.ts`) for the completion and attainment dates. Brian chose: **English keeps ISO** (`2027-01-28`), Korean, Japanese and Chinese get their native form; graph ticks stay ISO.
  - Counters: 개 / 個 / 个.

## 7. Other region-useful features

1. Suggest an edition from `navigator.languages` and the time zone; never redirect.
2. Reset countdown: "00:00 KST = 09:00 your time".
3. Data freshness and status badge per edition.
4. "Coming to GMS" notes from KMS changes (30 % arcane cut, Xenon, one-clear weekly).
5. An event bonus list per region, with a toggle.
6. World rules per region (Catalyst).
7. Optional Nexon Open API character import (KMS, TMS and MSEA only). Needs a Vercel function, so it ends "no backend".
8. Analytics: `region_switch`, `edition_suggest`, `language_switch`; editions come free by path.
9. Watcher per region (built 2026-09-23; GAME §6 has the table of what is read and what is left to a person):
   - KMS: official notices, and its arcane overrides against the 1.2.419 rule. Open API notices not set up (they need a key in a secret).
   - JMS: notices; kiiten (daily caps, per-level costs and gains).
   - TMS: beanfun bulletins and the event pages they link (the Open API is not used).
   - CMS: the official text notices (the version pages are images); BWIKI's cost formulas and per-level gains, in one MediaWiki request because its firewall blocks bursts. Its prose dailies are not parsed.
   - MSEA: official updates.

   Expected values come from each overlay (`expectedFor` in `scripts/game-data.mjs`, pinned against `createInitialSymbols` by `src/test/dataWatcher.test.ts`); the report and the issue have one section per server. The community tables report only differences that are new since the last recorded read (`KNOWN_DIFFERENCES`), as information.

10. Off-page per region: Inven and Naver Cafe, X and wikiwiki, Bahamut, NGA / Tieba / bilibili, MSEA Facebook and Reddit.

## 8. Phases

0. Record the decisions (this doc, 2026-09-22) and rewrite the docs listed in §1.
1. ~~Region data layer in `src/lib`, plus the game clock (fixes KI-013 for GMS alone) and constants moved into data (watcher updated).~~ Done 2026-09-22.
2. ~~State and persistence (v4, per-region saves).~~ Done 2026-09-22; the SSR hydration guard moves to phase 4, where prerendering starts.
3. ~~Editions in routing, head-only static HTML per URL, sitemap index, `vercel.json` fallbacks~~ built 2026-09-22; verifying them on a preview is still open.
4. ~~Full SSG body~~ built 2026-09-22 (every page's HTML prerendered, phone layout, saves restored after hydration); the explanatory copy (SEO-9) is still to write.
5. ~~Terms table, `formatMesos`, CJK font stacks, width-based title test~~ (built 2026-09-22), ~~Intl dates~~ (2026-09-23).
6. All six editions together (Brian, 2026-09-22): the five translations and overlays are built side by side and ship in one release. Build `/msea/` first inside the branch anyway, because it needs no translation and proves the overlay machinery before the translated editions depend on it.
7. Measure every edition after launch (PageSpeed mobile, Search Console, Naver Search Advisor) and fix per edition.
8. Search-engine registrations and ~~the watcher per region~~ (the watcher built 2026-09-23, §7 item 9; its first scheduled runs from GitHub are still to watch, since BWIKI's firewall may refuse GitHub's addresses).
9. Optional: Open API import, event bonuses, "coming to GMS", extra GMS languages.

## 9. Decisions

All made on 2026-09-22; the answers are in §0. New open questions go here.
