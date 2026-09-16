// ---------------------------------------------------------------------------
// gameNames.ts — Symbol and quest names in the reader's language.
//
// symbols.json holds the GMS English names and stays the source of game data.
// A language adds the official names from its own client here, keyed by symbol
// `id` (I18N-6: never a translator's or a model's guess). Any name a language
// has not verified falls back to English, so a locale can ship with English
// names first and gain its own set later without a code change elsewhere.
// Analytics and anything keyed on a name keep reading `symbol.name` (English).
// ---------------------------------------------------------------------------

import type { SymbolData } from "../lib/types";
import type { Locale } from "./index";

/** The names a player reads for one symbol. */
export type SymbolNames = Pick<SymbolData, "name" | "dailyName" | "weeklyName" | "extraName">;

/**
 * Verified names per language, per symbol id. English is absent on purpose: it
 * is symbols.json. Record each set's source next to it when one is added.
 */
export const GAME_NAMES: Readonly<
  Partial<Record<Locale, Readonly<Record<number, Partial<SymbolNames>>>>>
> = {};

/** The symbol's names in `locale`, field by field, falling back to the English from symbols.json. */
export function symbolNames(symbol: SymbolData, locale: Locale): SymbolNames {
  const localised = GAME_NAMES[locale]?.[symbol.id] ?? {};
  return {
    name: localised.name ?? symbol.name,
    dailyName: localised.dailyName ?? symbol.dailyName,
    weeklyName:
      symbol.weeklyName === undefined ? undefined : (localised.weeklyName ?? symbol.weeklyName),
    extraName:
      symbol.extraName === undefined ? undefined : (localised.extraName ?? symbol.extraName),
  };
}
