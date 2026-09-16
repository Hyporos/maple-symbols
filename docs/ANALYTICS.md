# ANALYTICS — what we measure, and the decision each number informs

Umami Cloud for traffic and product data, Google Search Console for search data, read side by side. This doc is the reference before adding, changing or removing any tracking. Rules are numbered so a review can cite them (`AN-3`). §3 is the event catalogue, §4 what we deliberately do not collect.

Brian chose Umami over Plausible on 2026-09-16 because Plausible is paid and Umami Cloud's Hobby plan is free. Every claim below about the tracker was checked on that date against Umami's docs and against the live `https://cloud.umami.is/script.js`.

## 0. Current state (2026-09-16)

- **Done:** the Umami script in `index.html` carries `data-domains`, `data-performance` and `data-exclude-search` (AN-6), so dev and preview traffic is no longer counted and Web Vitals are collected. The typed wrapper exists in `src/lib/` (AN-8) with its tests, including the scan that keeps `window.umami` out of every other file.
- **Not done yet:** no component calls `track` so far; the §3 events are wired in a follow-up, after the accessibility and i18n work on the same components merges. `outbound` attributes are not on the anchors yet.
- Search Console's verification method is not recorded in the repo. The site moved from Firebase to Vercel on 2026-09-16 (`docs/SEO.md` §0), so confirm the property is still verified.

## 1. The rules that keep this useful

- **AN-1 Every metric names the decision it informs.** If no one can say what they would do differently at a high number versus a low one, it is not collected. §3's right-hand column is the admission test, not decoration.
- **AN-2 Events describe what a person did, not what the code did.** `tool_used`, not `setSymbols_called`. Names outlive refactors that way.
- **AN-3 Never send a user's numbers.** Levels, experience, target levels and dates are the user's data and would not change a decision anyway. Send that a field was used, never its value (§4).
- **AN-4 Property values stay low-cardinality.** A property with hundreds of distinct values is unreadable and wastes the quota. Bucket before sending (`target_level: "16-20"`, not `17`).
- **AN-5 Stay inside the free plan.** Umami's FAQ confirms the Hobby plan is free; third-party reviews in 2026 put it at 100,000 events a month with six months of retention, so check the pricing page before relying on those figures. Pageviews and custom events share the budget, so every event in §3 fires on a deliberate action or once per session, never on a keystroke, a render or a timer.

## 2. Setup

- **AN-6 One script, configured by attributes.** Keep the existing Umami Cloud script tag in `index.html` and add:
  - `data-domains="maplesymbols.com,www.maplesymbols.com"`. The tracker splits this on commas and compares each entry with `window.location.hostname` exactly, so both hosts must be listed while either one serves the site. This is what stops dev and preview traffic being counted.
  - `data-performance="true"`, so the tracker collects Core Web Vitals itself. That replaces the hand-rolled `web_vital` event an earlier draft needed.
  - `data-exclude-search="true"`. No query string on this site carries meaning, and it keeps stray tracking parameters out of the page list.
- **AN-7 The script already tracks the custom router.** The live tracker wraps `history.pushState` and `history.replaceState` and records a pageview on each change, which is exactly what `RouterContext.navigate` calls, so no manual pageviews are needed. Verify once after deploying: navigate client-side from `/` to `/handbook` and confirm two pageviews with different paths in the Umami dashboard.
- **AN-8 All tracking goes through one wrapper module,** `analytics.ts`, beside the other pure modules in `src/lib/`. It exports a typed `track(event, data)` over a union of the event names in §3, calls `window.umami.track(name, data)` only when that function exists (it does not in dev, in tests, or behind blockers), and never throws. Components import it; nothing calls `window.umami` directly.
- Tracker limits to design within: event names at most 50 characters; string values at most 500 characters; at most 50 properties per event; numbers keep 4 digits of precision. Data sent through `data-umami-event-*` HTML attributes is always stored as strings.

## 3. Event catalogue

Pageviews, referrers, entry pages, countries, devices and Core Web Vitals come from the script (AN-6, AN-7). Umami does **not** track outbound links or unknown paths automatically, so both are custom events here. Names are lowercase with underscores.

### Acquisition — is the SEO work paying off?

| Event                 | Data                                                         | The decision it informs                                                                                                                         |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| (pageview, built in)  | path                                                         | Which pages earn traffic; whether the Handbook deserves more content or the Credits page is dead weight.                                        |
| (referrers, built in) | source                                                       | Which of the outreach targets in `docs/SEO.md` §5 actually send players, so effort goes to the ones that do.                                    |
| `not_found`           | `path` (bucketed: first segment)                             | Whether unknown paths are real traffic. The evidence that decides SEO-3: junk URLs mean ship a real 404, silence means leave the rewrite alone. |
| `outbound`            | `destination`: `github` \| `discord` \| `donate` \| `credit` | Whether the footer links and the credited creators get clicks. Added with `data-umami-event` attributes on the anchors; no JavaScript needed.   |

### Activation — does a visitor actually use the calculator?

The one funnel that matters: land, enter a level, toggle a quest, see an answer. A big gap between the first and second step is a first-run UX problem, not a traffic problem.

| Event           | Data                                                            | The decision it informs                                                                                             |
| --------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `symbol_input`  | `field`: `level` \| `experience`; `mode`                        | Fires once per session per field. The activation rate. If most visitors never type, the empty state is the problem. |
| `quest_toggle`  | `quest`: `daily` \| `weekly` \| `extra`; `state`: `on` \| `off` | Whether the extra-quest multiplier is understood and used, or whether it needs explaining.                          |
| `mode_switch`   | `to`: `arcane` \| `sacred`                                      | The arcane/sacred split, which decides whose bugs and content get priority.                                         |
| `symbol_select` | `symbol` (name), `mode`                                         | Which regions people are actually grinding. Drives which symbol gets attention when game data changes.              |

### Feature usage — what to invest in, and what to cut

| Event             | Data                                                                | The decision it informs                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tool_used`       | `tool`: `selector` \| `catalyst`; `action`: `preview` \| `apply`    | Whether the Tools card earns its space, and whether people trust Apply or just look.                                                                                        |
| `cap_unlocked`    | —                                                                   | How many people use the experience-cap unlock. It caused two bugs fixed on `v2` (KI-004, KI-005) and is the most intricate input rule; low usage argues for simplifying it. |
| `overview_target` | `target_level` bucketed (`2-5`, `6-10`, `11-15`, `16-20`)           | Whether the target-level panel is used at all, and whether people aim for max or for a next milestone.                                                                      |
| `graph_mode`      | `mode`: `linear` \| `exponential`                                   | Whether the exponential mode (a 1.3.0 feature) was worth building and should be the default.                                                                                |
| `handbook_tab`    | `tab`: `exp` \| `cost` \| `ratio`                                   | Which table earns the Handbook's traffic, which is also the page's SEO target (`docs/SEO.md` §3).                                                                           |
| `extras_tab`      | `tab`: `changelog` \| `credits`                                     | Whether anyone reads the changelog, which decides how much effort each release entry deserves.                                                                              |
| `language_switch` | `to`: locale (not in the wrapper's union until the selector exists) | After `docs/I18N.md` ships: which locales are worth the translation cost, and which to add next.                                                                            |

### Quality — is anything broken in the field?

| Event                  | Data                     | The decision it informs                                                                                                                                                       |
| ---------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `error_shown`          | `route`                  | The ErrorBoundary swallows failures into a "Something went wrong" message nobody hears about. This is the only signal that it fired.                                          |
| (Web Vitals, built in) | LCP, INP, CLS, FCP, TTFB | Real-user Core Web Vitals via `data-performance`. PageSpeed lab numbers are otherwise all this site gets, because Google's field data needs traffic it may not have (SEO-18). |

## 4. What we deliberately do not collect

Listing this is part of the doc's job: it is the answer when someone proposes adding one.

- **Any level, experience, target or completion date.** The user's own numbers (AN-3).
- **Anything identifying a player**: character names, IGNs, Discord handles, IP-derived identity. Umami does not use cookies or build profiles; do not reintroduce one on top of it.
- **Per-keystroke input events.** `symbol_input` fires once per field per session (AN-5).
- **Session recordings or heatmaps.** They capture whatever the user typed, which collides with AN-3.
- **Symbol × level combinations**, or any property that multiplies out to hundreds of values (AN-4).

## 5. Implementation notes

- The wrapper module holds `EventData` (name → data shape), `track(name, data)` which checks `typeof window.umami?.track === "function"` first, `trackOnce(key, name, data)` for once-per-session events, and the two bucketing helpers `targetBucket` and `notFoundPath`. `window.umami` is declared in `src/vite-env.d.ts`. All data values are strings, because attribute-sent data is always stored as strings and one representation keeps dashboard filters consistent.
- Test it the way the SEO rules are tested: a source scan asserting no component references `window.umami` directly, and type-checking for event names if the signature is `track(name: EventName, data?: DataFor<EventName>)`.
- Fire-and-forget: a blocked script must not break a click handler. Never await it, never branch on it.
- Once-per-session events (`symbol_input`) need a module-level flag, not React state; a reload is a new session.
- `outbound` needs no code: `data-umami-event="outbound"` plus `data-umami-event-destination="discord"` on the anchor, and the tracker handles the click.

## 6. Reports in Umami

Umami has no goals in the Plausible sense, so these are reports to read. Watch `symbol_input`, `quest_toggle`, `tool_used`, `not_found` and `error_shown`, because those five trigger action. Build one funnel in Umami's Funnel report: pageview on `/`, then `symbol_input`, then `quest_toggle`. Everything else is read on demand.

## 7. Google Search Console

- **AN-9 Search Console is read on its own.** Umami documents no Search Console integration, so queries, impressions, click-through rate and average position are read in Search Console and compared with Umami's referrer traffic by hand. A Domain property covers both `maplesymbols.com` and `www`; submit `https://maplesymbols.com/sitemap.xml`.
- Know the limits before trusting a number: search data lags a day or two, and Google anonymises rare queries, so query totals will not reconcile with total clicks.
- **AN-10 Record the verification method.** It is not in the repo. Find out whether the property is verified by DNS or by an HTML tag, write it here, and confirm it survived the move to Vercel.

What to read there, and when: after every release, the Pages report for the four `ROUTES` URLs and URL Inspection on anything new. Monthly, the queries where the site ranks 5th to 20th, because a content change can move those onto page one; that list feeds the query map in `docs/SEO.md` §3.

## 8. Review cadence

- **After every release**: the SEO-25 live check, then confirm pageviews are still arriving and no `error_shown` spike followed the deploy.
- **Monthly**: activation rate (pageviews on `/` versus `symbol_input`), the arcane/sacred split, the 5th-to-20th query list, Web Vitals, and the event count against the free-plan budget (AN-5).
- **Per quarter**: re-read §3 and delete any event nobody has looked at. An unread metric is a cost, and the catalogue only stays honest if it shrinks sometimes.

## 9. Privacy

Umami does not use cookies and does not collect personal data; combined with AN-3 and AN-4 the site collects nothing that identifies anyone. Do not add a tool that changes that without revisiting this section, and if one is ever added, the site needs a privacy page before it ships.

## 10. Keeping this doc true

- Adding an event means adding a row to §3 with its decision column filled in, in the same commit. A row with an empty decision column does not merge.
- Removing an event means deleting its row and saying where it went.
- §0 is rewritten the day `data-domains` and the first events ship, and §7 the day the verification method is recorded.
