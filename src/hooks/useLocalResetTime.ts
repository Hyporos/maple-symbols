// ---------------------------------------------------------------------------
// useLocalResetTime.ts — The shown server's daily reset on the visitor's clock (REGIONS D-8).
//
// Null during the prerender and the hydrating render (the visitor's zone is not known at
// build time), then `localResetTime` in an effect; null too when the reset is midnight on
// the visitor's clock as well. Recomputed when the server or the page language changes.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { localResetTime, REGION_PROFILES, type Region } from "../lib/regions";

export function useLocalResetTime(region: Region, locale: string): string | null {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let timeZone: string | undefined;
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      timeZone = undefined;
    }
    setTime(localResetTime(REGION_PROFILES[region].resetUtcOffsetHours, timeZone, locale));
  }, [region, locale]);

  return time;
}
