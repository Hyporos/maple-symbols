// ---------------------------------------------------------------------------
// gameNames.ts — Symbol and quest names in the page's vocabulary.
//
// symbols.json holds the GMS English names and stays the source of game data.
// A name set (src/i18n/terms.ts) adds the official names from its own client
// here, keyed by symbol `id` (I18N-6: never a translator's or a model's guess).
// Any name a set has not verified falls back to GMS English, so a set can ship
// partial and fill in later without a code change elsewhere. Which set a page
// uses is `nameSetFor(edition)` in src/lib/routes.ts (`useNameSet()` in React).
// Analytics and anything keyed on a name keep reading `symbol.name` (English).
// ---------------------------------------------------------------------------

import type { SymbolData } from "../lib/types";
import type { NameSet } from "./terms";

/** The names a player reads for one symbol. */
export type SymbolNames = Pick<SymbolData, "name" | "dailyName" | "weeklyName" | "extraName">;

/**
 * Verified names per name set, per symbol id. GMS English is absent on purpose: it is
 * symbols.json. Each set records its source; docs/I18N.md §9 is the status table.
 * `ko` and `zh-Hans` stay out until their sheets cite an official source (the research in
 * docs/data-check/names-ko.csv cites namu.wiki, names-zh-Hans.csv a client-string database).
 * The `ja` and `zh-Hant` sets are dormant: only a page served in that language reads them.
 */
export const GAME_NAMES: Readonly<
  Partial<Record<NameSet, Readonly<Record<number, Partial<SymbolNames>>>>>
> = {
  // MSEA (docs/data-check/server-differences.csv, checked 2026-09-22). Region names from the
  // sheet (maplesea.com v252 Jupiter, 2026-07-20); sacred dailies from the v251 patch notes
  // (2026-06-03); weeklies from the v246 patch notes. Not published yet, so GMS English stays:
  // the six arcane dailies, the two extra quests, and symbol 10's name (the v251 daily says
  // "Dowonkyung", but no MSEA source names the symbol).
  "en-msea": {
    1: { name: "Road to Extinction", weeklyName: "Erda Spectrum" },
    2: { name: "Chew Chew Island", weeklyName: "Hungry Muto" },
    3: { name: "Lacheln", weeklyName: "Midnight Chaser" },
    4: { weeklyName: "Spirit Savior" },
    5: { name: "Moras", weeklyName: "Enheim Defense" },
    6: { weeklyName: "Protect Esfera" },
    7: { dailyName: "Investigate Cernium" },
    // The client says "Hotel Arcs"; shown short, as GMS shows "Arcus" (Brian, 2026-09-23).
    8: { name: "Arcs", dailyName: "Clean up around Hotel Arcs" },
    9: { dailyName: "Explore the Odium Area" },
    10: { dailyName: "Purify the Contamination of Dowonkyung" },
    11: { dailyName: "Defeat Arteria Remnants" },
    12: { dailyName: "Carcion Recovery Support" },
  },
  // JMS (docs/data-check/names-ja.csv, every row "official"): maplestory.nexon.co.jp; arcane
  // dailies from the ver4.01 notice (2021-12-15), sacred dailies from the ver4.43 part 2 notice
  // (2026-07-22). Symbol 8 is アルクス (its region is ホテルアルクス).
  ja: {
    1: {
      name: "消滅の旅路",
      dailyName: "消滅の旅路調査",
      weeklyName: "エルダスペクトラム",
      extraName: "リバースシティー",
    },
    2: {
      name: "チューチューアイランド",
      dailyName: "チューチューアイランド最高の料理",
      weeklyName: "腹ペコのムト",
      extraName: "ヤムヤムアイランド",
    },
    3: {
      name: "レヘルン",
      dailyName: "レヘルンの安らかな夜",
      weeklyName: "ミッドナイトチェイサー",
    },
    4: { name: "アルカナ", dailyName: "アルカナの安らかな風", weeklyName: "スピリットセイヴァー" },
    5: { name: "モラス", dailyName: "モラスの安定のために", weeklyName: "エンハイムディフェンス" },
    6: { name: "エスフェラ", dailyName: "エスフェラ研究命令", weeklyName: "プロテクトエスフェラ" },
    7: { name: "セルニウム", dailyName: "セルニウム調査" },
    8: { name: "アルクス", dailyName: "ホテルアルクスの周辺掃除" },
    9: { name: "オーディウム", dailyName: "オーディウム一帯の探査" },
    10: { name: "桃源郷", dailyName: "桃源郷の浄化作業" },
    11: { name: "アルテリア", dailyName: "アルテリアの残党退治" },
    12: { name: "カルシオン", dailyName: "カルシオンの復旧支援" },
  },
  // TMS (docs/data-check/names-zh-Hant.csv, every row "official (V280 notice) and client
  // string"): the V280 notice (2026-06-24) and the client strings on mxd.dvg.cn. The item
  // prefix (祕法符文： / 真實符文：) and the quest tag ([每日任務]) are left off, as the GMS
  // names leave off "Arcane Symbol:" and "[Daily Quest]". Weekly and extra names: not sourced.
  "zh-Hant": {
    1: { name: "消逝的旅途", dailyName: "調查消逝的旅途" },
    2: { name: "啾啾艾爾蘭", dailyName: "啾啾艾爾蘭最棒的料理" },
    3: { name: "拉契爾恩", dailyName: "拉契爾恩的平安夜" },
    4: { name: "阿爾卡娜", dailyName: "阿爾卡娜的平靜清風" },
    5: { name: "魔菈斯", dailyName: "為了魔菈斯的穩定" },
    6: { name: "艾斯佩拉", dailyName: "艾斯佩拉研究命令" },
    7: { name: "賽爾尼溫", dailyName: "調查賽爾尼溫" },
    8: { name: "阿爾克斯", dailyName: "打掃飯店阿爾克斯周邊" },
    9: { name: "奧迪溫", dailyName: "奧迪溫地區勘查" },
    10: { name: "桃源境", dailyName: "桃源境汙染淨化" },
    11: { name: "阿爾特利亞", dailyName: "消滅阿爾特利亞殘黨" },
    12: { name: "卡爾西溫", dailyName: "卡爾西溫重建支援" },
  },
};

/** The symbol's names in `nameSet`, field by field, falling back to the GMS English from symbols.json. */
export function symbolNames(symbol: SymbolData, nameSet: NameSet): SymbolNames {
  const localised = GAME_NAMES[nameSet]?.[symbol.id] ?? {};
  return {
    name: localised.name ?? symbol.name,
    dailyName: localised.dailyName ?? symbol.dailyName,
    weeklyName:
      symbol.weeklyName === undefined ? undefined : (localised.weeklyName ?? symbol.weeklyName),
    extraName:
      symbol.extraName === undefined ? undefined : (localised.extraName ?? symbol.extraName),
  };
}
