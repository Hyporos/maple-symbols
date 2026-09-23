// ---------------------------------------------------------------------------
// zh-Hans/index.ts — The Simplified Chinese catalogue for the CMS edition.
//
// A machine draft (docs/REGIONS.md D-12), awaiting a native CMS player's review
// before it is served: registered in DRAFT_CATALOGUES (src/i18n/drafts.ts), not
// in CATALOGUES. Interface copy is translated from the English; game terms are
// placeholders filled from TERMS["zh-Hans"] (src/i18n/terms.ts), whose values
// come from official CMS pages. Same keys, run-time placeholders and <b>…</b>
// markup as the English (src/i18n/en), which stays the contract.
// ---------------------------------------------------------------------------

import type { Messages } from "../index";
import { calculator } from "./calculator";
import { changelog } from "./changelog";
import { extras } from "./extras";
import { graph } from "./graph";
import { handbook } from "./handbook";
import { overview } from "./overview";
import { pages } from "./pages";
import { shell } from "./shell";
import { tools } from "./tools";

export const zhHans: Messages = {
  calculator,
  changelog,
  extras,
  graph,
  handbook,
  overview,
  pages,
  shell,
  tools,
};
