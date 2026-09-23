// ---------------------------------------------------------------------------
// game-data.mjs — the pure parts of check-game-data.mjs: each server's expected
// numbers, and the parsers of the regional sources.
//
// No network and no file reads here, so src/test/dataWatcher.test.ts can pin
// them. `expectedFor` mirrors createInitialSymbols(region) in src/lib/data.ts
// (the script is plain Node and cannot import TypeScript); the test fails if the
// two ever disagree.
// ---------------------------------------------------------------------------

/** The servers, GMS first, in the order the report lists them (src/lib/regions.ts). */
export const SERVERS = ["gms", "msea", "kms", "jms", "tms", "cms"];

/**
 * @typedef {{ id: number, name: string, type: string, dailyName: string, weeklyName?: string,
 *   extraName?: string, dailySymbols: number, mesosRequired: number[] }} WatchedSymbol
 * @typedef {{ arcane: number, sacred: number }} PerType
 * @typedef {{ region: string, weekly: { perClear: number, clears: number },
 *   classGains: { demonAvengerHp: PerType, xenonAllStat: PerType },
 *   status: Record<string, string>, overridden: number[], symbols: WatchedSymbol[] }} Expected
 */

/**
 * One server's numbers as the site uses them: every symbol of symbols.json (the GMS
 * base) with that server's overrides from regions.json applied by id, plus its
 * weekly, class gains and the status of each kind of number.
 *
 * @param {string} region
 * @param {{ symbols: WatchedSymbol[] }} base symbols.json
 * @param {Record<string, any>} profiles regions.json
 * @returns {Expected}
 */
export function expectedFor(region, base, profiles) {
  const profile = profiles[region];
  if (!profile) throw new Error(`no profile for ${region} in regions.json`);
  return {
    region,
    weekly: profile.weekly,
    classGains: profile.classGains,
    status: profile.status,
    overridden: Object.keys(profile.symbols ?? {}).map(Number),
    symbols: base.symbols.map((def) => ({ ...def, ...profile.symbols?.[String(def.id)] })),
  };
}

/** The most one day of quests pays: the daily, doubled (or ×1.5) by the extra quest where there is one. */
export const dailyCap = (symbol, extraMultiplier) =>
  symbol.extraName ? symbol.dailySymbols * extraMultiplier[symbol.type] : symbol.dailySymbols;

const fmt = (n) => n.toLocaleString("en-US");

/** One line on what a server's numbers are, printed beside its patch notes so a reader can compare. */
export function describeExpected(expected, extraMultiplier) {
  const byType = (type) => expected.symbols.filter((s) => s.type === type);
  const dailies = (type) => {
    const list = byType(type);
    const counts = new Map();
    for (const s of list) counts.set(s.dailySymbols, (counts.get(s.dailySymbols) ?? 0) + 1);
    const usual = [...counts].sort((a, b) => b[1] - a[1])[0][0];
    const odd = list
      .filter((s) => s.dailySymbols !== usual)
      .map(
        (s) =>
          `${s.name} ${s.dailySymbols}${s.extraName ? ` (${dailyCap(s, extraMultiplier)} with ${s.extraName})` : ""}`
      );
    return `${type} ${usual}${odd.length ? `, except ${odd.join(" and ")}` : ""}`;
  };
  const { perClear, clears } = expected.weekly;
  const { xenonAllStat: x, demonAvengerHp: da } = expected.classGains;
  const own = expected.overridden.length
    ? `own costs for ${expected.overridden.length} symbol${expected.overridden.length === 1 ? "" : "s"}`
    : "costs as GMS";
  const s = expected.status;
  return (
    `daily ${dailies("arcane")}; ${dailies("sacred")}; weekly ${perClear} × ${clears}; ` +
    `per level Xenon ${x.arcane} / ${x.sacred}, Demon Avenger ${fmt(da.arcane)} / ${fmt(da.sacred)}; ${own} ` +
    `(status: dailies ${s.dailySymbols}, weekly ${s.weekly}, arcane costs ${s.mesosArcane}, ` +
    `sacred costs ${s.mesosSacred}, class gains ${s.classGains})`
  );
}

// --- Patch-note text ---------------------------------------------------------------------------

/** "Symbol" in every server's language: 심볼, シンボル, 符文 (TMS), 徽章 (CMS). */
export const SYMBOL_WORDS = /심볼|シンボル|符文|徽章|symbol/i;
/**
 * A weekly reset day moving (as it did in 2025) is worth a line even without the word
 * "symbol". No Chinese pattern: TMS's event pages say "每週四0:00初始化" of every
 * check-in counter, which is not about the symbol quests (M-015).
 */
export const RESET_DAY_WORDS =
  /초기화 요일|요일.{0,20}초기화|初期化.{0,10}曜日|曜日.{0,20}(初期化|リセット)|reset (day|time).{0,40}(weekly|thursday|monday)|(weekly|thursday|monday).{0,60}reset (day|time)/i;
export const CHANGE_WORDS =
  /증가|감소|하향|상향|변경|비용|메소|획득|초기화|増加|減少|変更|費用|コスト|メル|獲得|初期化|增加|減少|减少|調整|调整|變更|变更|費用|费用|楓幣|金币|獲得|获得|降低|提升|重置|increase|decrease|reduc|chang|adjust|cost|meso|reset/i;

export const decode = (html) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|li|div|tr|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

/** The lines of a patch note that mention symbols and a change, trimmed for the report. */
export function symbolLines(html) {
  return decode(html)
    .split(/\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(
      (line) =>
        line.length < 400 &&
        ((SYMBOL_WORDS.test(line) && CHANGE_WORDS.test(line)) || RESET_DAY_WORDS.test(line))
    )
    .filter((line, i, all) => all.indexOf(line) === i)
    .map((line) => (line.length > 160 ? `${line.slice(0, 157)}…` : line));
}

// --- Comparing a source with our numbers ---------------------------------------------------------

/**
 * A per-level cost table against ours: null when they agree, else one line.
 * `theirs[level]` is `{ value, unit }`; a value shown rounded (kiiten's "1.14億")
 * agrees when it is within one unit of the last digit shown.
 */
export function costDifference(name, ours, theirs, source) {
  if (theirs.length !== ours.length) {
    return `${name}: ${source} lists ${theirs.length - 1} level-ups, we have ${ours.length - 1}`;
  }
  const moved = ours.flatMap((cost, level) =>
    level && Math.abs(theirs[level].value - cost) >= theirs[level].unit
      ? [`${level}→${level + 1} ${fmt(theirs[level].value)} (ours ${fmt(cost)})`]
      : []
  );
  if (!moved.length) return null;
  // The totals make the line change when any level changes, not only the first two shown.
  const total = (table) => table.reduce((sum, cost) => sum + (cost.value ?? cost), 0);
  return (
    `${name}: ${moved.length} of ${ours.length - 1} meso costs differ on ${source}, ` +
    `total ${fmt(total(theirs))} (ours ${fmt(total(ours))}): ` +
    `${moved.slice(0, 2).join("; ")}${moved.length > 2 ? "; …" : ""}`
  );
}

/**
 * Differences a person has already read and recorded (GAME §7) are not reported
 * again: only lines that are new, and recorded lines that went away.
 */
export function newDifferences(lines, known = []) {
  return {
    fresh: lines.filter((line) => !known.includes(line)),
    gone: known.filter((line) => !lines.includes(line)),
  };
}

// --- kiiten.com (JMS community data, server-rendered) --------------------------------------------

/** The page as one line of text, tags and scripts removed. */
const pageText = (html) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

/** "97万" → 970,000 exactly; "1.14億" → 114,000,000, shown to 0.01億, so ± 1,000,000. */
export function parseJpAmount(token) {
  const m = token.match(/^([\d,.]+)(億|万)$/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  if (m[2] === "万") return { value: Math.round(n * 1e4), unit: 1e4 };
  return { value: Math.round(n * 1e8), unit: 1e6 };
}

const numbers = (s) => s.trim().split(" ").filter(Boolean);
const toNumber = (t) => Number(t.replace(/,/g, ""));

/**
 * kiiten's /data/symbol/arcane or /authentic page: the daily cap per region (in
 * clear order), the per-level gains (each must be the same at every level), and
 * the per-level cost table. Throws when the page no longer reads as expected.
 */
export function parseKiiten(html, type) {
  const text = pageText(html);
  const maxLevel = type === "arcane" ? 20 : 11;

  const stages = [...text.matchAll(/Stage ([IVX]+) (.+?) Req Lv \d+ 日 配布 (\d+) \/日/g)].map(
    (m) => ({ name: m[2], daily: Number(m[3]) })
  );
  if (stages.length < 6) throw new Error(`${stages.length} regions found, expected at least 6`);

  // "Lv フォース メインステータス ゼノンステータス デーモンアヴェンジャーHP [bonus columns] 1 30 300 117 4,200 …"
  const growth = text.match(
    /Lv フォース メインステータス ゼノンステータス デーモンアヴェンジャーHP (?:追加経験値 メル獲得 ドロップ率 )?(.+?) (?:×6|合算) /
  );
  if (!growth) throw new Error("no per-level stat table");
  const cells = numbers(growth[1]).filter((t) => !t.startsWith("+"));
  if (cells.length !== maxLevel * 5) throw new Error(`stat table has ${cells.length} cells`);
  const rows = Array.from({ length: maxLevel }, (_, i) =>
    cells.slice(i * 5, i * 5 + 5).map(toNumber)
  );
  if (rows.some((row, i) => row[0] !== i + 1)) throw new Error("stat table rows out of order");
  const perLevel = (column) => {
    const steps = new Set(rows.slice(1).map((row, i) => row[column] - rows[i][column]));
    return steps.size === 1 ? [...steps][0] : null;
  };
  const gains = {
    power: perLevel(1),
    mainStat: perLevel(2),
    xenon: perLevel(3),
    demonAvenger: perLevel(4),
  };

  // "必要シンボル数 1 → 2 97万 121万 … 12 2 → 3 …" up to "合計"
  const table = text.match(/必要シンボル数 (1 → 2 .+?) 合計 /);
  if (!table) throw new Error("no cost table");
  const costs = stages.map(() => [{ value: 0, unit: 1 }]);
  for (const row of table[1].matchAll(/(\d+) → \d+ ((?:[\d,.]+(?:億|万) )+)[\d,]+/g)) {
    const level = Number(row[1]);
    const amounts = numbers(row[2]).map(parseJpAmount);
    if (amounts.length !== stages.length || amounts.includes(null)) {
      throw new Error(
        `cost row ${level} has ${amounts.length} columns for ${stages.length} regions`
      );
    }
    amounts.forEach((amount, i) => (costs[i][level] = amount));
  }
  if (costs[0].length !== maxLevel) throw new Error(`cost table has ${costs[0].length - 1} rows`);

  return { stages, gains, costs };
}

// --- BWIKI (CMS community wiki, MediaWiki) -------------------------------------------------------

/** The Chinese region names BWIKI uses in its cost lines, mapped to our symbol ids. */
export const BWIKI_NAMES = {
  消亡旅途: [1],
  啾啾岛: [2],
  拉克兰: [3],
  "阿尔卡那、莫拉斯、埃斯佩拉": [4, 5, 6],
  塞尔提乌: [7],
  亚克斯: [8],
  奥迪乌姆: [9],
  桃源境: [10],
  阿尔特里亚: [11],
  卡西翁: [12],
};

/**
 * One BWIKI symbol page (神秘力量 for arcane, 原初之力 for sacred): the per-level
 * meso cost of each region, from its stated formula ('''a + b × 当前成长等级'''),
 * and the per-level gains its prose states. Commented-out tables are ignored.
 */
export function parseBwiki(wikitext, maxLevel) {
  const live = wikitext.replace(/<!--[\s\S]*?-->/g, "");
  /** @type {Record<number, { formula: string, table: number[] }>} */
  const costs = {};
  for (const m of live.matchAll(
    /\{\{段落\|(.+?)(?:神秘|原初)徽章升级所消耗的金币遵循：+'''(\d+) \+ (\d+) × 当前成长等级'''/g
  )) {
    const ids = BWIKI_NAMES[m[1]];
    if (!ids) continue;
    const [a, b] = [Number(m[2]), Number(m[3])];
    const table = [0, ...Array.from({ length: maxLevel - 1 }, (_, i) => a + b * (i + 1))];
    for (const id of ids) costs[id] = { formula: `${fmt(a)} + ${fmt(b)} × level`, table };
  }
  const gain = (pattern) => {
    const m = live.match(pattern);
    return m ? Number(m[1]) : null;
  };
  return {
    costs,
    gains: {
      power: gain(/而后每一级(?:神秘力量|原初之力)可以提供(\d+)点/),
      mainStat: gain(/===其余职业===\s*\{\{段落\|[^}]*?每次升级给予(\d+)主属性/),
      xenon: gain(/===尖兵===\s*\{\{段落\|[^}]*?每次升级给予(\d+)力量/),
      demonAvenger: gain(/===恶魔复仇者===\s*\{\{段落\|[^}]*?每次升级给予(\d+)HP/),
    },
  };
}
