// ---------------------------------------------------------------------------
// index.ts — Which languages exist, and the hook components read copy through.
//
// `LOCALES` lists the languages that have a complete catalogue; `Locale` is
// derived from it, and `CATALOGUES` must hold one entry per locale, so adding a
// language is: write the catalogue, add it here, and typecheck tells you every
// key it is missing. Which one a page gets follows its URL's edition
// (docs/REGIONS.md): `useLocale` is the one place that decides. The catalogue a
// component reads has its game terms already filled for the page's name set
// (src/i18n/terms.ts, `nameSetFor` in src/lib/routes.ts).
// ---------------------------------------------------------------------------

import { useRouter } from "../contexts/RouterContext";
import {
  CATALOGUE_LANGUAGES,
  DEFAULT_EDITION,
  DEFAULT_LOCALE,
  editionFor,
  nameSetFor,
  pageValuesFor,
  servedLocale,
  type Edition,
} from "../lib/routes";
import { en } from "./en";
import { DEFAULT_NAME_SET, fillTerms, termsFor, type NameSet, type PageValues } from "./terms";
import type { Catalogue } from "./types";

export type Messages = Catalogue<typeof en>;

/** The languages with a complete catalogue: CATALOGUE_LANGUAGES in routes.ts, so the build and the app agree. */
export const LOCALES = CATALOGUE_LANGUAGES;
export type Locale = (typeof LOCALES)[number];

/** Each language's catalogue as written, term placeholders still in it: read it through `messagesFor`. */
export const CATALOGUES: Readonly<Record<Locale, Messages>> = { en };

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
    messages = fillTerms(CATALOGUES[language], { ...termsFor(nameSet), ...page });
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
