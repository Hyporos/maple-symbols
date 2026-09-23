// ---------------------------------------------------------------------------
// terms.ts — The game's own words per name set, filled into the catalogue.
//
// A name set is one client's official vocabulary (docs/REGIONS.md §2): GMS and
// MSEA are both English but say "Sacred Symbol" and "Authentic Symbol". Catalogue
// copy names a game term by placeholder ("{sacredSymbol} Calculator") and
// `fillTerms` replaces it before any component sees the message, so one English
// catalogue serves both, and the ko/ja/zh catalogues use the same placeholders.
// Which name set a page gets is `nameSetFor(edition)` in src/lib/routes.ts.
//
// A term is a game word the client names (symbol types, Force/Power, Catalyst,
// Selector, server types, class names), never a word that only changes with the
// language: each catalogue writes its own "mesos". Values come only from the
// client or official patch notes (D-12); anything not yet seen there is marked
// UNCONFIRMED where it is defined. How to add a term: docs/I18N.md §10.
//
// JSX-free and free of runtime imports from src/lib/routes.ts: routes.ts and the
// routes plugin in vite.config.ts read it at build time.
// ---------------------------------------------------------------------------

/** Every client vocabulary (docs/REGIONS.md §2). An edition names its own in `EDITIONS`. */
export const NAME_SETS = ["en-gms", "en-msea", "ko", "ja", "zh-Hant", "zh-Hans"] as const;
export type NameSet = (typeof NAME_SETS)[number];

/** The vocabulary of a page that has none of its own: GMS English. */
export const DEFAULT_NAME_SET: NameSet = "en-gms";

/**
 * The term placeholders. Each is one form of a word, so English reads naturally with no
 * string surgery: a plural, and a form carrying its indefinite article ("a…"), are their own
 * terms. Languages without those forms repeat the bare word.
 */
export interface Terms {
  /** The type words on their own: the Arcane/Sacred toggle, "Arcane and Sacred symbols". */
  arcane: string;
  sacred: string;
  /** One symbol of the type, as in "Arcane & Sacred Symbol Calculator": "Sacred Symbol". */
  sacredSymbol: string;
  /** More than one: "Arcane Symbols". */
  arcaneSymbols: string;
  sacredSymbols: string;
  /** With the indefinite article: "an Arcane Symbol", "a Sacred Symbol". */
  aArcaneSymbol: string;
  aSacredSymbol: string;
  /** The stat the symbols add: "Arcane Power" in GMS, "Arcane Force" in MSEA. */
  arcanePower: string;
  sacredPower: string;
  /** The transfer items. */
  arcaneCatalyst: string;
  sacredCatalyst: string;
  /** The selector items, generic and per type. */
  symbolSelector: string;
  arcaneSelector: string;
  sacredSelector: string;
  /** The world type the Catalyst is limited to ("[Regular Server Only]"). */
  regularServer: string;
  /** Class names. */
  demonAvenger: string;
  xenon: string;
}

/**
 * Values that come with the page rather than its name set. `{pageServer}` is the short name
 * of the server whose edition the page is ("(GMS)" in the Handbook description); it is not
 * `{server}`, which components pass at run time for the server whose numbers are shown.
 */
export interface PageValues {
  pageServer: string;
  /**
   * The game as the calculator's title names it: "MapleStory" on GMS, the server code on
   * every other edition ("MSEA Arcane & Authentic Symbol Calculator", which also keeps the
   * MSEA title within SEO-6's 60 columns; Brian, 2026-09-23).
   */
  pageGame: string;
}

export type TermValues = Terms & PageValues;

/**
 * Every name set's terms. GMS and MSEA are complete; a language's set is added with its
 * catalogue, and the type checks both its key (a `NameSet`) and that it has every term.
 * `termsFor` throws for a set that is still missing, so a translated edition cannot ship
 * without one (src/i18n/terms.test.ts holds every edition to it).
 */
export const TERMS: Readonly<
  { "en-gms": Terms; "en-msea": Terms } & Partial<Record<NameSet, Terms>>
> = {
  // GMS English: the wording the site has always used (the GMS client and nexon.com patch notes).
  "en-gms": {
    arcane: "Arcane",
    sacred: "Sacred",
    sacredSymbol: "Sacred Symbol",
    arcaneSymbols: "Arcane Symbols",
    sacredSymbols: "Sacred Symbols",
    aArcaneSymbol: "an Arcane Symbol",
    aSacredSymbol: "a Sacred Symbol",
    arcanePower: "Arcane Power",
    sacredPower: "Sacred Power",
    arcaneCatalyst: "Arcane Catalyst",
    sacredCatalyst: "Sacred Catalyst",
    symbolSelector: "Symbol Selector",
    arcaneSelector: "Arcane Symbol Selector",
    sacredSelector: "Sacred Symbol Selector",
    regularServer: "Regular Server",
    demonAvenger: "Demon Avenger",
    xenon: "Xenon",
  },
  // MSEA English. Source: maplesea.com patch notes v251 (2026-06-03) and v252 Jupiter
  // (2026-07-20), which name "Authentic Symbol", "Authentic Force", "Arcane Force" and
  // "Authentic Catalyst". Plurals and articles are English forms of those. Every value
  // marked UNCONFIRMED is the GMS word or a form built from a confirmed one, awaiting an
  // MSEA client screenshot or patch note (docs/REGIONS.md §8, phase 5).
  "en-msea": {
    arcane: "Arcane", // UNCONFIRMED as a label on its own (from "Arcane Force")
    sacred: "Authentic", // UNCONFIRMED as a label on its own (from "Authentic Symbol")
    sacredSymbol: "Authentic Symbol",
    arcaneSymbols: "Arcane Symbols", // UNCONFIRMED (GMS wording; MSEA keeps "Arcane Force")
    sacredSymbols: "Authentic Symbols",
    aArcaneSymbol: "an Arcane Symbol", // UNCONFIRMED, as arcaneSymbols
    aSacredSymbol: "an Authentic Symbol",
    arcanePower: "Arcane Force",
    sacredPower: "Authentic Force",
    arcaneCatalyst: "Arcane Catalyst", // UNCONFIRMED (GMS wording)
    sacredCatalyst: "Authentic Catalyst",
    symbolSelector: "Symbol Selector", // UNCONFIRMED (GMS wording)
    arcaneSelector: "Arcane Symbol Selector", // UNCONFIRMED (GMS wording)
    sacredSelector: "Authentic Symbol Selector", // UNCONFIRMED (built from "Authentic Symbol")
    regularServer: "Regular Server", // UNCONFIRMED (GMS wording)
    demonAvenger: "Demon Avenger", // UNCONFIRMED (GMS wording)
    xenon: "Xenon", // UNCONFIRMED (GMS wording)
  },
  // JMS Japanese, all from maplestory.nexon.co.jp. Japanese has no plural or article, so the
  // plural and "a…" forms repeat the bare word. Sources, each quoting the term itself:
  //  [1] ver4.43 part 1 notice (2026-07-02), notice/view/?alias=d800f7b0ac4e4007bfb6f9b7651be82d
  //      「…入手できるアーケインシンボルの数量が増加しました。」, the same for オーセンティックシンボル;
  //      the class sections name デーモンアヴェンジャー and ゼノン.
  //  [2] Force guide, gameguide/growth/force/: 「…メインステータスとアーケインフォースを持っています。」
  //      and 「…メインステータスとオーセンティックフォースを持っています。」
  //  [3] ハイパーバーニングBEYOND notice (2025-12-10), notice/view/?alias=475941b65c1c41b391a6a76becf6e349
  //      「「アーケインカタリスト」または「オーセンティックカタリスト」を使用してシンボルを移動した場合…」
  //  [4] ミッドナイトパーティー notice (2024-07-03), notice/view/?alias=3f2bb705d47a4351a95b765e5fa31cfd
  //      「「選択型シンボル交換券」を使用すると「選択型アーケインシンボル交換券」300個か
  //      「選択型オーセンティックシンボル交換券」60個から1つを選択して獲得できます。」
  //  [5] NEW AGE ver4.20 part 1 notice (2023-12-13), notice/view/?alias=c415a36695e84d64a227535668376c7d
  //      「…一般ワールドと同じ量に修正しました。」 (JMS made its Reboot world a 一般ワールド too:
  //      notice/view/?alias=72a980393e9740f9b9e34b6218848d3c, 2024-10-22.)
  //  [6] 夜のサーカス団 IN 武陵桃源 notice (2025-11-30), notice/view/?alias=62d95a6886244b27b76651ed69a63bc1
  //      「アーケイン/オーセンティックシンボルの獲得量増加」, the type words split off on their own.
  ja: {
    arcane: "アーケイン", // [6]
    sacred: "オーセンティック", // [6]
    sacredSymbol: "オーセンティックシンボル", // [1]
    arcaneSymbols: "アーケインシンボル", // [1]
    sacredSymbols: "オーセンティックシンボル", // [1]
    aArcaneSymbol: "アーケインシンボル", // [1]
    aSacredSymbol: "オーセンティックシンボル", // [1]
    arcanePower: "アーケインフォース", // [2]
    sacredPower: "オーセンティックフォース", // [2]
    arcaneCatalyst: "アーケインカタリスト", // [3]
    sacredCatalyst: "オーセンティックカタリスト", // [3]
    symbolSelector: "選択型シンボル交換券", // [4]
    arcaneSelector: "選択型アーケインシンボル交換券", // [4]
    sacredSelector: "選択型オーセンティックシンボル交換券", // [4]
    regularServer: "一般ワールド", // [5]
    demonAvenger: "デーモンアヴェンジャー", // [1]
    xenon: "ゼノン", // [1]
  },
};

/** The terms of a name set; throws for one whose table does not exist yet. */
export function termsFor(nameSet: NameSet): Terms {
  const terms = TERMS[nameSet];
  if (terms === undefined) throw new Error(`i18n: no terms table for name set "${nameSet}"`);
  return terms;
}

/** Every term placeholder's name: reserved, so no run-time value may use one. */
export const TERM_NAMES: readonly (keyof TermValues)[] = [
  ...(Object.keys(TERMS["en-gms"]) as (keyof Terms)[]),
  "pageServer",
  "pageGame",
];

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Replaces every term placeholder in `node` (a message, or a catalogue or area of messages)
 * with its value, leaving the run-time placeholders (`{count}`, `{server}`…) for
 * interpolate() and <Message>. Returns a new object of the same shape.
 */
export function fillTerms<T>(node: T, values: TermValues): T {
  if (typeof node === "string") {
    return node.replace(PLACEHOLDER, (match, name: string) =>
      Object.hasOwn(values, name) ? values[name as keyof TermValues] : match
    ) as T;
  }
  if (node === null || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map((item: unknown) => fillTerms(item, values)) as T;
  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [key, fillTerms(value, values)])
  ) as T;
}
