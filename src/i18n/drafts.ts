// ---------------------------------------------------------------------------
// drafts.ts — Translations that are written but not served yet.
//
// D-12 (docs/REGIONS.md): interface copy is a machine draft first, then a native
// player's review. A language's catalogue lives in src/i18n/<language>/ and is
// registered here while it is a draft: typecheck holds it to the English keys, and
// src/i18n/drafts.test.ts to its placeholders, markup, terms and title widths, but
// no page serves it. Serving it is one move: add the language to
// CATALOGUE_LANGUAGES (src/lib/routes.ts) and its catalogue to CATALOGUES
// (src/i18n/index.ts), which also makes its edition indexable. That move is
// Brian's call, after the review.
// ---------------------------------------------------------------------------

import type { Messages } from "./index";
import { ko } from "./ko";

/** The languages of the four translated editions (KMS, JMS, TMS, CMS). */
export const DRAFT_LANGUAGES = ["ko", "ja", "zh-Hant", "zh-Hans"] as const;
export type DraftLanguage = (typeof DRAFT_LANGUAGES)[number];

/** Each language's draft catalogue, once one is written. */
export const DRAFT_CATALOGUES: Partial<Record<DraftLanguage, Messages>> = {
  ko,
};
