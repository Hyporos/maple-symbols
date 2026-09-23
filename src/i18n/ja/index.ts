// ---------------------------------------------------------------------------
// ja/index.ts — The Japanese catalogue (JMS edition): a machine draft.
//
// Machine draft (2026-09-23), awaiting a native JMS player's review before it is
// served (docs/REGIONS.md D-12). Registered in src/i18n/drafts.ts, not in
// CATALOGUES, so no page reads it yet. Same keys and syntax as the English
// catalogue (src/i18n/en/index.ts): {name} run-time values, {sacredSymbol}-style
// game terms filled from TERMS["ja"] (src/i18n/terms.ts), <b>…</b> accent markup.
// Symbol and quest names come from GAME_NAMES["ja"] (src/i18n/gameNames.ts).
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

export const ja: Messages = {
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
