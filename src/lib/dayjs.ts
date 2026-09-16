// ---------------------------------------------------------------------------
// dayjs.ts — Centralised dayjs instance with all required plugins loaded.
//
// dayjs.extend() mutates a global singleton.  Calling it in multiple
// component files creates a load-order dependency and risks silent failures
// when a plugin is not yet extended at the point of use.
//
// Import `dayjs` from here instead of directly from the `dayjs` package.
//
// No locale data is loaded on purpose: every `format()` reached from here is the
// locale-neutral `YYYY-MM-DD` (completion dates, graph ticks, `<time dateTime>`),
// which must not be localised. Human-readable dates go through
// `src/lib/format.ts`, so that is where `dayjs/locale/*` imports and a
// `dayjs.locale()` call belong when the locales land (docs/I18N.md B-5).
// ---------------------------------------------------------------------------

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export { dayjs };
