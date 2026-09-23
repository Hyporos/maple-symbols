// ---------------------------------------------------------------------------
// zh-Hant/index.ts — The Traditional Chinese catalogue for the TMS edition.
//
// MACHINE DRAFT (2026-09-23), awaiting a native TMS player's review before it
// is served (REGIONS D-12). It is registered in src/i18n/drafts.ts only, so no
// page reads it yet. Interface copy is a machine translation of ./en; game
// terms are placeholders filled from TERMS["zh-Hant"] (src/i18n/terms.ts) and
// symbol and quest names come from GAME_NAMES (src/i18n/gameNames.ts), both
// from official TMS sources. The meso word is 楓幣. Same message syntax as ./en.
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

export const zhHant: Messages = {
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
