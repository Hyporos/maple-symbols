// ---------------------------------------------------------------------------
// types.ts — The shape every language's catalogue must have.
//
// The English catalogue (./en) is written `as const`, so its literal strings
// would make a poor contract for other languages. `Catalogue<T>` keeps the key
// structure and widens every string to `string`, so a Korean catalogue must
// supply exactly the same keys (a missing or extra key fails `pnpm typecheck`)
// while its values are free. docs/I18N.md §4.
// ---------------------------------------------------------------------------

/** A message whose wording depends on a count: `plural()` in src/lib/format.ts picks the form. */
export interface PluralMessage {
  one: string;
  other: string;
}

export type Catalogue<T> = T extends string
  ? string
  : T extends PluralMessage
    ? PluralMessage
    : { readonly [K in keyof T]: Catalogue<T[K]> };
