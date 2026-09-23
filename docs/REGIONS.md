# Regions: one site per MapleStory server

The plan of record for serving every MapleStory server (GMS, MSEA, KMS, JMS, TMS, CMS) with its own numbers, language, URLs and search presence. Read it before touching game data per region, routing by language or region, the head/SEO output, persistence, the reset clock, or the data watcher's regional coverage. What each region's numbers are, and how far to trust them, stays in GAME §5 and `docs/data-check/`; this doc is the design that uses them.

## 0. Decided (Brian, 2026-09-22)

- **Full regional data for all six servers.** Each server shows its own numbers, and every regional number carries a status (confirmed, sourced or unverified). A number nobody has published is hidden or marked, never guessed (D-6 decides which). This overturns the 2026-09-16 "interface only" decision in I18N §0.
- **All six editions launch together** in one release, not a pilot followed by one per release.
- **The weekly data check keeps reporting unreadable sources** as a GitHub issue (GAME §6).
- Still open: D-2 to D-20 in §9. Nothing in §3–§8 is built yet.

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

| Edition | Prefix    | Language | Region | hreflang                     |
| ------- | --------- | -------- | ------ | ---------------------------- |
| gms     | /         | en       | gms    | en, x-default                |
| msea    | /msea/    | en       | msea   | en-SG, en-MY, en-PH, en-TH   |
| kms     | /ko/      | ko       | kms    | ko                           |
| jms     | /ja/      | ja       | jms    | ja                           |
| tms     | /zh-hant/ | zh-Hant  | tms    | zh-Hant, zh-TW, zh-HK, zh-MO |
| cms     | /zh-hans/ | zh-Hans  | cms    | zh-Hans, zh-CN               |

Self-canonical per edition; reciprocal hreflang in the page and the sitemap; an in-page "Server" override is client state only and never changes the URL.

## 3. Data model

- `symbols.json` stays the GMS base (plus Grand Sacred ids 13, 14); a JSON file per region under src/lib/regions (planned) holds sparse overrides by id. Every override field is `{ value, status, source, since }`, plus `availableFrom` for release timing.
- `REGION_PROFILES`: reset UTC offset (0 / 540 / 540 / 480 / 480 / 480; no zone uses DST), weekly day 4, weekly structure (KMS 1 × 240, others 3 × 80), Catalyst rule, class gains (KMS Xenon 66 / 132), default edition, name set, watcher sources.
- `createInitialSymbols(region)`. Move DEMON_AVENGER_HP / XENON_ALL_STAT / WEEKLY_SYMBOLS into data, and update the watcher's regexes in the same commit. ExpTable and CostTable read through `gameDataFor(region)`.
- Never generate unpublished tables. The KMS arcane table is the exception: it is derived from a rule confirmed three ways (`docs/data-check/kms-mesos-arcane.csv`).
- Grand Sacred: `SymbolType` gains "grand"; Sacred EXP table; max 11; power +10; no main stat (a bonus line instead); no Catalyst; the Selector question is open.
- Persistence: STORAGE_VERSION 4, `{ saves: { [region]: SavedSymbol[] }, regionOverride? }`; existing saves migrate to gms; `setRegion`; `skipHydration` plus rehydrate on mount for SSR.
- Reset clock (fixes KI-013): `gameNow(region)` = UTC + fixed offset. Days count game days, the weekly lands on the game Thursday, completion dates are game dates, with a local-time hint. The `dayjs()` calls in Overview, Graph, calculator.ts, overview.ts and graph.ts take the game clock. Test instants on both sides of each offset.

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
  - MSEA: "MapleSEA Arcane & Authentic Symbol Calculator"
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
- **Terms table:** split game terms out of the copy into a `terms[nameSet]` table, taken from the clients:
  - Sacred ↔ Authentic, and the meso word: 메소 / メル / 楓幣 / 金币
  - Catalyst, Selector, Xenon, Demon Avenger
  - Regular/Heroic server names

  MSEA English then gets "Authentic" with no second catalogue.

- **Names:** `GAME_NAMES` (`src/i18n/gameNames.ts`) filled from the `docs/data-check/names-*` sheets, keyed by name set, plus en-msea.
- **SEO copy:** written per region, not translated. The changelog stays English, with one line in the reader's language.
- **Credits:** add the regional sources.
- **Workflow:** a translator sheet per locale (key, English, context, maximum display width, screenshot, locked glossary). Machine draft plus a native player's review for UI copy only; names and terms only from official sources.
- **Formatting:**
  - `formatMesos`: 39억 3,010만 / 39億3010万 / 39億3010萬 / 39亿3010万. `Intl` compact notation rounds, so it needs a custom function.
  - `Intl` dates with a weekday, e.g. 2026. 9. 24.(목).
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
9. Watcher per region:
   - KMS: official notices; Open API notices (key in a secret).
   - JMS: notices; kiiten.
   - TMS: beanfun or Open API.
   - CMS: BWIKI is MediaWiki, so the same parser as GMS works.
   - MSEA: official updates.

   Expected values come from each overlay; label issues per region.

10. Off-page per region: Inven and Naver Cafe, X and wikiwiki, Bahamut, NGA / Tieba / bilibili, MSEA Facebook and Reddit.

## 8. Phases

0. Record the decisions (this doc, 2026-09-22) and rewrite the docs listed in §1.
1. Region data layer in `src/lib`, plus the game clock (fixes KI-013 for GMS alone) and constants moved into data (watcher updated).
2. State and persistence (v4, per-region saves).
3. Editions in routing, head-only static HTML per URL, sitemap index, `vercel.json` fallbacks verified on a preview.
4. Full SSG body plus explanatory copy.
5. Terms table, `formatMesos`, Intl dates, CJK font stacks, width-based title test.
6. All six editions together (Brian, 2026-09-22): the five translations and overlays are built side by side and ship in one release. Build `/msea/` first inside the branch anyway, because it needs no translation and proves the overlay machinery before the translated editions depend on it.
7. Measure every edition after launch (PageSpeed mobile, Search Console, Naver Search Advisor) and fix per edition.
8. Search-engine registrations and the watcher per region.
9. Optional: Open API import, event bonuses, "coming to GMS", extra GMS languages.

## 9. Decisions still open (recommendation first)

- D-2 Edition model: edition URL + in-page server override / fixed pairs / full language × region matrix.
- D-3 Prefixes: language tags /ko/ /ja/ /zh-hant/ /zh-hans/ + /msea/ / server codes /kms/… / country codes /kr/….
- D-4 Pages per edition: / and /handbook localised, changelog and credits English only / all four / all four with noindex.
- D-5 Prerender: head-only now, React 19 SSG next / a framework (Vike, React Router 7, Astro) / head-only for good.
- D-6 Unverified regional numbers: hide with "not published yet" / show GMS labelled / labelled estimate.
- D-7 Saves: one slot per region / shared / per region with "copy from GMS".
- D-8 Reset clock: game days in the region's zone with a local hint / local calendar / both.
- D-9 Detection: suggestion banner / nothing / geo redirect (breaks crawling).
- D-10 CJK fonts: system stacks / glyph subsets / webfont.
- D-11 Mesos: East Asian units in the calculator and prose, full digits in tables / everywhere / never.
- D-12 Translators: machine draft + native review / volunteers / paid.
- D-14 China: best effort on Vercel and measure / HK mirror / no Baidu effort.
- D-15 Other GMS languages (pt-BR, es, fr, de): after Umami shows demand / now / never.
- D-16 Open API import: later, as its own decision / now / never.
- D-17 Analytics: the new events, plus a Umami proxy only if CN data is missing.
- D-18 Grand Sacred in the UI: a `grand` type in the data either way; tab vs inside Sacred is a 2.0 design call.
- D-19 MSEA vocabulary: the MSEA client's terms / GMS terms.
- D-20 Search-engine verification: meta tags in the prerendered head for Naver and Baidu, DNS for Google and Bing.
