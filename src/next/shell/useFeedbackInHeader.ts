// ---------------------------------------------------------------------------
// useFeedbackInHeader.ts — Where the /next Feedback button lives (Brian, 2026-09-23).
//
// From FLOATING_FEEDBACK_MIN_WIDTH up it floats bottom-right in the page gutter, which is wide
// enough there to hold it clear of the cards (1200 px content plus 32 px padding each side). Below
// it the gutter is too narrow, so it moves into the header's action cluster (the ☰ menu on
// phones). Markup differs, not just style, so this is a hook rather than a `min-[…]:` class.
// ---------------------------------------------------------------------------

import { useSyncExternalStore } from "react";
import { useBreakpoint } from "../../hooks/useBreakpoint";

/** The narrowest viewport at which the Feedback button floats; below it, it sits in the header. */
export const FLOATING_FEEDBACK_MIN_WIDTH = 1256;

const NARROW_QUERY = `(max-width: ${FLOATING_FEEDBACK_MIN_WIDTH - 1}px)`;

/**
 * Whether the Feedback button belongs in the header. Tablets and phones always (`isTablet`), so
 * the answer agrees with BreakpointContext; between 1150 px and the floating width the media
 * query says so too. The server answer is the phone one, like BreakpointContext's.
 */
export function useFeedbackInHeader(): boolean {
  const { isTablet } = useBreakpoint();
  const narrow = useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(NARROW_QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(NARROW_QUERY).matches,
    () => true
  );
  return isTablet || narrow;
}
