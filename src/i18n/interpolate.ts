// ---------------------------------------------------------------------------
// interpolate.ts — Fills {placeholders} in a catalogue message, as plain text.
//
// For strings that land in attributes, <title>, aria-labels and analytics-free
// places where React markup cannot go. Sentences with <b> accent markup render
// through <Message> (Message.tsx) instead, which uses the same placeholder rules.
// ---------------------------------------------------------------------------

import { formatNumber, plural } from "../lib/format";
import { DEFAULT_LOCALE } from "../lib/routes";
import type { PluralMessage } from "./types";

export type MessageValues = Readonly<Record<string, string | number>>;

const PLACEHOLDER = /\{(\w+)\}/g;

/** A value as the reader sees it: numbers get the locale's digit grouping. */
export const displayValue = (value: string | number, locale: string = DEFAULT_LOCALE): string =>
  typeof value === "number" ? formatNumber(value, locale) : value;

/**
 * Replaces each `{name}` with `values.name`. An unknown placeholder throws: a
 * translation that names a value the code does not pass is a bug, not a blank.
 */
export function interpolate(
  message: string,
  values: MessageValues = {},
  locale: string = DEFAULT_LOCALE
): string {
  return message.replace(PLACEHOLDER, (_, name: string) => {
    if (!(name in values)) throw new Error(`i18n: no value for {${name}} in "${message}"`);
    return displayValue(values[name], locale);
  });
}

/** The plural form for `count`, as a message still holding its placeholders. */
export const pluralMessage = (
  message: PluralMessage,
  count: number,
  locale: string = DEFAULT_LOCALE
): string => plural(count, message.one, message.other, locale);
