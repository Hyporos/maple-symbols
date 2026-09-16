// ---------------------------------------------------------------------------
// format.ts — Locale-aware formatting of numbers, plurals and display dates.
//
// Nothing in the app calls `toLocaleString()` with no argument or picks a word
// with `n > 1`: a bare Intl call follows the *browser's* locale, so a visitor on
// a German OS would read "1.234" inside an English UI, and `> 1` is wrong for 0
// and for fractions (docs/I18N.md B-4, B-9, rules I18N-12 and I18N-14).
//
// Every function takes the locale explicitly and defaults to DEFAULT_LOCALE
// (src/lib/routes.ts), so adding a language is a change to that default and to
// the catalogue, not a hunt through the components.
// ---------------------------------------------------------------------------

import { DEFAULT_LOCALE } from "./routes";
import { dayjs } from "./dayjs";

// Intl constructors are expensive and these run once per table row, so the
// resolved formatters are memoised per locale.
const numberFormats = new Map<string, Intl.NumberFormat>();
const pluralRules = new Map<string, Intl.PluralRules>();

const numberFormat = (locale: string): Intl.NumberFormat => {
  let format = numberFormats.get(locale);
  if (!format) numberFormats.set(locale, (format = new Intl.NumberFormat(locale)));
  return format;
};

const pluralRule = (locale: string): Intl.PluralRules => {
  let rules = pluralRules.get(locale);
  if (!rules) pluralRules.set(locale, (rules = new Intl.PluralRules(locale)));
  return rules;
};

/**
 * A number with the locale's grouping separators ("1,234" in `en`).
 * `undefined` formats as "" so an absent table cell renders empty, not "undefined".
 */
export const formatNumber = (value: number | undefined, locale: string = DEFAULT_LOCALE): string =>
  value === undefined ? "" : numberFormat(locale).format(value);

/**
 * Picks the plural form for `count` via `Intl.PluralRules`. English resolves
 * "one" for exactly 1 and "other" for everything else, including 0, fractions
 * and non-finite values; the CJK target locales resolve "other" always, which
 * is why both forms are supplied even where they are identical.
 */
export const plural = (
  count: number,
  one: string,
  other: string,
  locale: string = DEFAULT_LOCALE
): string => (pluralRule(locale).select(count) === "one" ? one : other);

/**
 * A human-readable date from an ISO `YYYY-MM-DD` day: "2023-07-25" → "Jul 25, 2023" in `en`,
 * the form the changelog shows. dayjs parses a date-only ISO string as *local* midnight
 * (unlike `new Date("2023-07-25")`, which is UTC midnight and shows the previous day west
 * of Greenwich), so the day never shifts with the visitor's time zone.
 * dayjs falls back to its built-in English locale until locale data is loaded;
 * this is the one place that has to change when it is (docs/I18N.md B-5).
 * Machine-readable dates (`YYYY-MM-DD` in `<time dateTime>`, the completion
 * dates, the sitemap) are locale-neutral and stay on plain `dayjs().format()`.
 */
export const formatDate = (date: string, _locale: string = DEFAULT_LOCALE): string =>
  dayjs(date).format("MMM D, YYYY");
