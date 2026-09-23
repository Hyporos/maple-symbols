// ---------------------------------------------------------------------------
// BreakpointContext.tsx — Single source of truth for responsive breakpoints.
//
// Registers exactly two matchMedia listeners for the entire app, regardless
// of how many components consume the breakpoint values. All consumers call
// useBreakpoint() which reads from this context rather than registering their
// own listeners.
//
// Wrap the app root with <BreakpointProvider> (done in App.tsx).
//
// Prebuilt pages (src/entry-server.tsx) are rendered as phones: Google indexes the
// phone version (mobile-first), and Brian chose it on 2026-09-22. The server snapshot
// below is that phone answer, which React also uses while hydrating, so the prebuilt
// HTML and the first browser render agree; the real width takes over right after.
// ---------------------------------------------------------------------------

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

interface BreakpointContextValue {
  /** True when viewport width is below the Tailwind `md` breakpoint (767px). */
  isMobile: boolean;
  /** True when viewport width is below ~1150px (below a custom `xl` breakpoint). */
  isTablet: boolean;
}

const BreakpointContext = createContext<BreakpointContextValue>({
  isMobile: false,
  isTablet: false,
});

/** Both queries are max-width ones, so a phone matches both: true is the phone answer. */
const PHONE = true;

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => PHONE
  );
}

export function BreakpointProvider({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(max-width: 1149px)");

  return (
    <BreakpointContext.Provider value={{ isMobile, isTablet }}>
      {children}
    </BreakpointContext.Provider>
  );
}

/** Returns `{ isMobile, isTablet }` from the nearest BreakpointProvider. */
export function useBreakpoint(): BreakpointContextValue {
  return useContext(BreakpointContext);
}
