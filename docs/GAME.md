# Game reference (MapleStory, GMS)

What the calculator models about the game, where each number lives in the code, and how far each one can be trusted. Read before touching game data, adding a symbol (Grand Sacred), or answering a player's "is this number right?". The data itself stays in `src/lib/symbols.json`, `src/lib/game.ts` and `src/lib/ratioData.ts`, which the code reads; this doc explains it, records provenance, and quotes numbers only inside the marked tables, which `src/test/docs.test.ts` checks against the data both ways.

## 0. Scope and trust (read first)

- **GMS only.** Every number is Global MapleStory. Brian confirmed on 2026-09-22 that Heroic (Reboot) and Interactive worlds use the same symbol numbers; the one difference the site shows is that the Catalyst is Interactive-only ("Regular Server Only" in the Tools copy).
- **Other regions are unknown.** KMS, JMS, TMS, CMS and MSEA may differ in daily counts, EXP tables, meso costs, damage ratios and which symbols exist at all. Nobody has checked. The i18n decision is interface only (I18N §0): translated pages still show GMS numbers, and the page must never imply they are that region's numbers.
- **Provenance is unrecorded.** The Credits page lists the resources the site was built from (MapleStory Fandom wiki, StrategyWiki, Orange Mushroom's blog), but nothing records which number came from which source or when it was last compared with the game. Until a row in §6 says otherwise, treat every number as **unverified**: correct as far as anyone knows, and never re-checked.

## 1. Symbols

Twelve symbols in two families. Arcane Symbols (Arcane River regions) level to 20 and give Arcane Power; Sacred Symbols (Grandis regions) level to 11 and give Sacred Power. Ids are permanent (saved progress is keyed on them, AGENTS gotcha 2); JSON order is display order only.

<!-- symbols:start -->

| id  | Symbol            | Type   | Daily quest                           | Daily symbols | Weekly quest    | Extra quest    | Mesos to max  |
| --- | ----------------- | ------ | ------------------------------------- | ------------- | --------------- | -------------- | ------------- |
| 1   | Vanishing Journey | arcane | Vanishing Journey Research            | 10            | Erda Spectrum   | Reverse City   | 252,470,000   |
| 2   | Chu Chu Island    | arcane | Chu Chu's Finest Cuisine              | 10            | Hungry Muto     | Yum Yum Island | 306,050,000   |
| 3   | Lachelein         | arcane | A Night's Peace in Lachelein          | 20            | Midnight Chaser | –              | 359,630,000   |
| 4   | Arcana            | arcane | Peace in Arcana                       | 20            | Spirit Savior   | –              | 413,210,000   |
| 5   | Morass            | arcane | Save the Morass                       | 20            | Ranheim Defense | –              | 466,790,000   |
| 6   | Esfera            | arcane | Esfera Research Orders                | 20            | Esfera Guardian | –              | 520,370,000   |
| 7   | Cernium           | sacred | Cernium Research                      | 20            | –               | –              | 3,930,100,000 |
| 8   | Hotel Arcus       | sacred | Clean Up Around Hotel Arcus           | 10            | –               | –              | 4,751,600,000 |
| 9   | Odium             | sacred | Odium Area Expedition                 | 10            | –               | –              | 5,573,300,000 |
| 10  | Shangri-La        | sacred | Shangri-La Contamination Purification | 10            | –               | –              | 6,395,000,000 |
| 11  | Arteria           | sacred | Defeat the Arteria Remnants           | 10            | –               | –              | 7,216,900,000 |
| 12  | Carcion           | sacred | Carcion Recovery Support              | 10            | –               | –              | 8,038,600,000 |

<!-- symbols:end -->

**The daily and weekly counts in this table are disputed** (KI-014): maplestorywiki.net gives roughly double the arcane dailies and 1.5x the sacred ones, and a weekly of 80 per clear up to 3 clears a week. The EXP and meso tables below match the wiki exactly. Nothing changes until someone confirms in game.

"Mesos to max" is the sum of the symbol's `mesosRequired`, level 1 to max. The per-level EXP tables are shared by every symbol of a type (`arcaneExpRequired`, `sacredExpRequired` in `symbols.json`, loaded as each symbol's `symbolsRequired`); the per-level meso tables are per symbol. The Handbook page renders all of them.

## 2. Rules and constants

<!-- constants:start -->

| Rule                                    | Arcane | Sacred | In code                                        |
| --------------------------------------- | ------ | ------ | ---------------------------------------------- |
| Max level                               | 20     | 11     | `MAX_LEVEL`                                    |
| Symbols from level 1 to max             | 2679   | 4565   | sum of `arcaneExpRequired`/`sacredExpRequired` |
| Weekly quest symbols (per weekly reset) | 120    | –      | `WEEKLY_SYMBOLS`                               |
| Extra quest daily multiplier            | 2      | 1.5    | `EXTRA_MULTIPLIER`                             |
| Catalyst keeps this share of total EXP  | 0.8    | 0.6    | `CATALYST_RETENTION`                           |
| Power per level                         | 10     | 10     | `POWER_PER_LEVEL`                              |
| Base power at level 1 (on top)          | 20     | 0      | `ARCANE_BASE_POWER`                            |
| Max power per symbol                    | 220    | 110    | `MAX_POWER_PER_SYMBOL`                         |
| Main stat per level                     | 100    | 200    | `MAIN_STAT_PER_LEVEL`                          |

<!-- constants:end -->

How the calculator uses them (the code-facing version is AGENTS.md's domain cheat sheet):

- **Daily rate** = daily symbols × extra multiplier when the extra quest is on, 0 when the daily is off. Only Vanishing Journey and Chu Chu have an extra quest; only arcane symbols have a weekly.
- **Days to go** count from tomorrow (today's quests are assumed done) and credit the weekly on each counted Monday. The calendar is the visitor's local one; see §3.
- **Power**: arcane `level × 10 + 20`, sacred `level × 10`. The Graph adds +10 per level-up.
- **Catalyst** (Interactive worlds only): transfers a symbol once within a world, keeping 80 % (arcane) or 60 % (sacred) of its cumulative EXP; needs level 2 or higher. The Tools copy states this as "-20% EXP" / "-40% EXP" (literal in `src/i18n/en/tools.ts`, not derived from `CATALYST_RETENTION`).
- **Symbol Selector**: adds a chosen number of symbols and levels up as far as they reach.
- **Class exceptions** in the next-level panel: Demon Avenger gains HP instead of main stat (2,100 arcane / 4,200 sacred per level) and Xenon gains all stat (48 / 96); constants at the top of `src/components/Calculator/Calculator.tsx`.
- **Damage ratios** (Handbook): arcane by the percentage of the map's requirement met, sacred by the difference from the requirement; values in `src/lib/ratioData.ts`.

## 3. Resets and time

- The code assumes the daily reset gives one day's symbols per calendar day and the weekly quest pays on Monday.
- GMS resets dailies at 00:00 UTC, and weekly quests on Monday 00:00 UTC as far as anyone here knows (unverified). The calculator counts the visitor's **local** calendar days instead, so for players far from UTC the day count and the Monday credit can be one day off. Logged as KI-013; fixing it is a 2.0 decision.

## 4. Grand Sacred symbols (in 2.0, not yet modelled)

Brian decided on 2026-09-16 that 2.0 includes them (V2_PLAN). Two exist: **Tallahart** and **Geardock** (the site copy and SEO doc say "Geardrak"; the in-game spelling still needs confirming). They are the Western Grandis symbols for level 290+ characters.

Everything below is from maplestorywiki.net on 2026-09-22 and is **not confirmed in game**; the full sheet with sources is `docs/data-check/grand-sacred.csv`. Confirm before any of it reaches the code.

- **Max level 11, and the same symbols-per-level table as Sacred** (29 … 1100, 4565 to max). The meso costs are their own: 16,072,800,000 to max for Tallahart, 24,181,300,000 for Geardock.
- **One daily quest each, 15 symbols a day**, no weekly and no extra quest.
- **Sacred Power / Authentic Force +10 per level**, the same as a Sacred Symbol (110 at max).
- **No main stat.** They give EXP, meso and drop rate instead (+50 %, +15 %, +15 % at max). Every other symbol gives main stat, and the next-level panel is built around that, so this is the one finding most likely to change the 2.0 design.
- **No Catalyst and no Symbol Selector.**
- **Not found yet:** the damage ratio table for their maps (entry requirements seen: 630 / 660 / 700 Authentic Force), the Demon Avenger and Xenon equivalents, and the symbol images.
- **Something we do not model at all:** the wiki describes Authentic Symbol bonuses that depend on how many unique symbols are equipped (Demon Avenger +6,300 HP, Xenon +144 all stat per symbol), on top of the per-force amounts we do use.

## 5. When the game changes

On a GMS patch that touches symbols:

1. Compare each number the patch mentions with §1 and §2 and with `symbols.json` / `ratioData.ts`.
2. Edit the data files, then this doc's tables (the docs test fails until they agree), then record the check in §6.
3. A new symbol: follow ARCHITECTURE §9 (add a symbol). New ids only, never reuse one. No `STORAGE_VERSION` bump is needed (AGENTS gotcha 2).
4. New or renamed game names also need their translated names (I18N §9).
5. Player-visible data changes go in the next changelog entry.

## 6. Provenance log

One row per check against the game or a source. Newest last.

| Date       | What was checked                                                        | Against            | By     | Result                                                                                                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------- | ------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-22 | Where the numbers came from                                             | Brian              | Brian  | Unknown: built from the Credits resources, never re-checked. Heroic uses the same numbers as Interactive.                                                                                                                  |
| 2026-09-22 | All 12 symbols: EXP tables, meso tables, per-level stat and power gains | maplestorywiki.net | Claude | **Match exactly**, digit for digit (2679 / 4565 symbols to max; all 12 meso tables; arcane force 30 at level 1 then +10, sacred power 10 then +10; main stat 300/+100 and 500/+200; Demon Avenger 2100/4200; Xenon 48/96). |
| 2026-09-22 | Daily and weekly symbol rates                                           | maplestorywiki.net | Claude | **Differ** from ours by a uniform 2x (arcane) and 1.5x (sacred), weekly 240/week vs 120. Logged as KI-014, unconfirmed.                                                                                                    |
| 2026-09-22 | Grand Sacred (Tallahart, Geardock): levels, costs, dailies, stats       | maplestorywiki.net | Claude | Collected into `docs/data-check/grand-sacred.csv`; wiki-sourced, unconfirmed in game. Meso figures re-derived from the wiki cost formula and agree.                                                                        |
