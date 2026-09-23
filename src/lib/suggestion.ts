// ---------------------------------------------------------------------------
// suggestion.ts — Which server's edition to suggest to a visitor (docs/REGIONS.md D-9).
//
// The browser's languages and time zone are hints, never a redirect: the banner
// (src/components/SuggestionBanner.tsx) offers the edition and the visitor decides.
// Conservative on purpose: only the six servers' own markets suggest anything, and
// GMS is suggested only from an English that is clearly a GMS market's (en-US, en-GB…)
// with no Asian time zone saying otherwise. Everything else gives no banner.
//
// Precedence, first match wins:
//   1. the first of `languages` in one of the servers' languages, when it names a
//      server other than GMS (ko → KMS, ja → JMS, zh-TW → TMS, en-SG → MSEA…);
//   2. the time zone (Asia/Seoul → KMS, Asia/Singapore → MSEA…);
//   3. that first language, when it names GMS (en-US, en-GB, en-CA, en-AU, en-NZ, en-IE).
// A bare "en" (or en-IN, en-ZA…) decides nothing, so the time zone speaks for it; a
// language outside the servers' own (de, fr, es…) is skipped for the next one.
// ---------------------------------------------------------------------------

import type { Region } from "./regions";

/** Where the visitor's answer to the banner is remembered: the edition they dismissed or took. */
export const SUGGESTION_KEY = "maple-symbols-suggestion";

/** The languages the six servers' clients speak, plus Southeast Asia's for MSEA. */
const SERVER_LANGUAGES = new Set(["en", "ko", "ja", "zh", "ms", "th", "id", "fil", "tl", "vi"]);

const MSEA_LANGUAGES = new Set(["ms", "th", "id", "fil", "tl", "vi"]);
const MSEA_TERRITORIES = new Set(["SG", "MY", "PH", "TH"]);
const GMS_TERRITORIES = new Set(["US", "GB", "CA", "AU", "NZ", "IE"]);

/**
 * Time zones that point at one server. Legacy names browsers still report (Asia/Saigon)
 * are listed beside the canonical ones.
 */
const ZONES: Readonly<Record<string, Region>> = {
  "Asia/Seoul": "kms",
  "Asia/Tokyo": "jms",
  "Asia/Taipei": "tms",
  "Asia/Hong_Kong": "tms",
  "Asia/Macau": "tms",
  "Asia/Shanghai": "cms",
  "Asia/Chongqing": "cms",
  "Asia/Harbin": "cms",
  "Asia/Singapore": "msea",
  "Asia/Kuala_Lumpur": "msea",
  "Asia/Kuching": "msea",
  "Asia/Manila": "msea",
  "Asia/Bangkok": "msea",
  "Asia/Jakarta": "msea",
  "Asia/Pontianak": "msea",
  "Asia/Makassar": "msea",
  "Asia/Jayapura": "msea",
  "Asia/Ho_Chi_Minh": "msea",
  "Asia/Saigon": "msea",
};

/**
 * The server one BCP-47 tag points at; null when it is in a server's language but decides
 * nothing (a bare "en"); undefined when it is in none of them, or unreadable.
 */
function languageSignal(tag: string): Region | null | undefined {
  let locale: Intl.Locale;
  try {
    locale = new Intl.Locale(tag);
  } catch {
    return undefined;
  }
  // Not maximized: "en" must stay territory-less rather than become en-Latn-US.
  const { language, script, region } = locale;
  if (!SERVER_LANGUAGES.has(language)) return undefined;
  if (language === "ko") return "kms";
  if (language === "ja") return "jms";
  if (MSEA_LANGUAGES.has(language)) return "msea";
  if (language === "zh") {
    if (region === "TW" || region === "HK" || region === "MO") return "tms";
    if (region === "SG" || region === "MY") return "msea";
    if (region === "CN") return "cms";
    if (script === "Hant") return "tms";
    return "cms"; // zh, zh-Hans
  }
  // English
  if (region && MSEA_TERRITORIES.has(region)) return "msea";
  if (region && GMS_TERRITORIES.has(region)) return "gms";
  return null;
}

/**
 * The server whose edition to suggest, or null for no banner: none when the signals point
 * nowhere, or at the edition already being viewed. `languages` is `navigator.languages`
 * (most preferred first), `timeZone` the IANA name from `Intl.DateTimeFormat`.
 */
export function suggestedEdition(
  languages: readonly string[],
  timeZone: string | undefined,
  current: Region
): Region | null {
  const byLanguage = languages.map(languageSignal).find((signal) => signal !== undefined) ?? null;
  const byZone = (timeZone && ZONES[timeZone]) || null;

  const suggestion = byLanguage && byLanguage !== "gms" ? byLanguage : (byZone ?? byLanguage);
  return suggestion === current ? null : suggestion;
}

/** The edition the visitor already dismissed or took, or null (storage may be blocked). */
export function readAnswered(): string | null {
  try {
    return window.localStorage.getItem(SUGGESTION_KEY);
  } catch {
    return null;
  }
}

/** Remember that the visitor answered the banner for this edition, so it does not come back. */
export function rememberAnswered(region: Region): void {
  try {
    window.localStorage.setItem(SUGGESTION_KEY, region);
  } catch {
    // A private window or blocked storage: the banner simply returns next visit.
  }
}
