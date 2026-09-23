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
  // TMS Traditional Chinese (checked 2026-09-23). Sources, official beanfun notices at
  // https://maplestory-event.beanfun.com/eventad/eventad?eventadid=<id>:
  //   17655 V280 系統改善 (2026-06-24): "每日任務獎勵獲得的祕法符文數量增加",
  //     "真實符文及豪華真實符文成長等級達到11級時" (it spells both 祕法符文 and 秘法符文).
  //   8615 系統改動與改善事項 (2022-06-22): "配發的祕法符文能力值上調。裝備時變更為增加神秘力量40".
  //   17647 幻影降臨之夜 (2026-06-24): "神秘力量增加 10 … 真實力量增加 10"; 14768 加速成長
  //     (2025-12-03): "真實力量達成20". Older notices say 真實之力 (9427, 9922, 13015).
  //   9922 系統改善 (2024-01-10): "使用真實觸媒，可以將真實符文移動到世界內的其他角色".
  //   9914 伊甸提斯克探險 (2024-01-10): "選擇符文交換券（arc 200 / aut 40）",
  //     "選擇真實符文交換券可獲得的道具為"; 8172 浪漫風水師菈菈 (2022-01-12): "選擇祕法符文交換券X30".
  //   10780 Maple19 回憶島 (2024-09-11): "一般伺服器：卡勒馬珍貴附加方塊30個交換券 RB伺服器：…".
  //   10784 (The Day After): "惡魔復仇者", "傑諾" in its class lists.
  // Chinese has no plural or article, so those forms repeat the bare word.
  "zh-Hant": {
    arcane: "祕法", // UNCONFIRMED as a label on its own (from 祕法符文)
    sacred: "真實", // UNCONFIRMED as a label on its own (from 真實符文)
    sacredSymbol: "真實符文",
    arcaneSymbols: "祕法符文",
    sacredSymbols: "真實符文",
    aArcaneSymbol: "祕法符文",
    aSacredSymbol: "真實符文",
    arcanePower: "神秘力量",
    sacredPower: "真實力量",
    // UNCONFIRMED: no official notice found; 祕法觸媒 is what every player source says
    // (forum.gamer.com.tw, YouTube guides), and it matches the official 真實觸媒.
    arcaneCatalyst: "祕法觸媒",
    sacredCatalyst: "真實觸媒",
    symbolSelector: "選擇符文交換券",
    arcaneSelector: "選擇祕法符文交換券",
    sacredSelector: "選擇真實符文交換券",
    // The regular world type as opposed to Reboot (RB伺服器). UNCONFIRMED as the Catalyst's own
    // restriction label: 9922 only says 真實觸媒 is "不在Rb世界販售".
    regularServer: "一般伺服器",
    demonAvenger: "惡魔復仇者",
    xenon: "傑諾",
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
