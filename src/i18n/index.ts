// ---------------------------------------------------------------------------
// index.ts — Which languages exist, and the hook components read copy through.
//
// `LOCALES` lists the languages that have a complete catalogue; `Locale` is
// derived from it, and `CATALOGUES` must hold one entry per locale, so adding a
// language is: write the catalogue, add it here, and typecheck tells you every
// key it is missing. Which one a page gets follows its URL's edition
// (docs/REGIONS.md): `useLocale` is the one place that decides.
// ---------------------------------------------------------------------------

import { useRouter } from "../contexts/RouterContext";
import { CATALOGUE_LANGUAGES, DEFAULT_LOCALE, editionFor, servedLocale } from "../lib/routes";
import { en } from "./en";
import type { Catalogue } from "./types";

export type Messages = Catalogue<typeof en>;

/** The languages with a complete catalogue: CATALOGUE_LANGUAGES in routes.ts, so the build and the app agree. */
export const LOCALES = CATALOGUE_LANGUAGES;
export type Locale = (typeof LOCALES)[number];

export const CATALOGUES: Readonly<Record<Locale, Messages>> = { en };

export const isLocale = (tag: string): tag is Locale =>
  (LOCALES as readonly string[]).includes(tag);

/** The catalogue for a language tag; anything unknown gets the default language. */
export const messagesFor = (locale: string): Messages =>
  CATALOGUES[isLocale(locale) ? locale : (DEFAULT_LOCALE as Locale)];

/**
 * The language the page is being served in: the URL's edition (docs/REGIONS.md), once its
 * catalogue exists; English until then. Outside a RouterProvider the path is "/" (GMS).
 */
export const useLocale = (): Locale => {
  const locale = servedLocale(editionFor(useRouter().path));
  return isLocale(locale) ? locale : (DEFAULT_LOCALE as Locale);
};

/** The current language's catalogue: `const m = useMessages();` then `m.calculator.daily`. */
export const useMessages = (): Messages => messagesFor(useLocale());

export { interpolate, pluralMessage } from "./interpolate";
export type { PluralMessage } from "./types";
