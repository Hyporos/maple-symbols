// ---------------------------------------------------------------------------
// format.ts — Locale-aware formatting of numbers, meso amounts, plurals and dates.
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

// Large-number units for meso amounts in prose (docs/REGIONS.md D-11). Korean groups
// by 만 (10^4), 억 (10^8) and 조 (10^12), keeps digit grouping inside a group and puts a
// space between units; Japanese and Chinese write the groups as bare digits run together.
// 兆 is 10^12 in Japanese and Taiwan usage but is read as 10^6 in parts of the mainland,
// where 10^12 is 万亿, so Simplified Chinese stops at 亿 and lets that group grow.
interface MesoUnits {
  /** Unit names, largest first, each worth 10^4 times the next; the last is 10^4. */
  units: readonly string[];
  /** Digit grouping inside each group ("3,010만") or bare digits ("3010万"). */
  grouped: boolean;
  separator: string;
}

const KOREAN_UNITS: MesoUnits = { units: ["조", "억", "만"], grouped: true, separator: " " };
const JAPANESE_UNITS: MesoUnits = { units: ["兆", "億", "万"], grouped: false, separator: "" };
const TRADITIONAL_UNITS: MesoUnits = { units: ["兆", "億", "萬"], grouped: false, separator: "" };
const SIMPLIFIED_UNITS: MesoUnits = { units: ["亿", "万"], grouped: false, separator: "" };

const mesoUnitsByLocale = new Map<string, MesoUnits | null>();

// Resolved by language and script, so "ko-KR", "zh-TW" and "zh-Hant-TW" find their
// system; a bare "zh" maximises to Hans. Any other language has none.
const mesoUnits = (locale: string): MesoUnits | null => {
  if (mesoUnitsByLocale.has(locale)) return mesoUnitsByLocale.get(locale) ?? null;
  const { language, script } = new Intl.Locale(locale).maximize();
  let units: MesoUnits | null = null;
  if (language === "ko") units = KOREAN_UNITS;
  else if (language === "ja") units = JAPANESE_UNITS;
  else if (language === "zh") units = script === "Hant" ? TRADITIONAL_UNITS : SIMPLIFIED_UNITS;
  mesoUnitsByLocale.set(locale, units);
  return units;
};

/**
 * A meso amount for a sentence, in the reader's own large-number units: 3,930,100,000 is
 * "3,930,100,000" in `en`, "39억 3,010만" in `ko`, "39億3010万" in `ja`, "39億3010萬" in
 * `zh-Hant` and "39亿3010万" in `zh-Hans`; groups that are zero are left out ("1억").
 * `Intl`'s compact notation would round ("39억"), and a cost has to be exact, hence the
 * hand-rolled split. Prose only: the Handbook tables keep `formatNumber`'s full digits so
 * a column still lines up and compares (D-11). Locales without a unit system fall back to
 * `formatNumber`. `undefined`, NaN and infinities give "" (an unset or off-table cost).
 */
export const formatMesos = (value: number | undefined, locale: string = DEFAULT_LOCALE): string => {
  if (value === undefined || !Number.isFinite(value)) return "";
  const system = mesoUnits(locale);
  if (!system) return formatNumber(value, locale);

  let rest = Math.round(Math.abs(value));
  const sign = value < 0 && rest > 0 ? "-" : "";
  const group = (n: number) => (system.grouped ? formatNumber(n, locale) : String(n));
  const parts: string[] = [];
  system.units.forEach((unit, i) => {
    const size = 10 ** (4 * (system.units.length - i));
    const count = Math.floor(rest / size);
    rest -= count * size;
    if (count > 0) parts.push(group(count) + unit);
  });
  if (rest > 0 || parts.length === 0) parts.push(group(rest));
  return sign + parts.join(system.separator);
};

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
 * Machine-readable dates (`YYYY-MM-DD` in `<time dateTime>`, graph ticks, the
 * sitemap) are locale-neutral and stay on plain `dayjs().format()`; a completion date
 * goes through `formatDay`.
 */
export const formatDate = (date: string, _locale: string = DEFAULT_LOCALE): string =>
  dayjs(date).format("MMM D, YYYY");

const dayFormats = new Map<string, Intl.DateTimeFormat | null>();

// Korean, Japanese and Chinese read their own year-month-day form with the weekday;
// every other language keeps ISO (Brian, 2026-09-23). Resolved by language, like mesoUnits.
const dayFormat = (locale: string): Intl.DateTimeFormat | null => {
  if (dayFormats.has(locale)) return dayFormats.get(locale) ?? null;
  const { language } = new Intl.Locale(locale).maximize();
  const format = ["ko", "ja", "zh"].includes(language)
    ? new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        weekday: "short",
        timeZone: "UTC",
      })
    : null;
  dayFormats.set(locale, format);
  return format;
};

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * A completion or attainment day as the reader writes it. English (GMS, MSEA) keeps the
 * ISO `2027-01-28` returning players know and the 360 px cards fit; `ko` gives
 * "2027. 1. 28. (목)", `ja` "2027/1/28(木)", `zh-Hant` "2027/1/28（週四）" and `zh-Hans`
 * "2027/1/28周四". The day is already the server's game day (`gameToday`), so it is
 * formatted in UTC and never shifts with the visitor's zone. Anything that is not an
 * ISO day ("Invalid Date", a label) comes back unchanged.
 */
export const formatDay = (day: string, locale: string = DEFAULT_LOCALE): string => {
  const match = ISO_DAY.exec(day);
  const format = match && dayFormat(locale);
  if (!match || !format) return day;
  const [, year, month, date] = match.map(Number);
  return format.format(new Date(Date.UTC(year, month - 1, date)));
};
