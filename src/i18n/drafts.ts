// ---------------------------------------------------------------------------
// drafts.ts — Translations that are written but not served yet.
//
// D-12 (docs/REGIONS.md): interface copy is a machine draft first, then a native
// player's review. A language's catalogue lives in src/i18n/<language>/ and is
// registered here while it is a draft: typecheck holds it to the English keys, and
// src/i18n/drafts.test.ts to its placeholders, markup, terms and title widths.
// Production never serves a draft; a Vercel preview build does, so a native player
// can review it on the preview link (SERVES_DRAFTS in src/lib/routes.ts, Brian
// 2026-09-23). Publishing one, after the review and on Brian's call, moves its
// language from DRAFT_LANGUAGES to PUBLISHED_LANGUAGES (src/lib/routes.ts) and its
// catalogue from here into CATALOGUES (src/i18n/index.ts), which also makes its
// edition indexable.
// ---------------------------------------------------------------------------

import type { DraftLanguage } from "../lib/routes";
import type { Messages } from "./index";
import { ko } from "./ko";
import { ja } from "./ja";
import { zhHant } from "./zh-Hant";
import { zhHans } from "./zh-Hans";

export { DRAFT_LANGUAGES, type DraftLanguage } from "../lib/routes";

/** Each draft language's catalogue. */
export const DRAFT_CATALOGUES: Readonly<Record<DraftLanguage, Messages>> = {
  ko,
  ja,
  "zh-Hant": zhHant,
  "zh-Hans": zhHans,
};
