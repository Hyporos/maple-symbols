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
  /** The two continents the symbol families belong to (the Damage Ratio tab). */
  arcaneRegion: string;
  sacredRegion: string;
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
    arcaneRegion: "Arcane River",
    sacredRegion: "Grandis",
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
    // maplesea.com v253 Content Updates (2026-08-18): "certain Arcane River and Grandis area quests".
    arcaneRegion: "Arcane River",
    sacredRegion: "Grandis",
  },
  // KMS Korean (checked 2026-09-23). Sources, all maplestory.nexon.com:
  //   [G396] Guide/N23GameInformation/Articles/396 ("[스탯] 아케인포스/어센틱포스"):
  //          "아케인심볼은 최대 20레벨까지 성장 가능", "어센틱심볼은 최대 11레벨까지 성장 가능",
  //          "캐릭터 직업에 맞는 주력 스탯과 아케인포스를 지니고 있음" (and 어센틱포스),
  //          "아케인 카탈리스트를 사용하면 지금까지 성장에 사용된 아케인심볼의 20%를 잃게 되고",
  //          "어센틱 카탈리스트를 사용하면 … 어센틱심볼의 40%를 잃게 되고",
  //          "원하는 지역의 아케인심볼로 교환할 수 있는 '선택 아케인심볼 교환권' 획득 가능",
  //          "각 지역의 어센틱심볼로 교환할 수 있는 심볼 교환권 획득 가능".
  //   [U813] news/update/813 (2026-09-17): "※ 아케인, 어센틱 카탈리스트를 사용하여 심볼을
  //          옮긴 경우에는" (the type words on their own), "선택 어센틱심볼 교환권".
  //   [U710] news/update/710 (1.2.378, 2023-06-15): "어센틱 카탈리스트는 유니온 코인샵에서
  //          구매할 수 있으며, 리부트 월드에서는 판매하지 않습니다."
  //   [U677] news/update/677 (1.2.366, 2022-06-30): "일반 월드의 캐릭터로는 일반 월드 전용
  //          하이퍼 버닝 이벤트에만 … 참여할 수 있습니다."
  //   [JOB]  Guide/N23Job (the class list): "데몬 어벤져", "제논".
  // Korean has no plural or article, so the plural and "a…" forms repeat the bare word, and
  // the client writes 아케인심볼 / 어센틱심볼 with no space.
  ko: {
    arcane: "아케인", // U813
    sacred: "어센틱", // U813
    sacredSymbol: "어센틱심볼", // G396
    arcaneSymbols: "아케인심볼", // G396
    sacredSymbols: "어센틱심볼", // G396
    aArcaneSymbol: "아케인심볼", // G396
    aSacredSymbol: "어센틱심볼", // G396
    arcanePower: "아케인포스", // G396
    sacredPower: "어센틱포스", // G396
    arcaneCatalyst: "아케인 카탈리스트", // G396
    sacredCatalyst: "어센틱 카탈리스트", // G396, U710
    // G396's generic wording for the tickets. The client also has an item "선택 심볼
    // 교환권" (U813), but it opens into 5 arcane or 1 authentic ticket, so it is not this.
    symbolSelector: "심볼 교환권",
    arcaneSelector: "선택 아케인심볼 교환권", // G396
    sacredSelector: "선택 어센틱심볼 교환권", // U813
    regularServer: "일반 월드", // U677; U710 says the catalyst is not sold in 리부트 월드
    demonAvenger: "데몬 어벤져", // JOB
    xenon: "제논", // JOB
    // news/update/806 (1.2.416, 2026-06-18): "■ 아케인리버, 그란디스 지역의 일일 퀘스트 완료에…".
    arcaneRegion: "아케인리버",
    sacredRegion: "그란디스",
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
    // ver4.43 part 1 (2026-07-02): "以下の「アーケインリバー」および「グランディス」地域において".
    arcaneRegion: "アーケインリバー",
    sacredRegion: "グランディス",
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
    // beanfun eventadid 17655 (CROWN, 2026-06-24): "以下奧術之河、格蘭蒂斯地區的部分狩獵場".
    arcaneRegion: "奧術之河",
    sacredRegion: "格蘭蒂斯",
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
    // mxd.web.sdo.com/wiki ArticleID 388900 (2026-05-27): "在神秘河（神秘之力）与格兰蒂斯（原初之力）地区".
    arcaneRegion: "神秘河",
    sacredRegion: "格兰蒂斯",
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
