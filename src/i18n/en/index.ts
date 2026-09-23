// ---------------------------------------------------------------------------
// en/index.ts — The English catalogue: the source language and the key contract.
//
// One file per area so a change to one component's copy touches one file.
// Message syntax (src/i18n/interpolate.ts and Message.tsx):
//   {name}          a value supplied by the caller ("{count} days to go")
//   {sacredSymbol}  a game term (the names in src/i18n/terms.ts), filled from the
//                   page's terms table before any component reads the message
//   <b>…</b>        accent markup inside the sentence; renders as the accent <span>
// Write each message as one whole sentence with its markup inside (I18N-10) and
// no line breaks (I18N-11); plural wording is a { one, other } pair (I18N-14).
// This file and everything it imports stay free of JSX and React: the routes
// plugin in vite.config.ts reads page titles from here at build time.
// ---------------------------------------------------------------------------

import { calculator } from "./calculator";
import { extras } from "./extras";
import { graph } from "./graph";
import { handbook } from "./handbook";
import { overview } from "./overview";
import { pages } from "./pages";
import { shell } from "./shell";
import { tools } from "./tools";

export const en = {
  calculator,
  extras,
  graph,
  handbook,
  overview,
  pages,
  shell,
  tools,
} as const;
