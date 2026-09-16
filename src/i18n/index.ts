// ---------------------------------------------------------------------------
// index.ts — Which languages exist, and the hook components read copy through.
//
// `LOCALES` lists the languages that have a complete catalogue; `Locale` is
// derived from it, and `CATALOGUES` must hold one entry per locale, so adding a
// language is: write the catalogue, add it here, and typecheck tells you every
// key it is missing. The app serves DEFAULT_LOCALE until locale-prefixed URLs
// land (docs/I18N.md I18N-2, I18N-4); `useLocale` is the one place that changes.
// ---------------------------------------------------------------------------

import { DEFAULT_LOCALE } from "../lib/routes";
import { en } from "./en";
import type { Catalogue } from "./types";

export type Messages = Catalogue<typeof en>;

export const LOCALES = ["en"] as const;
export type Locale = (typeof LOCALES)[number];

export const CATALOGUES: Readonly<Record<Locale, Messages>> = { en };

export const isLocale = (tag: string): tag is Locale =>
  (LOCALES as readonly string[]).includes(tag);

/** The catalogue for a language tag; anything unknown gets the default language. */
export const messagesFor = (locale: string): Messages =>
  CATALOGUES[isLocale(locale) ? locale : (DEFAULT_LOCALE as Locale)];

/** The language the page is being served in. Always the default until I18N-4. */
export const useLocale = (): Locale => DEFAULT_LOCALE as Locale;

/** The current language's catalogue: `const m = useMessages();` then `m.calculator.daily`. */
export const useMessages = (): Messages => messagesFor(useLocale());

export { interpolate, pluralMessage } from "./interpolate";
export type { PluralMessage } from "./types";
