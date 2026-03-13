// ---------------------------------------------------------------------------
// dayjs.ts — Centralised dayjs instance with all required plugins loaded.
//
// dayjs.extend() mutates a global singleton.  Calling it in multiple
// component files creates a load-order dependency and risks silent failures
// when a plugin is not yet extended at the point of use.
//
// Import `dayjs` from here instead of directly from the `dayjs` package.
// ---------------------------------------------------------------------------

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export { dayjs };
