# ANALYTICS — what we measure, and the decision each number informs

Plausible for product and traffic data, Google Search Console for search data, joined inside Plausible. This doc is the reference before adding, changing or removing any tracking. Rules are numbered so a review can cite them (`AN-3`). §3 is the event catalogue, §4 what we deliberately do not collect.

Nothing here is implemented yet: the site ships a Umami cloud script and fires no custom events at all.

## 0. Current state (2026-09-16)

- `index.html` loads `https://cloud.umami.is/script.js` with a `data-website-id` and no `data-domains`, so `pnpm dev` and every preview deployment count as production traffic (KI-009).
- No custom events exist, so nothing is known about what people do with the calculator once they land.
- Google Search Console: the property's verification method is not recorded anywhere in the repo, which matters because the host is moving (`docs/SEO.md` §0). Find out and write it down before DNS changes.

## 1. The rule that keeps this useful

- **AN-1 Every metric names the decision it informs.** If no one can say what they would do differently at a high number versus a low one, it is not collected. "A lot of information" is not the goal; being able to act on it is. §3's right-hand column is not decoration, it is the admission test.
- **AN-2 Events describe what a person did, not what the code did.** `tool_applied`, not `setSymbols_called`. Names outlive refactors that way.
- **AN-3 Never send a user's numbers.** Levels, experience, target levels and dates are the user's data and would not change a decision anyway. Send that a field was used, never its value (§4).
- **AN-4 Property values stay low-cardinality.** A property with hundreds of distinct values is unreadable in the dashboard and costs quota. Bucket before sending (`target_level: "16-20"`, not `17`).

## 2. Setup

- **AN-5 Plausible replaces Umami; the two do not run together.** Two scripts means two numbers that disagree and twice the third-party JavaScript on the critical path (SEO-18). Cut over in one commit and keep the Umami dashboard read-only for history.
- **AN-6 Take the snippet from Plausible's site settings, and set `data-domain` to `maplesymbols.com` only.** That is what stops dev and preview traffic being counted, which is the Umami mistake not to repeat. Enable outbound links, file downloads, 404 pages and custom properties in the site's settings rather than by hand-editing the script name.
- **AN-7 The standard script already tracks the custom router.** Plausible attaches listeners to the History API and fires a pageview on `history.pushState`, which is exactly what `RouterContext.navigate` calls, so no manual mode is needed. Verify it once after install: navigate client-side from `/` to `/handbook` and confirm two pageviews with different paths in the live dashboard. If they do not appear, switch to manual pageviews rather than guessing.
- **AN-8 All tracking goes through one wrapper module,** `analytics.ts`, beside the other pure modules in `src/lib/`. It exports a typed `track(event, props)` over a union of the event names in §3, no-ops when `window.plausible` is missing (dev, tests, blockers), and never throws. Components import it; nothing calls `window.plausible` directly. The runtime call it makes is `plausible(name, { props })`.

## 3. Event catalogue

Pageviews, referrers, entry pages, countries, devices and outbound clicks come free with the script. Everything below is a custom event. Names are lowercase with underscores.

### Acquisition — is the SEO work paying off?

| Event                 | Props                            | The decision it informs                                                                                                                                 |
| --------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (pageview, built in)  | route                            | Which pages earn traffic; whether the Handbook deserves more content or the Credits page is dead weight.                                                |
| (referrers, built in) | source                           | Which of the outreach targets in `docs/SEO.md` §5 actually send players, so effort goes to the ones that do.                                            |
| `not_found`           | `path` (bucketed: first segment) | Whether unknown paths are real traffic. This is the evidence that decides SEO-3: junk URLs mean ship a real 404, silence means leave the rewrite alone. |
| `outbound` (built in) | destination                      | Whether Discord, GitHub and the donate link are worth their footer space.                                                                               |

### Activation — does a visitor actually use the calculator?

The one funnel that matters: land → enter a level → toggle a quest → see an answer. A big gap between the first and second step is a first-run UX problem, not a traffic problem.

| Event           | Props                                         | The decision it informs                                                                                             |
| --------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `symbol_input`  | `field`: `level` \| `experience`; `mode`      | Fires once per session per field. The activation rate. If most visitors never type, the empty state is the problem. |
| `quest_toggle`  | `quest`: `daily` \| `weekly` \| `extra`; `on` | Whether the extra-quest multiplier is understood and used, or whether it needs explaining.                          |
| `mode_switch`   | `to`: `arcane` \| `sacred`                    | The arcane/sacred split, which decides whose bugs and content get priority.                                         |
| `symbol_select` | `symbol` (name), `mode`                       | Which regions people are actually grinding. Drives which symbol gets attention when game data changes.              |

### Feature usage — what to invest in, and what to cut

| Event             | Props                                                            | The decision it informs                                                                                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tool_used`       | `tool`: `selector` \| `catalyst`; `action`: `preview` \| `apply` | Whether the Tools card earns its space, and whether people trust Apply or just look.                                                                                                                                                   |
| `cap_unlocked`    | —                                                                | How many people use the experience-cap unlock. It was the source of two bugs fixed on `v2` (KI-004, KI-005) and remains the most intricate input rule; low usage argues for simplifying it in 2.0, high usage for investing in its UX. |
| `overview_target` | `target_level` bucketed (`2-5`, `6-10`, `11-15`, `16-20`)        | Whether the target-level panel is used at all, and whether people aim for max or for a next milestone.                                                                                                                                 |
| `graph_mode`      | `mode`: `linear` \| `exponential`                                | Whether the exponential mode (a 1.3.0 feature) was worth building and should be the default.                                                                                                                                           |
| `handbook_tab`    | `tab`: `exp` \| `cost` \| `ratio`                                | Which table earns the Handbook's traffic, which is also the page's SEO target (`docs/SEO.md` §3).                                                                                                                                      |
| `extras_tab`      | `tab`: `changelog` \| `credits`                                  | Whether anyone reads the changelog, which decides how much effort each release entry deserves.                                                                                                                                         |
| `language_switch` | `to`: locale                                                     | After `docs/I18N.md` ships: which locales are worth the translation cost, and which to add next.                                                                                                                                       |

### Quality — is anything broken in the field?

| Event         | Props                                                                                | The decision it informs                                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `error_shown` | `route`                                                                              | The ErrorBoundary currently swallows failures into a "Something went wrong" message that nobody hears about. This is the only signal that it fired.                                                              |
| `web_vital`   | `metric`: `LCP` \| `INP` \| `CLS`; `rating`: `good` \| `needs-improvement` \| `poor` | Real-user Core Web Vitals. PageSpeed lab numbers are all this site will otherwise get, because field data needs traffic Google may not have for it (SEO-18). Send the rating bucket, never the raw value (AN-4). |

## 4. What we deliberately do not collect

Listing this is part of the doc's job: it is the answer when someone proposes adding one.

- **Any level, experience, target or completion date.** The user's own numbers (AN-3).
- **Anything identifying a player**: character names, IGNs, Discord handles, IP-derived identity. Plausible is cookieless and does not build profiles; do not reintroduce one on top of it.
- **Per-keystroke input events.** `symbol_input` fires once per field per session, not on every change.
- **Session recordings or heatmaps.** They capture whatever the user typed, which collides with AN-3.
- **Symbol × level combinations**, or any property that multiplies out to hundreds of values (AN-4).

## 5. Implementation notes

- That module holds a `const EVENTS` union, a `track()` that checks `typeof window.plausible === "function"` first, and nothing else. Keeping it one file makes the next two points possible.
- Test it the way the SEO rules are tested: a source scan asserting no component calls `window.plausible` directly, and that every string passed to `track()` is in the union. Type-checking covers the second if the signature is `track(name: EventName, props?: PropsFor<EventName>)`.
- Fire-and-forget: a blocked script must not break a click handler. Never `await` the callback, never branch on the result.
- Once-per-session events (`symbol_input`) need a module-level flag, not state; reset is not needed because a reload is a new session.

## 6. Goals and funnels in Plausible

Mark as goals: `symbol_input`, `quest_toggle`, `tool_used`, `not_found`, `error_shown`. Those are the five that trigger action. Build one funnel: pageview on `/` → `symbol_input` → `quest_toggle`. Everything else is a report to read, not a goal to watch.

## 7. Google Search Console

- **AN-9 Connect Search Console to Plausible** so search queries, impressions, CTR and average position sit next to the traffic they produce. Add the site as a domain or URL-prefix property, verify by DNS or HTML, then authorise Google from Plausible's integration settings and pick the property.
- Know the limits before trusting a number: data lags roughly 24 to 36 hours, only keywords that got clicks appear (impression-only queries are hidden), Google samples keyword data heavily so the keyword totals will not reconcile with the Google visitor count, and an account is capped at 50 live tokens.
- **AN-10 Verification survives the host move.** The verification method is not recorded in the repo and DNS is about to change (`docs/SEO.md` §0). Find out which method the property uses, write it here, and re-check the property after the cut-over.

What to read there, and when: after every release, the Pages report for the four `ROUTES` URLs (indexed or not) and URL Inspection on anything new. Monthly, the queries where the site ranks 5th to 20th, because those are the ones a content change can move onto page one; that list feeds the query map in `docs/SEO.md` §3.

## 8. Review cadence

- **After every release**: the SEO-25 live check, then confirm pageviews are still arriving and no `error_shown` spike followed the deploy.
- **Monthly**: activation rate (pageviews on `/` versus `symbol_input`), the arcane/sacred split, the 5th-to-20th query list, and Core Web Vitals ratings.
- **Per quarter**: re-read §3 and delete any event nobody has looked at. An unread metric is a cost, and the catalogue only stays honest if it shrinks sometimes.

## 9. Privacy

Plausible is cookieless, stores no personal data and needs no consent banner in the EU or UK on its own account; combined with AN-3 and AN-4 the site collects nothing that identifies anyone. Do not add a tool that changes that without revisiting this section, and if one is ever added, the site needs a privacy page before it ships, not after.

## 10. Keeping this doc true

- Adding an event means adding a row to §3 with its decision column filled in, in the same commit. A row with an empty decision column does not merge.
- Removing an event means deleting its row and saying where it went.
- §0 is rewritten the day the Umami script is removed, and §7 the day Search Console is connected.
