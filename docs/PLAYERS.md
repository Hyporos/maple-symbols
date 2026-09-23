# Players

Who uses Maple Symbols and what they come to do, so design, copy, SEO and translation decisions start from the audience instead of a guess. Read before 2.0 design work, before writing page copy, and before deciding which language or feature comes first. Only facts with a source go in §1; everything else is a question in §2 until data answers it.

## 1. What we know

| Fact                                                                                                                                 | Source          | Date       |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ---------- |
| The audience is mostly GMS players (the North America and Europe servers).                                                           | Brian           | 2026-09-22 |
| Heroic (Reboot) and Interactive worlds use the same symbol numbers, so one calculator serves both; the Catalyst is Interactive-only. | Brian (GAME §0) | 2026-09-22 |
| The site is English-only today; Korean, Japanese and both Chinese scripts are planned as interface translations over GMS numbers.    | I18N §0         | 2026-09-16 |
| Players who report bugs are pointed to the Discord linked in the footer.                                                             | changelog copy  | 2026-09-16 |

## 2. Open questions, and where the answer comes from

| Question                                                             | Why it matters                                                       | How to answer it                                                                                                    |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Which countries and time zones do visitors come from?                | Reset timing (KI-013) hurts players far from UTC; translation order. | Umami: Countries report.                                                                                            |
| Phone or desktop?                                                    | The fixed 360 px phone cards (DESIGN_SYSTEM §5) and the 2.0 layout.  | Umami: Devices report.                                                                                              |
| Which symbols do people actually track?                              | Where data checks (GAME §6, §7) and Grand Sacred work pay off first. | Umami: `symbol_select` and `symbol_input` events (ANALYTICS §3).                                                    |
| Arcane or Sacred more? Early or late game?                           | What the calculator page leads with.                                 | Umami: `mode_switch`, and `mode` on `symbol_select`; level distribution is not collected on purpose (ANALYTICS §4). |
| Do people use the Tools, Overview and Graph, or only the calculator? | Which cards 2.0 keeps, merges or promotes.                           | Umami: `tool_used`, `overview_target`, `graph_mode`; the funnel in ANALYTICS §6.                                    |
| Which search queries bring them, and where do we rank?               | Page copy and headings (SEO-9, A-3).                                 | Search Console: Performance → Queries.                                                                              |
| Are there Korean, Japanese or Chinese readers on GMS?                | Whether translation is worth its cost, and which language first.     | Umami: Languages and Countries; Search Console queries in those scripts.                                            |
| Are there MSEA or other-server players using GMS numbers by mistake? | Whether the page needs a "GMS numbers" notice (GAME §0).             | Discord feedback; Umami countries in Southeast Asia.                                                                |

## 3. Keeping this doc true

- A fact moves from §2 to §1 only with its source and date; quote report numbers with the date range they cover.
- Re-read the Umami and Search Console reports on the ANALYTICS §8 cadence and update both tables.
- Never record anything that identifies a player (ANALYTICS §4).
