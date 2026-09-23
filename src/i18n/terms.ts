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
  // CMS Simplified Chinese (checked 2026-09-23). Sources, all on the official site mxd.web.sdo.com
  // (its guide wiki 次元站 and its notices; the version pages are images, so not quoted):
  //   [A] wiki/#/Article?ArticleID=388900 (2026-05-27): "神秘之力与原初之力……是在神秘河（神秘之力）
  //       与格兰蒂斯（原初之力）地区可以触发效果的一种特殊属性", "关于神秘/原初徽章的每个等级的属性",
  //       "通过日常/周常/活动来提升神秘徽章与原初徽章等级"
  //   [B] wiki/#/Article?ArticleID=356913 (V204 新时代 preview, 2024-01-03): "新增原初催化剂，当提取
  //       原初之力时，原初之力被提取后经验将损失40%"
  //   [C] wiki/#/Article?ArticleID=386119 (2026-03-17): "通用神秘徽章素材选择型神秘徽章交换券",
  //       "通用原初徽章素材选择型原初徽章交换券"
  //   [D] web7/news/newsContent.html?id=375941&CategoryID=275 (2025-06-25): "挑战者世界哪些道具
  //       无法转移到普通世界？"
  //   [E] web7/news/newsContent.html?id=389991&CategoryID=275 (v226 class notice, 2026-06-24):
  //       the section headings "■ 恶魔复仇者" and "■ 尖兵"
  // Chinese has no plural or article, so the plural and "a…" forms repeat the bare word.
  "zh-Hans": {
    arcane: "神秘", // [A]
    sacred: "原初", // [A]
    sacredSymbol: "原初徽章", // [A]
    arcaneSymbols: "神秘徽章", // [A]
    sacredSymbols: "原初徽章", // [A]
    aArcaneSymbol: "神秘徽章", // [A]
    aSacredSymbol: "原初徽章", // [A]
    arcanePower: "神秘之力", // [A]
    sacredPower: "原初之力", // [A]
    arcaneCatalyst: "神秘催化剂", // UNCONFIRMED (built from [B]'s 原初催化剂; no official page names it)
    sacredCatalyst: "原初催化剂", // [B]
    symbolSelector: "选择型徽章交换券", // UNCONFIRMED (built from [C]'s two names)
    arcaneSelector: "选择型神秘徽章交换券", // [C]
    sacredSelector: "选择型原初徽章交换券", // [C]
    regularServer: "普通世界", // [D] (the world type; whether CMS limits the Catalyst to it is not sourced)
    demonAvenger: "恶魔复仇者", // [E]
    xenon: "尖兵", // [E]
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
