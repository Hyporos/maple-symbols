// ---------------------------------------------------------------------------
// en/index.ts — The English catalogue: the source language and the key contract.
//
// One file per area so a change to one component's copy touches one file.
// Message syntax (src/i18n/interpolate.ts and Message.tsx):
//   {name}        a value supplied by the caller ("{count} days to go")
//   <b>…</b>      accent markup inside the sentence; renders as the accent <span>
// Write each message as one whole sentence with its markup inside (I18N-10) and
// no line breaks (I18N-11); plural wording is a { one, other } pair (I18N-14).
// ---------------------------------------------------------------------------

import { calculator } from "./calculator";

export const en = {
  calculator,
} as const;
