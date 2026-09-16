// ---------------------------------------------------------------------------
// BreakpointContext.tsx — Single source of truth for responsive breakpoints.
//
// Registers exactly two matchMedia listeners for the entire app, regardless
// of how many components consume the breakpoint values. All consumers call
// useBreakpoint() which reads from this context rather than registering their
// own listeners.
//
// Wrap the app root with <BreakpointProvider> (done in App.tsx).
// ---------------------------------------------------------------------------

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
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
