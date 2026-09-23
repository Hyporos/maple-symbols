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
 * Only official sources: `ko` and `zh-Hans` come from Nexon Korea's and the CMS site's own
 * pages, not from their research sheets (docs/data-check/names-ko.csv cites namu.wiki,
 * names-zh-Hans.csv a client-string database). The `ko`, `ja`, `zh-Hant` and `zh-Hans` sets
 * are dormant: only a page served in that language reads them.
 */
export const GAME_NAMES: Readonly<
  Partial<Record<NameSet, Readonly<Record<number, Partial<SymbolNames>>>>>
> = {
  // MSEA (docs/data-check/server-differences.csv, checked 2026-09-22). Region names from the
  // sheet (maplesea.com v252 Jupiter, 2026-07-20); sacred dailies from the v251 patch notes
  // (2026-06-03); weeklies from the v246 patch notes; the two Grand Authentic symbols from the
  // same sheet (Talahart; Geardrock, v252). Not published yet, so GMS English stays: the six
  // arcane dailies, the two extra quests, the two Grand dailies, and symbol 10's name (the
  // v251 daily says "Dowonkyung", but no MSEA source names the symbol).
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
    13: { name: "Talahart" },
    14: { name: "Geardrock" },
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
    // Grand Sacred (docs/data-check/names-ja.csv): ver4.43 part 2 (2026-07-22), ver4.44 (2026-08-26).
    13: { name: "タラハート", dailyName: "タラハート:古代神の力調査" },
    14: { name: "ギアードラック", dailyName: "ギアードラック:クロノスの残滓収集" },
  },
  // KMS (checked 2026-09-23), every name from maplestory.nexon.com, not the namu.wiki sheet
  // (docs/data-check/names-ko.csv; its symbol, daily and weekly names agree). Symbols:
  // news/update/813 (2026-09-17: "10레벨 아케인심볼 : 소멸의 여로" … "에스페라") and
  // Guide/N23GameInformation/Articles/396 (the table "어센틱심볼 : 세르니움" … "카르시온").
  // Arcane dailies: news/update/633 (1.2.349, 2021-06-17: "· [일일 퀘스트] 소멸의 여로 조사" …
  // "에스페라 연구 명령"). Sacred dailies: news/update/794 (1.2.411, 2026-01-15: the table
  // "[일일 퀘스트] 세르니움 조사" … "카르시온 복구 지원"). Weeklies: Guide/N23GameInformation/
  // Articles/465 ("소멸의 여로의 에르다 스펙트럼" … "에스페라의 프로텍트 에스페라"). Extra
  // regions: news/update/633 ("리버스 시티, 얌얌 아일랜드, 신의도시 세르니움, 호텔 아르크스의
  // 일일 퀘스트가"), named by region as GMS names them. The "[일일 퀘스트]" tag is left off.
  // Symbol 8 is 아르크스 (its region is 호텔 아르크스). Dormant until the ko catalogue is served.
  ko: {
    1: {
      name: "소멸의 여로",
      dailyName: "소멸의 여로 조사",
      weeklyName: "에르다 스펙트럼",
      extraName: "리버스 시티",
    },
    2: {
      name: "츄츄 아일랜드",
      dailyName: "츄츄 아일랜드 최고의 요리",
      weeklyName: "배고픈 무토",
      extraName: "얌얌 아일랜드",
    },
    3: { name: "레헬른", dailyName: "레헬른의 평온한 밤", weeklyName: "미드나잇 체이서" },
    4: { name: "아르카나", dailyName: "아르카나의 평온한 바람", weeklyName: "스피릿 세이비어" },
    5: { name: "모라스", dailyName: "모라스의 안정을 위해", weeklyName: "엔하임 디펜스" },
    6: { name: "에스페라", dailyName: "에스페라 연구 명령", weeklyName: "프로텍트 에스페라" },
    7: { name: "세르니움", dailyName: "세르니움 조사" },
    8: { name: "아르크스", dailyName: "호텔 아르크스 주변 청소" },
    9: { name: "오디움", dailyName: "오디움 일대 탐사" },
    10: { name: "도원경", dailyName: "도원경 오염 정화" },
    11: { name: "아르테리아", dailyName: "아르테리아 잔당 처치" },
    12: { name: "카르시온", dailyName: "카르시온 복구 지원" },
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
    // Grand Sacred: only Tallahart's name is in an official notice (V280); its daily and
    // Geardock (基爾德拉) are client strings so far (docs/data-check/names-zh-Hant.csv).
    13: { name: "塔拉哈特" },
  },
  // CMS (checked 2026-09-23), only from the official site's guide wiki (mxd.web.sdo.com/wiki/,
  // 次元站), never from names-zh-Hans.csv (mxd.dvg.cn, a fan database):
  //   names: #/Article?ArticleID=357578 (神秘徽章与原初徽章, 2024-01-25), its table columns
  //   dailies and weeklies: #/Article?ArticleID=388901 (日常与周常的优先级, 2026-05-27)
  //   extras: #/Article?ArticleID=376041 (成就列表, 2025-06-27): "完成反转城所有的每日任务",
  //     "完成真香岛的所有每日任务"
  // Symbol 6's daily is written 爱斯佩拉 there, though the same site writes the region 埃斯佩拉
  // everywhere else: kept as published, for the native review to settle.
  "zh-Hans": {
    1: {
      name: "消亡旅途",
      dailyName: "调查消亡旅途",
      weeklyName: "艾尔达光谱",
      extraName: "反转城",
    },
    2: {
      name: "啾啾岛",
      dailyName: "啾啾岛的顶级美食",
      weeklyName: "饥饿的穆托",
      extraName: "真香岛",
    },
    3: { name: "拉克兰", dailyName: "拉克兰的宁静夜晚", weeklyName: "午夜追踪者" },
    4: { name: "阿尔卡那", dailyName: "阿尔卡那的祥和之风", weeklyName: "灵魂拯救者" },
    5: { name: "莫拉斯", dailyName: "为了莫拉斯的平静", weeklyName: "安哈因防御" },
    6: { name: "埃斯佩拉", dailyName: "爱斯佩拉研究命令", weeklyName: "保护埃斯佩拉" },
    7: { name: "塞尔提乌", dailyName: "调查塞尔提乌" },
    8: { name: "亚克斯", dailyName: "打扫亚克斯旅馆周边" },
    9: { name: "奥迪乌姆", dailyName: "探索奥迪乌姆一带" },
    10: { name: "桃源境", dailyName: "净化桃源境的污染" },
    11: { name: "阿尔特里亚", dailyName: "消灭阿尔特里亚残余势力" },
    12: { name: "卡西翁", dailyName: "卡西翁重建支援" },
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
