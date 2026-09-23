// ---------------------------------------------------------------------------
// check-game-data.mjs — warns when the game's symbol data drifts from ours.
//
// The site shipped GMS v.271's doubled acquisition rates two weeks late because
// nothing watched for it (docs/KNOWN_ISSUES.md KI-014). This compares every
// number of ours that patches have changed before (GAME §6 lists them, and what
// is left out on purpose) with the MapleStory Wiki, which mirrors GMS within a
// day of each patch. Every other server is checked against its own sources, with
// its expected numbers taken from its overlay (regions.json over symbols.json,
// as the site builds them): its official patch notes, and the community tables
// that a script can read (kiiten for JMS, BWIKI for CMS).
//
// It reads the network only. Run it with `pnpm check:data` (add `--days=N` to
// widen the patch-note window); the weekly workflow in
// .github/workflows/game-data.yml opens an issue when it exits non-zero, with one
// section per server (a `## GMS` line starts each).
//
// Exit codes: 0 nothing to do · 1 a number disagrees · 2 a source was unreadable
// · 3 only a heads-up: a patch note mentions symbols, or a community table changed.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import {
  SERVERS,
  costDifference,
  dailyCap,
  decode,
  describeExpected,
  expectedFor,
  newDifferences,
  parseBwiki,
  parseKiiten,
  symbolLines,
} from "./game-data.mjs";

const symbols = JSON.parse(readFileSync(new URL("../src/lib/symbols.json", import.meta.url)));
const gameTs = readFileSync(new URL("../src/lib/game.ts", import.meta.url), "utf8");
/** Every server's profile and overrides (src/lib/regions.ts reads the same file). */
const PROFILES = JSON.parse(readFileSync(new URL("../src/lib/regions.json", import.meta.url)));
/** Each server's numbers as the site shows them. */
const EXPECTED = Object.fromEntries(SERVERS.map((r) => [r, expectedFor(r, symbols, PROFILES)]));
const GMS = EXPECTED.gms;

/** Our weekly as the game pays it: per clear × clears (80 × 3 in GMS). */
const WEEKLY = GMS.weekly;
/** The arcane and sacred values of an `{ arcane: N, sacred: M, grand: … }` constant from our source. */
const pair = (source, name) => {
  const m = source.match(new RegExp(`${name}[^=]*= \\{ arcane: ([\\d.]+), sacred: ([\\d.]+)[, ]`));
  return m ? { arcane: Number(m[1]), sacred: Number(m[2]) } : null;
};
/** Our extra-quest multipliers, read from the source so the two cannot drift apart. */
const EXTRA = pair(gameTs, "EXTRA_MULTIPLIER");
const EXTRA_ARCANE = EXTRA?.arcane;
const POWER = Number(gameTs.match(/POWER_PER_LEVEL = (\d+)/)?.[1]);
const MAIN_STAT = pair(gameTs, "MAIN_STAT_PER_LEVEL");
/** Gains per level-up on a server, as the next-level panel shows them. */
const statsFor = (expected) => ({
  Power: { arcane: POWER, sacred: POWER },
  "Main stat": MAIN_STAT,
  "Demon Avenger HP": expected.classGains.demonAvengerHp,
  "Xenon STR, DEX and LUK": expected.classGains.xenonAllStat,
});
const OUR_STATS = statsFor(GMS);

/**
 * The meso formulas (GAME §1). The epsilon keeps floating point from flooring
 * 122.99… (15 × 8.2) to 122; the formula reproduces all 194 costs only with it.
 */
const arcaneCost = (k, level) =>
  Math.round(1e4 * Math.floor((level ** 2 + 11) * (k + 0.1 * level) + 1e-9));
const sacredCost = (k, level) =>
  Math.round(1e5 * Math.floor((9 * level ** 2 + 20 * level) * (k - 0.6 * level) + 1e-9));
/** Each symbol's k, by id (arcane 1–6, sacred 7–12, grand 13–14). A new symbol needs its k here. */
const COST_K = {
  1: 8,
  2: 10,
  3: 12,
  4: 14,
  5: 16,
  6: 18,
  7: 13.2,
  8: 15,
  9: 16.8,
  10: 18.6,
  11: 20.4,
  12: 22.2,
  13: 39.8,
  14: 48.8,
};

/**
 * Symbols the game has and the site does not model yet, each as
 * `{ name, family, daily, costK, maxLevel }`. Their confirmed numbers live here so a
 * change is still caught; move each one into symbols.json when the site adds it, and
 * delete it from this list. Empty since Grand Sacred joined symbols.json (2026-09-23).
 */
const PENDING = [].map((s) => ({
  ...s,
  mesosRequired: [
    0,
    ...Array.from({ length: s.maxLevel - 1 }, (_, i) => sacredCost(s.costK, i + 1)),
  ],
}));

/**
 * Overrides derived from a stated rule rather than copied from a table, checked
 * like the formula above so a typo in regions.json is caught. KMS 1.2.419: every
 * arcane cost is 0.7 × the old one, rounded down to 10,000 (docs/data-check/kms-mesos-arcane.csv).
 */
const RULES = [
  {
    region: "kms",
    type: "arcane",
    what: "0.7 × the GMS cost, rounded down to 10,000",
    cost: (gms) => Math.floor((gms * 7) / 100000) * 10000,
  },
];

/**
 * What the community tables showed where they differ from our numbers, as last
 * read and recorded (GAME §7, 2026-09-23). Only a line that is new, or one of
 * these that goes away, is reported: both sources are low trust, and a weekly
 * issue about the same old differences would hide a real change. After reading
 * a new difference, record it in GAME §5 or §7 and copy the line here.
 */
const KNOWN_DIFFERENCES = {
  // The cost lines are kiiten's own errors: JMS's official ver4.17 notice (2023-09-20) lists
  // the same costs as ours cell for cell (GAME §7, 2026-09-23). The class-gain lines stay a
  // real open difference (JMS gains are inferred from GMS; Brian kept the inference).
  jms: [
    "Vanishing Journey: 8 of 19 meso costs differ on kiiten, total 249,700,000 (ours 252,470,000): 12→13 14,230,000 (ours 14,260,000); 13→14 16,670,000 (ours 16,740,000); …",
    "Chu Chu Island: 8 of 19 meso costs differ on kiiten, total 301,300,000 (ours 306,050,000): 12→13 17,310,000 (ours 17,360,000); 13→14 20,190,000 (ours 20,340,000); …",
    "Lachelein: 8 of 19 meso costs differ on kiiten, total 352,900,000 (ours 359,630,000): 12→13 20,390,000 (ours 20,460,000); 13→14 23,710,000 (ours 23,940,000); …",
    "Arcana: 8 of 19 meso costs differ on kiiten, total 404,500,000 (ours 413,210,000): 12→13 23,470,000 (ours 23,560,000); 13→14 27,230,000 (ours 27,540,000); …",
    "Morass: 8 of 19 meso costs differ on kiiten, total 456,100,000 (ours 466,790,000): 12→13 26,550,000 (ours 26,660,000); 13→14 30,750,000 (ours 31,140,000); …",
    "Esfera: 8 of 19 meso costs differ on kiiten, total 507,700,000 (ours 520,370,000): 12→13 29,630,000 (ours 29,760,000); 13→14 34,270,000 (ours 34,740,000); …",
    "Xenon STR, DEX and LUK per arcane level is 39 on kiiten, 48 in ours",
    "Demon Avenger HP per arcane level is 1,400 on kiiten, 2,100 in ours",
    "Arcus: 1 of 10 meso costs differ on kiiten, total 4,551,700,000 (ours 4,751,600,000): 5→6 190,000,000 (ours 390,000,000)",
    "Xenon STR, DEX and LUK per sacred level is 78 on kiiten, 96 in ours",
    "Demon Avenger HP per sacred level is 3,500 on kiiten, 4,200 in ours",
  ],
  cms: [
    "BWIKI 神秘力量 last edited 2024-06-28",
    "Vanishing Journey: 19 of 19 meso costs differ on BWIKI (3,110,000 + 3,960,000 × level), total 811,490,000 (ours 252,470,000): 1→2 7,070,000 (ours 970,000); 2→3 11,030,000 (ours 1,230,000); …",
    "Chu Chu Island: 19 of 19 meso costs differ on BWIKI (6,220,000 + 4,620,000 × level), total 995,980,000 (ours 306,050,000): 1→2 10,840,000 (ours 1,210,000); 2→3 15,460,000 (ours 1,530,000); …",
    "Lachelein: 19 of 19 meso costs differ on BWIKI (9,330,000 + 5,280,000 × level), total 1,180,470,000 (ours 359,630,000): 1→2 14,610,000 (ours 1,450,000); 2→3 19,890,000 (ours 1,830,000); …",
    "Arcana: 19 of 19 meso costs differ on BWIKI (11,196,000 + 5,940,000 × level), total 1,341,324,000 (ours 413,210,000): 1→2 17,136,000 (ours 1,690,000); 2→3 23,076,000 (ours 2,130,000); …",
    "Morass: 19 of 19 meso costs differ on BWIKI (11,196,000 + 5,940,000 × level), total 1,341,324,000 (ours 466,790,000): 1→2 17,136,000 (ours 1,930,000); 2→3 23,076,000 (ours 2,430,000); …",
    "Esfera: 19 of 19 meso costs differ on BWIKI (11,196,000 + 5,940,000 × level), total 1,341,324,000 (ours 520,370,000): 1→2 17,136,000 (ours 2,170,000); 2→3 23,076,000 (ours 2,730,000); …",
    "BWIKI 原初之力 last edited 2024-04-03",
    "Cernium: 10 of 10 meso costs differ on BWIKI (96,900,000 + 88,500,000 × level), total 5,836,500,000 (ours 3,930,100,000): 1→2 185,400,000 (ours 36,500,000); 2→3 273,900,000 (ours 91,200,000); …",
    "Arcus: 10 of 10 meso costs differ on BWIKI (106,600,000 + 97,300,000 × level), total 6,417,500,000 (ours 4,751,600,000): 1→2 203,900,000 (ours 41,700,000); 2→3 301,200,000 (ours 104,800,000); …",
    "Odium: 10 of 10 meso costs differ on BWIKI (117,400,000 + 107,100,000 × level), total 7,064,500,000 (ours 5,573,300,000): 1→2 224,500,000 (ours 46,900,000); 2→3 331,600,000 (ours 118,500,000); …",
    "Shangri-La: no cost formula on BWIKI 原初之力",
    "Arteria: no cost formula on BWIKI 原初之力",
    "Carcion: no cost formula on BWIKI 原初之力",
  ],
};

const FAMILY = { arcane: "Arcane Symbol", sacred: "Sacred Symbol", grand: "Grand Sacred Symbol" };
const FAMILIES = ["Arcane Symbol", "Sacred Symbol", "Grand Sacred Symbol"];

/**
 * Where every reading comes from. Two independent sources for GMS: the wiki holds
 * the current numbers, Nexon's own patch notes say when GMS changed them. Change a
 * source here and in GAME §6 together.
 */
const SOURCES = {
  wiki: "https://maplestorywiki.net/api.php", // MediaWiki API; mirrors GMS within about a day
  gmsNews: "https://g.nexonstatic.com/maplestory/cms/v1/news", // the JSON behind nexon.com/maplestory/news
  kms: "https://maplestory.nexon.com/news/update",
  jms: "https://maplestory.nexon.co.jp/notice/_noticelist/?id=update&p=1&search=",
  kiiten: "https://kiiten.com/data/symbol", // JMS community tables, server-rendered: /arcane, /authentic
  msea: "https://www.maplesea.com/updates/",
  tms: "https://maplestory.beanfun.com", // bulletins through the page's own POST handlers
  cmsNews: "https://mxd.web.sdo.com/web7/Handler", // the JSON behind mxd.web.sdo.com's news list
  bwiki: "https://wiki.biligame.com/maplestory/api.php", // CMS community wiki, MediaWiki API
};

/**
 * What a script cannot read, listed in every report so the issue says what still
 * needs a person (REGIONS §0: unreadable sources are reported, not skipped).
 */
const MANUAL = [
  "KMS: Nexon's Open API notices need a key (a repository secret), so they are not read.",
  "JMS: kiiten rounds Sacred costs to 0.01億; costs within that rounding count as matching.",
  "TMS: no machine-readable cost or rate table; the bulletins are the only source read.",
  "CMS: the version pages on mxdact.web.sdo.com are images; only the text notices are read.",
  "CMS: BWIKI states the dailies and weeklies in prose, which is not parsed; its pages are watched for edits instead.",
  "All servers except GMS: no source states the weekly reset day or the extra quest in a form a script can read.",
];

const WIKI = SOURCES.wiki;
const DAYS_ARG = Number(process.argv.find((a) => a.startsWith("--days="))?.slice(7));
const DAYS = DAYS_ARG > 0 ? DAYS_ARG : 8;
const SINCE = Date.now() - DAYS * 24 * 60 * 60 * 1000;
const AGENT = { "user-agent": "Mozilla/5.0 (maple-symbols data check)" };
const TIMEOUT_MS = 30_000;

/** fetch with our user agent and a timeout; a non-2xx status throws. */
async function get(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: { ...AGENT, ...init.headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

// GMS keeps its own lists (the report's GMS section and the cross-check read them).
const problems = [];
const gmsNotes = [];
const unreadable = [];

/** Every other server's findings, one section each in the report. */
const regional = Object.fromEntries(
  SERVERS.filter((r) => r !== "gms").map((r) => [
    r,
    { problems: [], differences: [], gone: [], notes: [], unreadable: [] },
  ])
);

async function wikitext(page) {
  const url = `${WIKI}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json`;
  const body = await (await get(url)).json();
  const text = body?.parse?.wikitext?.["*"];
  if (!text) throw new Error(body?.error?.info ?? "no wikitext in response");
  return text;
}

/**
 * Acquisition lines read like:
 *   (Rewards Arcane Symbol: Lachelein Coupon x 40 per day)
 *   (Rewards ... Coupon x 20 per day; increased to 40 upon completing [[...]])
 *   (Rewards ... Coupon x 80 per clear, up to 3 clears per week)
 */
function acquisition(text) {
  const daily = text.match(/x\s*(\d+)\s*per day(?:;\s*increased to\s*(\d+))?/i);
  const weekly = text.match(/x\s*(\d+)\s*per clear(?:,\s*up to\s*(\d+)\s*clears? per week)?/i);
  return {
    daily: daily ? Number(daily[1]) : null,
    dailyWithExtra: daily?.[2] ? Number(daily[2]) : null,
    perClear: weekly ? Number(weekly[1]) : null,
    clears: weekly?.[2] ? Number(weekly[2]) : null,
  };
}

/** The "Cost Table" rows: `|Level 3→4` then `|141 Symbols<br />186,100,000 [[Meso]]s`. */
function mesoCosts(text) {
  const costs = [0];
  for (const row of text.matchAll(
    /\|Level (\d+)→\d+\s*\n\|[\d,]+ Symbols<br \/>([\d,]+) \[\[Meso\]\]s?/g
  )) {
    costs[Number(row[1])] = Number(row[2].replace(/,/g, ""));
  }
  return costs.length > 1 ? costs : null;
}

function compareCosts(name, page, ours, text) {
  const theirs = mesoCosts(text);
  if (!theirs) return unreadable.push(`${name}: no cost table on ${page}`);
  if (theirs.length !== ours.length) {
    return problems.push(
      `${name}: the wiki lists ${theirs.length - 1} level-ups, we have ${ours.length - 1} (max level changed?)`
    );
  }
  const moved = ours.flatMap((cost, level) =>
    level && theirs[level] !== cost
      ? [`${level}→${level + 1}: ${theirs[level]} (ours ${cost})`]
      : []
  );
  if (moved.length) {
    const ratio =
      theirs.slice(1).reduce((a, b) => a + b, 0) / ours.slice(1).reduce((a, b) => a + b, 0);
    problems.push(
      `${name}: ${moved.length} meso costs differ, total now ${Math.round(ratio * 100)} % of ours (${moved.slice(0, 3).join("; ")}${moved.length > 3 ? "; …" : ""})`
    );
  }
}

async function checkSymbols() {
  for (const symbol of GMS.symbols) {
    const page = `${FAMILY[symbol.type]}: ${symbol.name}`;
    let text;
    try {
      text = await wikitext(page);
    } catch (error) {
      unreadable.push(`${symbol.name}: ${page} (${error.message})`);
      continue;
    }
    const found = acquisition(text);

    if (found.daily === null) {
      unreadable.push(`${symbol.name}: no "per day" line on ${page}`);
    } else if (found.daily !== symbol.dailySymbols) {
      problems.push(
        `${symbol.name}: daily is ${found.daily} on the wiki, ${symbol.dailySymbols} in symbols.json`
      );
    }

    // The extra quest multiplies the daily by our arcane multiplier, and only where we say it exists.
    if (symbol.extraName) {
      const ours = symbol.dailySymbols * EXTRA_ARCANE;
      if (found.dailyWithExtra === null) {
        problems.push(
          `${symbol.name}: the wiki no longer mentions ${symbol.extraName} raising the daily`
        );
      } else if (found.dailyWithExtra !== ours) {
        problems.push(
          `${symbol.name}: with ${symbol.extraName} the wiki says ${found.dailyWithExtra}, we compute ${ours}`
        );
      }
    } else if (found.dailyWithExtra !== null) {
      problems.push(
        `${symbol.name}: the wiki shows a quest raising the daily to ${found.dailyWithExtra}; we have none`
      );
    }

    if (symbol.weeklyName) {
      if (found.perClear === null) {
        unreadable.push(`${symbol.name}: no "per clear" line on ${page}`);
      } else {
        // Compared as the game pays it: a move to KMS's one clear of 240 keeps the total but
        // changes the copy, so it counts as a change too.
        const clears = found.clears ?? 1;
        if (found.perClear !== WEEKLY.perClear || clears !== WEEKLY.clears) {
          problems.push(
            `${symbol.name}: weekly is ${found.perClear} × ${clears} on the wiki, ${WEEKLY.perClear} × ${WEEKLY.clears} in regions.json (gms)`
          );
        }
      }
    } else if (found.perClear !== null) {
      problems.push(
        `${symbol.name}: the wiki shows a weekly (${found.perClear} per clear); we have none`
      );
    }

    // Quest names: a renamed or replaced quest usually means its reward changed too.
    for (const [label, name] of [
      ["daily", symbol.dailyName],
      ["weekly", symbol.weeklyName],
      ["extra", symbol.extraName],
    ]) {
      if (name && !text.includes(name)) {
        problems.push(`${symbol.name}: the ${label} quest "${name}" is not on ${page} (renamed?)`);
      }
    }

    compareCosts(symbol.name, page, symbol.mesosRequired, text);
  }
}

/** Our own tables against the formula: catches a typo the wiki cannot (it may agree with us). */
function checkFormula() {
  for (const symbol of symbols.symbols) {
    const k = COST_K[symbol.id];
    if (k === undefined) {
      problems.push(`${symbol.name}: no cost coefficient in COST_K (a new symbol?)`);
      continue;
    }
    const cost = symbol.type === "arcane" ? arcaneCost : sacredCost;
    const off = symbol.mesosRequired.flatMap((ours, level) =>
      level && ours !== cost(k, level)
        ? [`${level}→${level + 1}: ${ours} (formula ${cost(k, level)})`]
        : []
    );
    if (off.length)
      problems.push(
        `${symbol.name}: symbols.json differs from the cost formula at ${off.join("; ")}`
      );
  }
}

/** Each derived override in regions.json against the rule it came from (RULES). */
function checkRules() {
  for (const rule of RULES) {
    const base = new Map(symbols.symbols.map((s) => [s.id, s]));
    for (const symbol of EXPECTED[rule.region].symbols.filter((s) => s.type === rule.type)) {
      const gms = base.get(symbol.id).mesosRequired;
      const off = symbol.mesosRequired.flatMap((ours, level) =>
        level && ours !== rule.cost(gms[level])
          ? [`${level}→${level + 1}: ${ours} (rule ${rule.cost(gms[level])})`]
          : []
      );
      if (symbol.mesosRequired.length !== gms.length) {
        off.unshift(`${symbol.mesosRequired.length - 1} level-ups, GMS has ${gms.length - 1}`);
      }
      if (off.length) {
        regional[rule.region].problems.push(
          `${symbol.name}: regions.json (${rule.region}) differs from its rule (${rule.what}) at ${off.slice(0, 3).join("; ")}${off.length > 3 ? "; …" : ""}`
        );
      }
    }
  }
}

async function checkPending() {
  for (const symbol of PENDING) {
    const page = `${symbol.family}: ${symbol.name}`;
    let text;
    try {
      text = await wikitext(page);
    } catch (error) {
      unreadable.push(`${symbol.name} (not in symbols.json yet): ${page} (${error.message})`);
      continue;
    }
    const found = acquisition(text);
    if (found.daily === null) {
      unreadable.push(`${symbol.name} (2.0): no "per day" line on ${page}`);
    } else if (found.daily !== symbol.daily) {
      problems.push(
        `${symbol.name} (2.0): daily is ${found.daily} on the wiki, ${symbol.daily} recorded`
      );
    }
    compareCosts(`${symbol.name} (2.0)`, page, symbol.mesosRequired, text);
  }
}

/**
 * Per-level stat gains come from one wiki template, the "Every additional level
 * adds" block of ArcaneSymbolStats and AuthenticSymbolStats. KMS changed the
 * Xenon amounts in 1.2.419 (2026-09-17), so these can move too.
 */
async function checkStats() {
  let text;
  try {
    text = await wikitext("Template:Equipment Properties");
  } catch (error) {
    return unreadable.push(`Stat template: ${error.message}`);
  }
  const labels = {
    Power: /(?:Arcane Power|Sacred Power \/ Authentic Force): \+([\d,]+)/,
    "Main stat": /Main Stat: \+([\d,]+)/,
    "Demon Avenger HP": /HP \(Demon Avenger only\): \+([\d,]+)/,
    "Xenon STR, DEX and LUK": /STR, DEX, and LUK \(Xenon only\): \+([\d,]+)/,
  };
  for (const [type, key] of [
    ["arcane", "ArcaneSymbolStats"],
    ["sacred", "AuthenticSymbolStats"],
  ]) {
    const block = text
      .match(new RegExp(`\\|${key}=([^\\n]*)`))?.[1]
      ?.split("Every additional level adds")[1]
      ?.split(/'''(?:Cumulative|Max Level)/)[0];
    if (!block) {
      unreadable.push(`Stat template: no per-level block for ${type}`);
      continue;
    }
    for (const [label, pattern] of Object.entries(labels)) {
      const theirs = Number(block.match(pattern)?.[1]?.replace(/,/g, ""));
      const ours = OUR_STATS[label]?.[type];
      if (!theirs || !ours) unreadable.push(`Stat template: ${label} (${type}) not readable`);
      else if (theirs !== ours) {
        problems.push(`${label} per ${type} level is ${theirs} on the wiki, ${ours} in our code`);
      }
    }
  }
}

/** A new region's symbol shows up on its family page before anywhere else. */
async function checkRoster() {
  const ours = new Set([
    ...symbols.symbols.map((s) => `${FAMILY[s.type]}: ${s.name}`),
    ...PENDING.map((s) => `${s.family}: ${s.name}`),
  ]);
  const listed = new Set();
  for (const family of FAMILIES) {
    let text;
    try {
      text = await wikitext(family);
    } catch (error) {
      unreadable.push(`${family} list: ${error.message}`);
      continue;
    }
    for (const m of text.matchAll(new RegExp(`'''\\[\\[(${family}: [^\\]|]+)\\]\\]'''`, "g"))) {
      listed.add(m[1]);
    }
  }
  if (!listed.size) {
    return unreadable.push(
      "Symbol lists: no entries matched on the family pages (layout changed?)"
    );
  }
  for (const name of listed) if (!ours.has(name)) problems.push(`New symbol on the wiki: ${name}`);
  for (const name of ours)
    if (!listed.has(name)) problems.push(`${name} is no longer listed on the wiki`);
}

// --- Patch notes, every server -----------------------------------------------------------------

/**
 * Reads each notice from the window and keeps the ones whose lines mention symbols
 * and a change. An entry carries its `html`, a `load()` that returns it, or a `url`
 * to fetch.
 */
async function scanNotices(label, entries, into, failures) {
  const day = (t) => new Date(t).toISOString().slice(0, 10);
  for (const { title, url, date, posted, html, load } of entries) {
    if (!(date > SINCE)) continue;
    try {
      const page = html ?? (load ? await load() : await (await get(url)).text());
      if (!page) throw new Error("empty page");
      const lines = symbolLines(page);
      if (lines.length) {
        const when =
          posted && day(posted) !== day(date)
            ? `${day(date)} (edited; first posted ${day(posted)})`
            : day(date);
        into.push(
          `${label} ${when} "${title}" ${url}\n` +
            lines
              .slice(0, 4)
              .map((l) => `        ${l}`)
              .join("\n")
        );
      }
    } catch (error) {
      failures.push(`${label} notice ${url}: ${error.message}`);
    }
  }
}

/**
 * GMS's own patch notes: the second, official source. A notice counts from its
 * first posting or from its latest "[Updated M/D]" edit, whichever is newer.
 */
async function checkGmsNotes() {
  try {
    const list = await (await get(SOURCES.gmsNews)).json();
    if (!Array.isArray(list) || !list.length || !list.every((n) => Date.parse(n.liveDate))) {
      throw new Error("no news entries, or entries without a liveDate (API changed?)");
    }
    const entries = list
      .filter((n) => ["update", "maintenance", "general"].includes(n.category))
      .map((n) => {
        // "[Updated M/D]" has no year: it is the first such date on or after the posting.
        const posted = Date.parse(n.liveDate);
        const edited = n.name.match(/\[Updated (\d{1,2})\/(\d{1,2})\]/);
        let edit = 0;
        if (edited) {
          const year = new Date(posted).getUTCFullYear();
          edit = Date.UTC(year, +edited[1] - 1, +edited[2]);
          if (edit < posted - 86400000) edit = Date.UTC(year + 1, +edited[1] - 1, +edited[2]);
        }
        const date = Math.max(posted, edit);
        return {
          id: n.id,
          title: n.name,
          date,
          posted,
          url: `https://www.nexon.com/maplestory/news/${n.category}/${n.id}`,
        };
      })
      .filter((n) => n.date > SINCE);
    for (const entry of entries) {
      const detail = await (await get(`${SOURCES.gmsNews}/${entry.id}`)).json();
      if (typeof detail.body !== "string")
        throw new Error(`news ${entry.id} has no body (API changed?)`);
      await scanNotices("GMS", [{ ...entry, html: detail.body }], gmsNotes, unreadable);
    }
  } catch (error) {
    unreadable.push(`GMS patch notes (${SOURCES.gmsNews}): ${error.message}`);
  }
}

/** One server's notice list: `list()` returns the entries, whose lines are then scanned. */
async function checkNotices(region, name, list) {
  const into = regional[region];
  try {
    const entries = await list();
    if (!entries.length) throw new Error("no entries found (page layout changed?)");
    await scanNotices(region.toUpperCase(), entries, into.notes, into.unreadable);
  } catch (error) {
    into.unreadable.push(`${name}: ${error.message}`);
  }
}

/** KMS gets every change first, usually months ahead of GMS. */
const kmsNotices = async () => {
  const html = await (await get(SOURCES.kms)).text();
  return [
    ...html.matchAll(
      /href="\/news\/update\/(\d+)">\s*<span>([\s\S]*?)<\/span>[\s\S]*?<dd>(\d{4})\.(\d{2})\.(\d{2})<\/dd>/g
    ),
  ].map((m) => ({
    title: decode(m[2])
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^수정 /, ""),
    url: `https://maplestory.nexon.com/news/update/${m[1]}`,
    date: Date.UTC(+m[3], +m[4] - 1, +m[5]),
  }));
};

/** JMS: the list is loaded by script from this partial. */
const jmsNotices = async () => {
  const html = await (await get(SOURCES.jms)).text();
  return [
    ...html.matchAll(
      /alias=([a-z0-9]{32})&amp;id=update">([^<]*)<\/a>[\s\S]*?class="date">(\d{4})\.(\d{2})\.(\d{2})</g
    ),
  ].map((m) => ({
    title: decode(m[2]).trim(),
    url: `https://maplestory.nexon.co.jp/notice/view/?alias=${m[1]}&id=update`,
    date: Date.UTC(+m[3], +m[4] - 1, +m[5]),
  }));
};

/** MSEA: dates are "[dd.mm]"; shop and gachapon notices are skipped. */
const mseaNotices = async () => {
  const html = await (await get(SOURCES.msea)).text();
  const now = new Date();
  return [
    ...html.matchAll(
      /\[(\d{2})\.(\d{2})\] : <a href="(https:\/\/www\.maplesea\.com\/updates\/view\/([^"]+))">\s*([^<]*)/g
    ),
  ]
    .filter((m) => !/^(CSU|GCP|SLC)_/.test(m[4]))
    .map((m) => {
      let date = Date.UTC(now.getUTCFullYear(), +m[2] - 1, +m[1]);
      if (date > now.getTime() + 86400000)
        date = Date.UTC(now.getUTCFullYear() - 1, +m[2] - 1, +m[1]);
      return { title: m[5].trim(), url: m[3], date };
    });
};

/**
 * TMS: beanfun renders its bulletins by script from two POST handlers that want the
 * page's anti-forgery cookie and token. A bulletin either holds its text or links
 * to an event page on beanfun (the patch notes are those), which is plain HTML.
 */
const tmsNotices = async () => {
  const home = await get(`${SOURCES.tms}/main`);
  const token = (await home.text()).match(
    /name="__RequestVerificationToken" type="hidden" value="([^"]+)"/
  )?.[1];
  if (!token) throw new Error("no anti-forgery token on the page (layout changed?)");
  const cookie = home.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  const post = async (path, data) => {
    const body = await (
      await get(`${SOURCES.tms}/${path}`, {
        method: "POST",
        headers: {
          cookie,
          "x-csrf-token": token,
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: new URLSearchParams(data),
      })
    ).json();
    const table = body?.data?.myDataSet?.table;
    if (!table) throw new Error(`${path}: no data in the response (API changed?)`);
    return table;
  };
  const entries = [];
  for (let page = 1; page <= 5; page++) {
    const rows = await post("main?handler=BulletinProxy", {
      Kind: "0",
      Page: String(page),
      method: "0",
      PageSize: "30",
    });
    for (const row of rows) {
      const [y, m, d] = String(row.startDate).split("/").map(Number);
      const link = row.urlLink && /^https:\/\/[a-z0-9.-]+\.beanfun\.com\//i.test(row.urlLink);
      entries.push({
        title: row.title,
        date: Date.UTC(y, m - 1, d),
        url: row.urlLink || `${SOURCES.tms}/bulletin?bid=${row.bullentinId}`,
        load: row.urlLink
          ? link
            ? async () => (await get(row.urlLink)).text()
            : async () => " " // a link off beanfun (a partner page): nothing to read
          : async () =>
              // An image-only bulletin has no text.
              (await post("bulletin?handler=BulletinDetail", { Bid: String(row.bullentinId) }))
                .content || " ",
      });
    }
    if (!rows.length || entries.at(-1).date <= SINCE) break;
  }
  return entries;
};

/**
 * CMS: the news list and each notice's text come as JSON. The version pages it links
 * (mxdact.web.sdo.com) are images, so only notices with text are read (MANUAL).
 */
const cmsNotices = async () => {
  const list = await (
    await get(
      `${SOURCES.cmsNews}/NewsList.ashx?${new URLSearchParams({ CategoryCode: "273,274,275", pageSize: "44", pageIndex: "0", KeyWord: "" })}`
    )
  ).json();
  const rows = list?.data?.dataList;
  if (!Array.isArray(rows) || rows[0]?.[0] !== "ID") throw new Error("no news list (API changed?)");
  const at = (name) => rows[0].indexOf(name);
  return rows
    .slice(1)
    .filter((row) => !row[at("OutLink")])
    .map((row) => ({
      title: row[at("Title")],
      date: Date.parse(`${row[at("PublishDate")].replace(" ", "T")}+08:00`),
      url: `https://mxd.web.sdo.com/web7/news/newsContent.html?id=${row[at("ID")]}`,
      load: async () => {
        const url = `${SOURCES.cmsNews}/NewsContent.ashx?id=${row[at("ID")]}`;
        const data = (await (await get(url)).json())?.data;
        if (!data) throw new Error("no data in the response (API changed?)");
        return data.Content || " "; // an image-only notice has no text
      },
    }));
};

// --- Community tables: JMS (kiiten) and CMS (BWIKI) ----------------------------------------------

/**
 * A community table against a server's numbers. Every difference is information,
 * never a failure (exit 3, not 1): these sources are low trust, and a server's
 * status in regions.json says how far our own number goes. Lines already read and
 * recorded in KNOWN_DIFFERENCES stay quiet.
 */
function reportDifferences(region, lines, complete) {
  const { fresh, gone } = newDifferences(lines, KNOWN_DIFFERENCES[region]);
  regional[region].differences.push(...fresh);
  // After a partial read, a recorded line may be missing only because its page was not read.
  if (complete) regional[region].gone.push(...gone);
}

const num = (n) => n.toLocaleString("en-US");

/** Per-level gains from a source, against a server's numbers ("per arcane level"). */
function gainDifferences(source, expected, type, gains) {
  const ours = statsFor(expected);
  const labels = {
    power: "Power",
    mainStat: "Main stat",
    xenon: "Xenon STR, DEX and LUK",
    demonAvenger: "Demon Avenger HP",
  };
  return Object.entries(labels).flatMap(([key, label]) =>
    gains[key] === null
      ? [`${label} per ${type} level: not readable on ${source}`]
      : gains[key] !== ours[label][type]
        ? [
            `${label} per ${type} level is ${num(gains[key])} on ${source}, ${num(ours[label][type])} in ours`,
          ]
        : []
  );
}

async function checkKiiten() {
  const expected = EXPECTED.jms;
  const lines = [];
  let complete = true;
  for (const [type, page] of [
    ["arcane", "arcane"],
    ["sacred", "authentic"],
  ]) {
    const url = `${SOURCES.kiiten}/${page}`;
    let parsed;
    try {
      parsed = parseKiiten(await (await get(url)).text(), type);
    } catch (error) {
      regional.jms.unreadable.push(`kiiten ${url}: ${error.message}`);
      complete = false;
      continue;
    }
    // Its regions are in clear order, which is our id order; Grand Sacred columns come last.
    const ours = expected.symbols.filter((s) => s.type === type).sort((a, b) => a.id - b.id);
    ours.forEach((symbol, i) => {
      const stage = parsed.stages[i];
      const cap = dailyCap(symbol, EXTRA);
      if (stage.daily !== cap) {
        lines.push(
          `${symbol.name} (${stage.name}): ${stage.daily} a day on kiiten, ${cap} in ours`
        );
      }
      const cost = costDifference(symbol.name, symbol.mesosRequired, parsed.costs[i], "kiiten");
      if (cost) lines.push(cost);
    });
    lines.push(...gainDifferences("kiiten", expected, type, parsed.gains));
  }
  reportDifferences("jms", lines, complete);
}

/**
 * BWIKI's two symbol pages, in one request: the wiki's firewall answers 567 after
 * a few requests in a row, so the script asks once. Their revision dates are
 * reported when they move (an edit is the only sign the prose dailies changed).
 */
const BWIKI_PAGES = {
  神秘力量: { type: "arcane", maxLevel: 20 },
  原初之力: { type: "sacred", maxLevel: 11 },
};

async function checkBwiki() {
  const expected = EXPECTED.cms;
  const url = `${SOURCES.bwiki}?${new URLSearchParams({
    action: "query",
    prop: "revisions",
    rvprop: "content|timestamp",
    rvslots: "main",
    titles: Object.keys(BWIKI_PAGES).join("|"),
    format: "json",
    formatversion: "2",
  })}`;
  let pages;
  try {
    let response;
    try {
      response = await get(url);
    } catch (error) {
      // 567 is the firewall's "too many requests"; one retry after a pause, then give up.
      if (error.message !== "HTTP 567") throw error;
      await new Promise((resolve) => setTimeout(resolve, 60_000));
      response = await get(url);
    }
    pages = (await response.json())?.query?.pages;
    if (!Array.isArray(pages)) throw new Error("no pages in the response");
  } catch (error) {
    const blocked =
      error.message === "HTTP 567" ? " (the wiki's firewall refused the request)" : "";
    return regional.cms.unreadable.push(`BWIKI ${SOURCES.bwiki}: ${error.message}${blocked}`);
  }
  const lines = [];
  let complete = true;
  for (const [title, { type, maxLevel }] of Object.entries(BWIKI_PAGES)) {
    const revision = pages.find((p) => p.title === title)?.revisions?.[0];
    const text = revision?.slots?.main?.content;
    if (!text) {
      regional.cms.unreadable.push(`BWIKI page ${title}: missing`);
      complete = false;
      continue;
    }
    lines.push(`BWIKI ${title} last edited ${revision.timestamp.slice(0, 10)}`);
    const parsed = parseBwiki(text, maxLevel);
    for (const symbol of expected.symbols.filter((s) => s.type === type)) {
      const theirs = parsed.costs[symbol.id];
      if (!theirs) {
        lines.push(`${symbol.name}: no cost formula on BWIKI ${title}`);
        continue;
      }
      const table = theirs.table.map((value) => ({ value, unit: 1 }));
      const cost = costDifference(
        symbol.name,
        symbol.mesosRequired,
        table,
        `BWIKI (${theirs.formula})`
      );
      if (cost) lines.push(cost);
    }
    lines.push(...gainDifferences(`BWIKI ${title}`, expected, type, parsed.gains));
  }
  reportDifferences("cms", lines, complete);
}

async function checkRegions() {
  checkRules();
  await checkNotices("msea", `MapleSEA update list ${SOURCES.msea}`, mseaNotices);
  await checkNotices("kms", `KMS update list ${SOURCES.kms}`, kmsNotices);
  await checkNotices("jms", `JMS update list ${SOURCES.jms}`, jmsNotices);
  await checkKiiten();
  await checkNotices("tms", `TMS bulletins ${SOURCES.tms}`, tmsNotices);
  await checkNotices("cms", `CMS news ${SOURCES.cmsNews}`, cmsNotices);
  await checkBwiki();
}

try {
  await checkSymbols();
  checkFormula();
  await checkPending();
  await checkRoster();
  await checkStats();
  await checkGmsNotes();
  await checkRegions();
} catch (error) {
  // A bug or a surprise in a source must not read as "our numbers moved" (exit 1).
  unreadable.push(`The check itself failed: ${error.stack ?? error.message}`);
}

// --- The report ----------------------------------------------------------------------------------

const line = (prefix, items) => items.forEach((item) => console.log(`${prefix} ${item}`));

console.log(
  `Checked ${symbols.symbols.length} symbols and ${PENDING.length} not yet modelled against maplestorywiki.net: ` +
    "daily, extra and weekly amounts, quest names, meso costs (also against the cost formula), " +
    "per-level stat gains, " +
    "and the symbol lists.\n" +
    `Read the patch notes of all six servers from the last ${DAYS} day${DAYS === 1 ? "" : "s"}, ` +
    "and compared each server's sources with its own numbers (symbols.json with its overlay in regions.json):\n" +
    "  MSEA  maplesea.com updates\n" +
    "  KMS   maplestory.nexon.com updates; its arcane costs against the 1.2.419 rule\n" +
    "  JMS   maplestory.nexon.co.jp updates; kiiten.com daily caps, meso costs and per-level gains\n" +
    "  TMS   maplestory.beanfun.com bulletins and the event pages they link\n" +
    "  CMS   mxd.web.sdo.com text notices; BWIKI meso cost formulas and per-level gains\n" +
    "Not read by the script:"
);
line("  -", MANUAL);
console.log("");

const gmsFound = problems.length || gmsNotes.length || unreadable.length;
if (gmsFound) console.log("## GMS\n");

// The cross-check: the wiki and Nexon's GMS notes are independent, so say which one is ahead.
if (problems.length && !gmsNotes.length) {
  console.log("Cross-check: the wiki disagrees with us, but no GMS patch note in the last");
  console.log(
    `${DAYS} day${DAYS === 1 ? "" : "s"} mentions symbols. Look for an older patch, another region, or a wiki edit error.\n`
  );
} else if (!problems.length && gmsNotes.length) {
  console.log("Cross-check: a GMS patch note mentions symbols, and the wiki still matches us.");
  console.log(
    "Either we already applied it, or the wiki has not caught up; read the note to tell which.\n"
  );
} else if (problems.length && gmsNotes.length) {
  console.log("Cross-check: the wiki disagrees with us and a GMS patch note mentions symbols;");
  console.log("the two sources agree that something changed.\n");
}
if (problems.length) {
  console.log("Numbers that disagree with our data:");
  line("  ✗", problems);
  console.log("\nCheck the patch notes before changing anything: the wiki may be describing");
  console.log("another region, an event bonus, or a change GMS has not received yet.");
  console.log("Then follow docs/GAME.md §6 and record the check in §7.\n");
}
if (gmsNotes.length) {
  console.log("GMS patch notes that mention symbols:");
  line("  •", gmsNotes);
  console.log("");
}
if (unreadable.length) {
  console.log("Could not read:");
  line("  ?", unreadable);
  console.log("");
}

for (const [region, found] of Object.entries(regional)) {
  const name = region.toUpperCase();
  if (!Object.values(found).some((list) => list.length)) continue;
  console.log(`## ${name}\n`);
  if (found.problems.length) {
    console.log(`Our ${name} numbers disagree with themselves:`);
    line("  ✗", found.problems);
    console.log(`\nFix regions.json (${region}), then record it in GAME §7.\n`);
  }
  if (found.notes.length) {
    console.log(`${name} patch notes that mention symbols:`);
    line("  •", found.notes);
    console.log(
      region === "kms"
        ? "\nKMS gets changes first: note them in GAME §5 too, and expect them in GMS in a later patch.\n"
        : `\nUpdate regions.json (${region}) if a number changed, and record it in GAME §5 and §7.\n`
    );
  }
  if (found.differences.length) {
    console.log(
      `A community table changed since it was last read and recorded (information, not a ` +
        `failure), compared with our ${name} numbers:`
    );
    line("  ≠", found.differences);
    console.log(
      "\nRead the source, record what it means in GAME §5 and §7, then copy the lines into " +
        `KNOWN_DIFFERENCES.${region} in the script.\n`
    );
  }
  if (found.notes.length || found.differences.length) {
    console.log(`Our ${name} numbers: ${describeExpected(EXPECTED[region], EXTRA)}.\n`);
  }
  if (found.gone.length) {
    console.log("Recorded differences that no longer show (the source changed or now agrees):");
    line("  =", found.gone);
    console.log(`\nRemove them from KNOWN_DIFFERENCES.${region} in the script.\n`);
  }
  if (found.unreadable.length) {
    console.log("Could not read:");
    line("  ?", found.unreadable);
    console.log("");
  }
}

const all = Object.values(regional);
const anyProblem = problems.length || all.some((r) => r.problems.length);
const anyUnreadable = unreadable.length || all.some((r) => r.unreadable.length);
const anyNote =
  gmsNotes.length || all.some((r) => r.notes.length || r.differences.length || r.gone.length);
if (!anyProblem && !anyUnreadable && !anyNote) console.log("Everything matches.");

process.exit(anyProblem ? 1 : anyUnreadable ? 2 : anyNote ? 3 : 0);
