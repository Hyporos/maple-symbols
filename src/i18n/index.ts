// ---------------------------------------------------------------------------
// index.ts — Which languages exist, and the hook components read copy through.
//
// `Locale` is every language with a catalogue, published or draft; typecheck holds
// each to the English keys. `LOCALES` is the ones this build serves (CATALOGUE_LANGUAGES
// in src/lib/routes.ts): the published ones, plus the drafts on a Vercel preview. Which
// one a page gets follows its URL's edition (docs/REGIONS.md): `useLocale` is the one
// place that decides. The catalogue a
// component reads has its game terms already filled for the page's name set
// (src/i18n/terms.ts, `nameSetFor` in src/lib/routes.ts).
// ---------------------------------------------------------------------------

import { useRouter } from "../contexts/RouterContext";
import {
  CATALOGUE_LANGUAGES,
  DEFAULT_EDITION,
  SERVES_DRAFTS,
  type DraftLanguage,
  DEFAULT_LOCALE,
  editionFor,
  nameSetFor,
  pageValuesFor,
  servedLocale,
  type Edition,
} from "../lib/routes";
import { DRAFT_CATALOGUES } from "./drafts";
import { en } from "./en";
import { DEFAULT_NAME_SET, fillTerms, termsFor, type NameSet, type PageValues } from "./terms";
import type { Catalogue } from "./types";

export type Messages = Catalogue<typeof en>;

/** Every language that has a catalogue, published or draft. */
export type Locale = "en" | DraftLanguage;

/** The languages this build serves: CATALOGUE_LANGUAGES in routes.ts, so the build and the app agree. */
export const LOCALES = CATALOGUE_LANGUAGES as readonly Locale[];

/**
 * Each served language's catalogue as written, term placeholders still in it: read it
 * through `messagesFor`. The drafts join only in a build that serves them.
 */
export const CATALOGUES: Readonly<Partial<Record<Locale, Messages>>> = SERVES_DRAFTS
  ? { en, ...DRAFT_CATALOGUES }
  : { en };

export const isLocale = (tag: string): tag is Locale =>
  (LOCALES as readonly string[]).includes(tag);

const filled = new Map<string, Messages>();

/**
 * The catalogue for a language tag (anything unknown gets the default language) with its
 * terms filled from `nameSet` and the page's own values (`{pageServer}`, `{pageGame}`) from
 * `page`. Memoised, so every call for the same page returns the same object.
 */
export function messagesFor(
  locale: string,
  nameSet: NameSet = DEFAULT_NAME_SET,
  page: PageValues = pageValuesFor(DEFAULT_EDITION)
): Messages {
  const language = isLocale(locale) ? locale : (DEFAULT_LOCALE as Locale);
  const key = `${language}|${nameSet}|${page.pageServer}|${page.pageGame}`;
  let messages = filled.get(key);
  if (messages === undefined) {
    messages = fillTerms(CATALOGUES[language] ?? en, { ...termsFor(nameSet), ...page });
    filled.set(key, messages);
  }
  return messages;
}

/** The catalogue a page of the edition reads: its served language, in its own terms. */
export const editionMessages = (edition: Edition): Messages =>
  messagesFor(servedLocale(edition), nameSetFor(edition), pageValuesFor(edition));

/**
 * The language the page is being served in: the URL's edition (docs/REGIONS.md), once its
 * catalogue exists; English until then. Outside a RouterProvider the path is "/" (GMS).
 */
export const useLocale = (): Locale => {
  const locale = servedLocale(editionFor(useRouter().path));
  return isLocale(locale) ? locale : (DEFAULT_LOCALE as Locale);
};

/** The page's vocabulary, for symbol and quest names (`symbolNames`, src/i18n/gameNames.ts). */
export const useNameSet = (): NameSet => nameSetFor(editionFor(useRouter().path));

/** The current page's catalogue: `const m = useMessages();` then `m.calculator.daily`. */
export const useMessages = (): Messages => editionMessages(editionFor(useRouter().path));

export { interpolate, pluralMessage } from "./interpolate";
export type { NameSet } from "./terms";
export type { PluralMessage } from "./types";
