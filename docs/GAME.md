# Game reference (MapleStory, GMS)

What the calculator models about the game, where each number lives in the code, and how far each one can be trusted. Read before touching game data, adding a symbol (Grand Sacred), or answering a player's "is this number right?". The data itself stays in `src/lib/symbols.json`, `src/lib/game.ts` and `src/lib/ratioData.ts`, which the code reads; this doc explains it, records provenance, and quotes numbers only inside the marked tables, which `src/test/docs.test.ts` checks against the data both ways.

## 0. Scope and trust (read first)

- **GMS only.** Every number is Global MapleStory. Brian confirmed on 2026-09-22 that Heroic (Reboot) and Interactive worlds use the same symbol numbers; the one difference the site shows is that the Catalyst is Interactive-only ("Regular Server Only" in the Tools copy).
- **Other regions were researched, not confirmed** (§5): the same game everywhere, with rates arriving on each region's own patch date and names of their own. Today the site shows GMS numbers only, and the page must never imply they are another region's. Brian decided on 2026-09-22 that 2.0 shows each server's own numbers, each with its status (`docs/REGIONS.md`); until then this rule stands.
- **Trust comes from §7.** The site was built from the Credits resources (MapleStory Fandom wiki, StrategyWiki, Orange Mushroom's blog) with no record of which number came from where. §7 now logs every check. A number is **confirmed** once a row says Brian saw it in game, **sourced** once a dated source agrees, and otherwise **unverified**. As of 2026-09-22 the daily and weekly rates, the reset times, the Catalyst, the per-level stat gains and the Grand Sacred basics are confirmed; the EXP and meso tables are sourced, with one EXP row confirmed.

## 1. Symbols

Twelve symbols in two families. Arcane Symbols (Arcane River regions) level to 20 and give Arcane Power; Sacred Symbols (Grandis regions) level to 11 and give Sacred Power. Ids are permanent (saved progress is keyed on them, AGENTS gotcha 2); JSON order is display order only.

<!-- symbols:start -->

| id  | Symbol            | Type   | Daily quest                           | Daily symbols | Weekly quest    | Extra quest    | Mesos to max  |
| --- | ----------------- | ------ | ------------------------------------- | ------------- | --------------- | -------------- | ------------- |
| 1   | Vanishing Journey | arcane | Vanishing Journey Research            | 20            | Erda Spectrum   | Reverse City   | 252,470,000   |
| 2   | Chu Chu Island    | arcane | Chu Chu's Finest Cuisine              | 20            | Hungry Muto     | Yum Yum Island | 306,050,000   |
| 3   | Lachelein         | arcane | A Night's Peace in Lachelein          | 40            | Midnight Chaser | –              | 359,630,000   |
| 4   | Arcana            | arcane | Peace in Arcana                       | 40            | Spirit Savior   | –              | 413,210,000   |
| 5   | Morass            | arcane | Save the Morass                       | 40            | Ranheim Defense | –              | 466,790,000   |
| 6   | Esfera            | arcane | Esfera Research Orders                | 40            | Esfera Guardian | –              | 520,370,000   |
| 7   | Cernium           | sacred | Cernium Research                      | 30            | –               | –              | 3,930,100,000 |
| 8   | Arcus             | sacred | Clean Up Around Hotel Arcus           | 15            | –               | –              | 4,751,600,000 |
| 9   | Odium             | sacred | Odium Area Expedition                 | 15            | –               | –              | 5,573,300,000 |
| 10  | Shangri-La        | sacred | Shangri-La Contamination Purification | 15            | –               | –              | 6,395,000,000 |
| 11  | Arteria           | sacred | Defeat the Arteria Remnants           | 15            | –               | –              | 7,216,900,000 |
| 12  | Carcion           | sacred | Carcion Recovery Support              | 15            | –               | –              | 8,038,600,000 |

<!-- symbols:end -->

**Daily counts are post-v.271** (see §7): GMS doubled them on 2026-09-09, the site was updated to match on 2026-09-22 (KI-014), and Brian confirmed every one in game the same day. Vanishing Journey and Chu Chu show their base rate, which the extra quest doubles to 40; the other four arcane regions give 40 outright.

"Mesos to max" is the sum of the symbol's `mesosRequired`, level 1 to max. Every meso table follows one formula per family, which reproduces all 174 per-level costs in `symbols.json` exactly and both Grand Sacred totals Brian saw in game (checked 2026-09-22). For the upgrade from level L: arcane costs 10,000 × ⌊(L² + 11) × (k + 0.1L)⌋ with k = 8, 10, 12, 14, 16, 18 for ids 1–6; sacred costs 100,000 × ⌊(9L² + 20L) × (k − 0.6L)⌋ with k = 13.2, 15, 16.8, 18.6, 20.4, 22.2 for ids 7–12, and 39.8 (Tallahart) or 48.8 (Geardock). Compute it in integer tenths (or add a tiny epsilon before the floor): plain floating point gets 5 of the 174 wrong, because 15 × 8.2 comes out as 122.99…. So a new symbol or a flat cost change (KMS's 30 % arcane cut, §5) can be checked by computing it rather than by typing a table. The per-level EXP tables are shared by every symbol of a type (`arcaneExpRequired`, `sacredExpRequired` in `symbols.json`, loaded as each symbol's `symbolsRequired`); the per-level meso tables are per symbol. The Handbook page renders all of them.

## 2. Rules and constants

<!-- constants:start -->

| Rule                                    | Arcane | Sacred | In code                                        |
| --------------------------------------- | ------ | ------ | ---------------------------------------------- |
| Max level                               | 20     | 11     | `MAX_LEVEL`                                    |
| Symbols from level 1 to max             | 2679   | 4565   | sum of `arcaneExpRequired`/`sacredExpRequired` |
| Weekly quest symbols (per weekly reset) | 240    | –      | `WEEKLY_SYMBOLS`                               |
| Extra quest daily multiplier            | 2      | 1.5    | `EXTRA_MULTIPLIER`                             |
| Catalyst keeps this share of total EXP  | 0.8    | 0.6    | `CATALYST_RETENTION`                           |
| Power per level                         | 10     | 10     | `POWER_PER_LEVEL`                              |
| Base power at level 1 (on top)          | 20     | 0      | `ARCANE_BASE_POWER`                            |
| Max power per symbol                    | 220    | 110    | `MAX_POWER_PER_SYMBOL`                         |
| Main stat per level                     | 100    | 200    | `MAIN_STAT_PER_LEVEL`                          |

<!-- constants:end -->

How the calculator uses them (the code-facing version is AGENTS.md's domain cheat sheet):

- **Daily rate** = daily symbols × extra multiplier when the extra quest is on, 0 when the daily is off. Only Vanishing Journey and Chu Chu have an extra quest; only arcane symbols have a weekly. The sacred extra multiplier (1.5) has no counterpart in the game, since no sacred region has an extra quest, so it never applies.
- **Days to go** count from tomorrow (today's quests are assumed done) and credit the weekly on each counted Thursday. The calendar is the visitor's local one; see §3.
- **Power**: arcane `level × 10 + 20`, sacred `level × 10`. The Graph adds +10 per level-up.
- **Catalyst** (Interactive worlds only): transfers a symbol once within a world, keeping 80 % (arcane) or 60 % (sacred) of its cumulative EXP; needs level 2 or higher. The Tools copy states this as "-20% EXP" / "-40% EXP" (literal in `src/i18n/en/tools.ts`, not derived from `CATALYST_RETENTION`).
- **Symbol Selector**: adds a chosen number of symbols and levels up as far as they reach.
- **Class exceptions** in the next-level panel: Demon Avenger gains HP instead of main stat (2,100 arcane / 4,200 sacred per level) and Xenon gains all stat (48 / 96); constants at the top of `src/components/Calculator/Calculator.tsx`. At level 1 a symbol gives 6,300 / 10,500 HP or 144 / 240 all stat, which is the same 21 HP or 0.48 all stat per point of the 300 / 500 level-1 main stat. So there is no separate per-symbol bonus, and the panel (which shows the gain per level-up) needs nothing more.
- **Damage ratios** (Handbook): arcane by the percentage of the map's requirement met, sacred by the difference from the requirement; values in `src/lib/ratioData.ts`. Brian chose on 2026-09-22 to follow the official Korean and Japanese guides. They are guide pages, which lag patches (M-014), so the tables are medium trust; they have not changed since launch in any source (links in `docs/data-check/gms-ratios-sacred.csv`). Every value matches both; the lowest sacred band is labelled ≤ −95 to match them (it said < −100 before). The Korean page adds that above the requirement damage dealt rises by half the difference, in percent, up to +25 %, so the positive sacred rows are points on a line rather than bands.

Two real sources of symbols the calculator ignores, because both are temporary and per-character. A player using either finishes sooner than the site says.

- **Event perks that raise the daily rate.** Recurring events (the Night Troupe festivals, seasonal passes) sell a perk with event currency that adds symbols to every regional daily — the v.271 Night Troupe's Daily Quest Reward perk gives +2 at level 1 (Junior) and +3 more at level 3 (Veteran), so +5 a day per region at maximum, for the length of the event. Not to be confused with **Champion's Renown**, a monthly Legion Champion buff that grants stats and bonus EXP for 30 minutes and no symbols at all.
- **Event coupons in bulk.** Symbol Selector coupons arrive by the hundred from events, and Hyper Burning hands out pre-levelled symbols. These are a lump of symbols, not a rate.

## 3. Resets and time

- The code assumes the daily reset gives one day's symbols per calendar day and the weekly quest pays on Thursday.
- GMS resets dailies at 00:00 UTC (Brian, 2026-09-22: 8 pm EDT). The calculator counts the visitor's **local** calendar days instead, so for players far from UTC the day count can be one day off. Logged as KI-013; fixing it is a 2.0 decision.
- **The weekly resets Thursday 00:00 UTC in GMS**, confirmed in game by Brian on 2026-09-22. It used to be Monday. Every region moved it, each at 00:00 in its own time zone: KMS first on 2025-06-19 (the Assemble update, which unified all weekly content on Thursday; seen through Orange Mushroom's translation, not the KMS notice itself), then MSEA v246 on 2025-11-11, GMS v.264 on 2025-11-12, JMS ver4.38 on 2025-12-11, TMS most likely on 2025-12-03 (the beanfun notice is undated) and CMS V222 on 2026-01-07. The official lists name all six Arcane River weeklies (Erda Spectrum to Esfera Guardian); the CMS notice covers all weekly content in one line. The hour of the weekly is official for GMS (v.264: 12:00 AM UTC) and MSEA (0000hrs); for KMS, JMS, TMS and CMS only the day is, and 00:00 local is inferred from their other weekly content. Dailies reset at 00:00 local everywhere; outside GMS that rests on indirect or general statements, since no notice states it for the symbol dailies. `WEEKLY_RESET_DAY` in `src/lib/utils.ts` holds the day.

## 4. Grand Sacred symbols (in 2.0, not yet modelled)

Brian decided on 2026-09-16 that 2.0 includes them (V2_PLAN). Two exist: **Tallahart** and **Geardock**, the Western Grandis symbols (Tallahart from level 290, Geardock from 295, per v.270). GMS got Geardock on 2026-07-22 (v.270). The full sheet with sources is `docs/data-check/grand-sacred.csv`.

Confirmed in game by Brian on 2026-09-22:

- **The spelling is Geardock** (older notes said "Geardrak").
- **Max level 11, and the same symbols-per-level table as Sacred** (29 … 1100, 4565 to max).
- **One daily quest each, 15 symbols a day**, no weekly and no extra quest.
- **No main stat.** The wiki says they give EXP, meso and drop rate instead (+50 %, +15 %, +15 % at max). Every other symbol gives main stat, and the next-level panel is built around that, so this is the finding most likely to change the 2.0 design.
- **No Catalyst** (official, v.270). **The Symbol Selector is contested**: Brian answered "no Selector" on 2026-09-22, but Nexon's v.271 notes say "Added Grand Sacred Symbol: Tallahart to the list of items that can be received from Sacred Symbol Selector Coupons" (KMS 1.2.419 says the same; Geardock stays excluded everywhere). Needs a recheck in game before the 2.0 Tools design.
- **Meso costs**: their own tables. Brian saw 16,072,800,000 for Tallahart and 20,181,300,000 for Geardock in game, exactly the totals of the wiki's per-level tables. (This doc first gave 24,181,300,000 for Geardock, an addition error, M-013.)

Official in Nexon's v.270 notes (linked in `docs/data-check/grand-sacred.csv`): **+10 Sacred Power per level** (110 at max) and EXP / meso / drop +10 / +5 / +5 % at level 1, rising to +50 / +15 / +15 % at level 11, plus +20 % damage to Baldrix (Tallahart) or Jupiter (Geardock) at level 11. From the wiki only: the per-level meso split (which the formula in §1 reproduces). **Not found yet:** the damage ratio table for their maps (entry requirements seen: 630 / 660 / 700 Authentic Force) and the symbol images.

## 5. Other regions (researched 2026-09-22, not confirmed in game)

Structurally every region is the same game: the same 6 + 6 symbols, the same symbols-per-level tables (2679 / 4565), the same max levels, force and main-stat gains, the same catalyst retention, and the same arcane damage-ratio table. Two things differ.

- **Changes arrive region by region, Korea first.** The doubled rates reached KMS on 2026-03-19, MSEA on 2026-06-03, TMS and CMS on 2026-06-24, JMS on 2026-07-02 and GMS on 2026-09-09, so every region now pays the same dailies. KMS has moved on twice since: its Arcane weekly became **one clear of 240** instead of three of 80 (1.2.416, 2026-06-18; same weekly total), and its **Arcane symbols cost 30 % less** to level (1.2.419, 2026-09-17): each cost is 0.7 × the old one, rounded down to 10,000 mesos, so all six now total 1,622,560,000 instead of 2,318,520,000 (`docs/data-check/kms-mesos-arcane.csv`, checked against Nexon's own screenshot and two community sources). Sacred and Grand Sacred costs were not cut. The same patch (1.2.419) also raised Xenon's symbol stats: arcane 144 → 198 at level 1 and 48 → 66 per level, sacred 240 → 330 and 96 → 132 (update 812). All three are likely to reach GMS in a later patch; the cost cut would change every arcane meso figure on the site, and the Xenon change the next-level tooltip.
- **Names differ, and not only by script.** MSEA is English but uses KMS-derived names (Road to Extinction, Chew Chew Island, Lacheln, Moras, Hotel Arcs, Authentic Symbol, Talahart, Geardrock). CMS calls symbols 徽章 (badges) rather than 符文. One name list per language lives in `docs/data-check/`.

Also worth knowing: Geardock arrived last in JMS (2026-08-26) and MSEA (2026-07-20), and MSEA's Geardock daily gives 10, not 15. Every region resets at 00:00 local time, weekly on Thursday. TMS's costs match GMS: Sacred and Grand Sacred digit for digit in a table updated for v282, Arcane through an independent TMS calculator (medium confidence, no official table). Every CMS table is unverified: the ones in circulation predate the 2023 cost reduction. MSEA's are inferred: v225 (2023) made the same cut as Korea, and no patch since has touched costs. For each of these, one dated in-game screenshot would settle it. The Geardock daily count in TMS and CMS is not published anywhere (probably 15, like every region that raised Tallahart to 15), and MSEA's Talahart count is probably 15 but its notes never name it. All of this is recorded for the 2.0 decision about whether the site ever shows another region's numbers; today it shows GMS only (I18N §0).

## 6. When the game changes

`pnpm check:data` (`scripts/check-game-data.mjs`) watches every number that patches have changed before. `.github/workflows/game-data.yml` runs it every Monday. It never edits the data: a patch note can describe another region, a temporary event bonus, or a change GMS has not received, so a person decides.

**Sources**, listed once in the script's `SOURCES`. GMS has two that do not depend on each other, and the report says which one is ahead when they disagree:

- **The MapleStory Wiki** (maplestorywiki.net, MediaWiki API): the current numbers. It mirrors GMS within about a day of a patch. (The Fandom wiki is abandoned: its symbol pages were last edited in 2024.)
- **Nexon's GMS patch notes**: the JSON behind nexon.com's news pages (`g.nexonstatic.com/maplestory/cms/v1/news`), readable without a browser. Any update, maintenance or general notice from the past week that mentions symbols is reported line by line.
- **The cost formula** (§1): all 174 of our per-level costs are also compared with the formula, which catches a typo in `symbols.json` even when the wiki agrees with it; the Grand Sacred expectations are computed from it.
- **Early warning**: the official patch notes of KMS (maplestory.nexon.com), JMS (maplestory.nexon.co.jp, through the list its page loads) and MSEA (maplesea.com). Every change reaches KMS first, often months ahead.

**Checked, because it has moved before:** daily symbols per region; whether an extra quest exists and what it raises the daily to; the weekly (per clear × clears); the daily, weekly and extra quest names (a replaced quest usually means its reward changed); every per-level meso cost of all 12 symbols (the 2023 reduction, KMS's 30 % arcane cut in 2026); the per-level gains in power, main stat, Demon Avenger HP and Xenon stat (KMS raised Xenon's in 2026); the symbol lists for Arcane, Sacred and Grand Sacred (a new region); and the Grand Sacred daily and costs, held in the script's `PENDING` list until 2.0 adds them to `symbols.json`.

**Not checked, because it has not moved in years:** the symbols-per-level tables and the max levels (since each family launched; a changed max level still shows up as a different number of cost rows), the damage ratio tables, the Catalyst retention, the daily reset hour, and the level-1 stat amounts. Selector and Catalyst eligibility is not checked either, although v.271 changed the Selector list; it matters only once 2.0 models Grand Sacred in Tools. The weekly reset day did move once (2025) but no source states it in a form a script can read; the early warning also reports patch-note lines about a weekly reset day (초기화 요일, 初期化 曜日, reset day).

**What reaches GitHub.** The workflow writes only when something changed. It opens a `game-data` issue the first time a report is not clean (a number disagrees, a source is unreadable, or a patch note from the past week mentions symbols), comments only when the report differs from the last one posted, and closes the issue once everything matches again. Exit codes: 0 clean, 1 a number disagrees, 2 a source is unreadable, 3 a heads-up only.

On a GMS patch that touches symbols:

1. Compare each number the patch mentions with §1 and §2 and with `symbols.json` / `ratioData.ts`.
2. Edit the data files, then this doc's tables (the docs test fails until they agree), then record the check in §7.
3. A new symbol: follow ARCHITECTURE §9 (add a symbol). New ids only, never reuse one. No `STORAGE_VERSION` bump is needed (AGENTS gotcha 2).
4. New or renamed game names also need their translated names (I18N §9).
5. Player-visible data changes go in the next changelog entry.
6. A rate change usually reaches the regions at different times (§5), so check which region a source is describing.

## 7. Provenance log

One row per check against the game or a source. Newest last.

| Date       | What was checked                                                                   | Against                                                                                                                  | By     | Result                                                                                                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-22 | Where the numbers came from                                                        | Brian                                                                                                                    | Brian  | Unknown: built from the Credits resources, never re-checked. Heroic uses the same numbers as Interactive.                                                                                                                                                |
| 2026-09-22 | All 12 symbols: EXP tables, meso tables, per-level stat and power gains            | maplestorywiki.net                                                                                                       | Claude | **Match exactly**, digit for digit (2679 / 4565 symbols to max; all 12 meso tables; arcane force 30 at level 1 then +10, sacred power 10 then +10; main stat 300/+100 and 500/+200; Demon Avenger 2100/4200; Xenon 48/96).                               |
| 2026-09-22 | Daily and weekly rates, against the official GMS v.271 patch notes (2026-09-09)    | nexon.com/maplestory/news/update/44597                                                                                   | Claude | **Ours were stale.** Arcane daily 20 to 40, arcane weekly 40 to 80 per clear, sacred 20/10 to 30/15, grand 10 to 15. Applied to the data and the tests on v2 (KI-014). Not yet confirmed in game. _(Confirmed by Brian later the same day.)_             |
| 2026-09-22 | KMS, JMS, TMS, CMS and MSEA: rosters, tables, rates, names, resets                 | Official Nexon KR/JP, beanfun, maplesea, 17173, namu.wiki, orangemushroom                                                | Claude | Structurally identical everywhere; only the rates (by patch date) and the names differ, and JMS is still on the old rates. _(Wrong: JMS got them on 2026-07-02, M-014.)_ Recorded in §5 and in `docs/data-check/`.                                       |
| 2026-09-22 | Grand Sacred (Tallahart, Geardock): levels, costs, dailies, stats                  | maplestorywiki.net                                                                                                       | Claude | Collected into `docs/data-check/grand-sacred.csv`; wiki-sourced, unconfirmed in game. Meso figures re-derived from the wiki cost formula and agree. _(Wrong for Geardock's total, M-013.)_                                                               |
| 2026-09-22 | The weekly quest reset day                                                         | Brian, in game                                                                                                           | Brian  | **Thursday 00:00 UTC**, not Monday. The day count now credits the weekly on Thursday and the tests were recomputed.                                                                                                                                      |
| 2026-09-22 | The weekly reset day in the other regions                                          | Official patch notes: orangemushroom (KMS Assemble), maplesea v246, Nexon JP ver4.38, beanfun                            | Claude | **Thursday everywhere**, not Monday as first recorded. The earlier Monday values came from pages written before each region's 2025 change. CMS unconfirmed. _(CMS confirmed later: V222, 2026-01-07.)_                                                   |
| 2026-09-22 | Every daily and weekly rate, the extra quest, the daily reset hour                 | Brian, in game                                                                                                           | Brian  | **All match** the post-v.271 data: arcane 40 (Vanishing Journey and Chu Chu 20, doubled by the extra quest), weekly 80 per clear × 3, Cernium 30, the other sacred 15. Dailies reset at 00:00 UTC (8 pm EDT).                                            |
| 2026-09-22 | Grand Sacred: spelling, daily, main stat, max level, EXP table, meso totals, tools | Brian, in game                                                                                                           | Brian  | **Match the wiki**: Geardock, 15 a day, no main stat, max 11 on the Sacred table, 16.07b / 20.18b to max, no weekly, extra, Catalyst or Selector. Our Geardock total had an addition error (M-013).                                                      |
| 2026-09-22 | Spot checks: sacred 10 → 11 EXP, main stat, Catalyst, Demon Avenger and Xenon      | Brian, in game                                                                                                           | Brian  | **All match**: 1,100 symbols (Arteria level 10), +100 / +200 main stat, Catalyst 80 % / 60 % from level 2 on Interactive only, Demon Avenger 2,100 / 4,200 HP and Xenon 48 / 96 per level.                                                               |
| 2026-09-22 | Both damage ratio tables                                                           | Official guides: Nexon Korea (Articles/396) and Nexon Japan (gameguide/growth/force)                                     | Claude | **Every value matches**; the two pages agree with each other. Relabelled the lowest sacred band ≤ −95 to follow them (Brian: use the official pages).                                                                                                    |
| 2026-09-22 | KMS, JMS and MSEA, against their 2026 patch notes                                  | Official Nexon KR (updates 799–813), Nexon JP (ver4.43–4.45), maplesea (v251–v253)                                       | Claude | **Two earlier findings were wrong.** JMS got the doubled rates on 2026-07-02 and Geardock on 2026-08-26 (the earlier source was a stale guide page, M-014). KMS cut Arcane costs 30 % on 2026-09-17 and made its weekly one clear of 240.                |
| 2026-09-22 | TMS and CMS: costs, resets, ratios, Grand Sacred, names                            | beanfun (V280, 14773), gamer.com.tw (v282 table), CMS V222/V226/V227 notices, BWIKI, mxd.dvg.cn                          | Claude | TMS Sacred and Grand costs match GMS; Arcane (TMS) and all CMS costs unverified. Both weekly resets on Thursday (official; the hour is inferred, M-015). Ratios consistent. Tallahart 15 a day in both.                                                  |
| 2026-09-22 | The meso cost formula                                                              | `symbols.json`, and Brian's Grand Sacred totals                                                                          | Claude | **Reproduces all 174 costs and both totals exactly** (recomputed with a script, M-013). Recorded in §1.                                                                                                                                                  |
| 2026-09-22 | GMS v.271 in Nexon's own notes; Grand Sacred counts and reset hours elsewhere      | nexon.com update 44597 (rendered), beanfun V280, 17173 V226, maplesea v251–v253                                          | Claude | **GMS official**: Tallahart and Geardock 10 → 15; (the reset-time quote was an event counter's, M-015; v.264 is the real source). No symbol change announced after v.271. TMS/CMS Geardock count and daily hour, and MSEA Talahart count, not published. |
| 2026-09-22 | Regional meso costs: KMS after 1.2.419, TMS arcane, CMS, MSEA                      | Nexon KR notice 813 and guide screenshot, namu.wiki, mitemprice.kr, dcinside, WhatTheBlock TMS calculator, maplesea v225 | Claude | **KMS arcane: 0.7 × old, rounded down to 10,000** (recomputed: 670,000 for VJ 1→2, 1,622,560,000 for all six; three sources agree). KMS sacred unchanged. TMS matches GMS (arcane medium). MSEA inferred. CMS unverified.                                |
| 2026-09-22 | Independent review of every game-data doc, sheet and the watcher                   | The code, recomputation, and 12 official patch notes                                                                     | Claude | All totals and stat figures recompute. Corrected: reset-hour citations (M-015), the Grand Sacred Selector (v.271 adds Tallahart; asked Brian), v.270 facts in §4, stale test values in TESTING, watcher gaps (formula check, silent empty reads).        |
