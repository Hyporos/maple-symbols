// ---------------------------------------------------------------------------
// ko/index.ts — The Korean catalogue for the KMS edition: a draft, not served.
//
// Machine draft (REGIONS D-12): the interface copy awaits a native KMS player's
// review before it is served. Game terms are term placeholders filled from
// TERMS["ko"] (src/i18n/terms.ts, official KMS sources); symbol and quest names
// come from GAME_NAMES["ko"] (src/i18n/gameNames.ts). Registered in
// src/i18n/drafts.ts, which typechecks and tests it; serving it is Brian's call.
// Same message syntax and rules as the English catalogue (../en/index.ts).
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

export const ko: Messages = {
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
