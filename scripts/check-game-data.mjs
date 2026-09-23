// ---------------------------------------------------------------------------
// check-game-data.mjs — warns when the game's symbol data drifts from ours.
//
// The site shipped GMS v.271's doubled acquisition rates two weeks late because
// nothing watched for it (docs/KNOWN_ISSUES.md KI-014). This compares every
// number of ours that patches have changed before (GAME §6 lists them, and what
// is left out on purpose) with the MapleStory Wiki, which mirrors GMS within a
// day of each patch. It also reads the official patch notes of the regions that
// get changes before GMS and reports any that mention symbols.
//
// It reads the network only. Run it with `pnpm check:data` (add `--days=N` to
// widen the patch-note window); the weekly workflow in
// .github/workflows/game-data.yml opens an issue when it exits non-zero.
//
// Exit codes: 0 nothing to do · 1 a number disagrees · 2 a source was unreadable
// · 3 only a heads-up: a patch note (GMS's own, or a region ahead of it) mentions symbols.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";

const symbols = JSON.parse(readFileSync(new URL("../src/lib/symbols.json", import.meta.url)));
const gameTs = readFileSync(new URL("../src/lib/game.ts", import.meta.url), "utf8");

/** Our `WEEKLY_SYMBOLS`, read from the source so the two cannot drift apart. */
const WEEKLY_SYMBOLS = Number(gameTs.match(/WEEKLY_SYMBOLS = (\d+)/)?.[1]);
/** Our arcane extra-quest multiplier, likewise. */
const EXTRA_ARCANE = Number(gameTs.match(/EXTRA_MULTIPLIER[^=]*= \{ arcane: ([\d.]+)/)?.[1]);
const calculatorTsx = readFileSync(
  new URL("../src/components/Calculator/Calculator.tsx", import.meta.url),
  "utf8"
);
/** An `{ arcane: N, sacred: M }` constant from our source. */
const pair = (source, name) => {
  const m = source.match(new RegExp(`${name}[^=]*= \\{ arcane: (\\d+), sacred: (\\d+) \\}`));
  return m ? { arcane: Number(m[1]), sacred: Number(m[2]) } : null;
};
const POWER = Number(gameTs.match(/POWER_PER_LEVEL = (\d+)/)?.[1]);
/** Gains per level-up, as the next-level panel shows them. */
const OUR_STATS = {
  Power: { arcane: POWER, sacred: POWER },
  "Main stat": pair(gameTs, "MAIN_STAT_PER_LEVEL"),
  "Demon Avenger HP": pair(calculatorTsx, "DEMON_AVENGER_HP"),
  "Xenon STR, DEX and LUK": pair(calculatorTsx, "XENON_ALL_STAT"),
};

/**
 * The meso formulas (GAME §1). The epsilon keeps floating point from flooring
 * 122.99… (15 × 8.2) to 122; the formula reproduces all 174 costs only with it.
 */
const arcaneCost = (k, level) =>
  Math.round(1e4 * Math.floor((level ** 2 + 11) * (k + 0.1 * level) + 1e-9));
const sacredCost = (k, level) =>
  Math.round(1e5 * Math.floor((9 * level ** 2 + 20 * level) * (k - 0.6 * level) + 1e-9));
/** Each symbol's k, by id (arcane 1–6, sacred 7–12). A new symbol needs its k here. */
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
};

/**
 * Symbols the game has and the site does not model yet (Grand Sacred, in 2.0:
 * GAME §4). Their confirmed numbers live here so a change is still caught; move
 * each one into symbols.json when 2.0 adds it, and delete it from this list.
 */
const PENDING = [
  { name: "Tallahart", family: "Grand Sacred Symbol", daily: 15, costK: 39.8, maxLevel: 11 },
  { name: "Geardock", family: "Grand Sacred Symbol", daily: 15, costK: 48.8, maxLevel: 11 },
].map((s) => ({
  ...s,
  mesosRequired: [
    0,
    ...Array.from({ length: s.maxLevel - 1 }, (_, i) => sacredCost(s.costK, i + 1)),
  ],
}));

const FAMILY = { arcane: "Arcane Symbol", sacred: "Sacred Symbol" };
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
  msea: "https://www.maplesea.com/updates/",
};
const WIKI = SOURCES.wiki;
const DAYS_ARG = Number(process.argv.find((a) => a.startsWith("--days="))?.slice(7));
const DAYS = DAYS_ARG > 0 ? DAYS_ARG : 8;
const SINCE = Date.now() - DAYS * 24 * 60 * 60 * 1000;
const AGENT = { headers: { "user-agent": "Mozilla/5.0 (maple-symbols data check)" } };

const problems = [];
const gmsNotes = [];
const notes = [];
const unreadable = [];

async function wikitext(page) {
  const url = `${WIKI}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json`;
  const response = await fetch(url, AGENT);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.json();
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
  for (const symbol of symbols.symbols) {
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
        const weekly = found.perClear * (found.clears ?? 1);
        if (weekly !== WEEKLY_SYMBOLS) {
          problems.push(
            `${symbol.name}: weekly is ${found.perClear} × ${found.clears ?? 1} = ${weekly} on the wiki, WEEKLY_SYMBOLS is ${WEEKLY_SYMBOLS}`
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

// --- Regions that patch before GMS ---------------------------------------------------------

const SYMBOL_WORDS = /심볼|シンボル|symbol/i;
/** A weekly reset day moving (as it did in 2025) is worth a line even without the word "symbol". */
const RESET_DAY_WORDS =
  /초기화 요일|요일.{0,20}초기화|初期化.{0,10}曜日|曜日.{0,20}(初期化|リセット)|reset (day|time).{0,40}(weekly|thursday|monday)|(weekly|thursday|monday).{0,60}reset (day|time)/i;
const CHANGE_WORDS =
  /증가|감소|하향|상향|변경|비용|메소|획득|초기화|増加|減少|変更|費用|コスト|メル|獲得|初期化|increase|decrease|reduc|chang|adjust|cost|meso|reset/i;

const decode = (html) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|li|div|tr|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

/** The lines of a patch note that mention symbols and a change, trimmed for the report. */
function symbolLines(html) {
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

async function scanNotices(region, entries, into = notes) {
  const day = (t) => new Date(t).toISOString().slice(0, 10);
  for (const { title, url, date, posted, html } of entries) {
    if (!(date > SINCE)) continue;
    try {
      let page = html;
      if (page === undefined) {
        const response = await fetch(url, AGENT);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        page = await response.text();
      }
      if (!page) throw new Error("empty page");
      const lines = symbolLines(page);
      if (lines.length) {
        const when =
          posted && day(posted) !== day(date)
            ? `${day(date)} (edited; first posted ${day(posted)})`
            : day(date);
        into.push(
          `${region} ${when} "${title}" ${url}\n` +
            lines
              .slice(0, 4)
              .map((l) => `        ${l}`)
              .join("\n")
        );
      }
    } catch (error) {
      unreadable.push(`${region} notice ${url}: ${error.message}`);
    }
  }
}

/**
 * GMS's own patch notes: the second, official source. A notice counts from its
 * first posting or from its latest "[Updated M/D]" edit, whichever is newer.
 */
async function checkGmsNotes() {
  try {
    const response = await fetch(SOURCES.gmsNews, AGENT);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const list = await response.json();
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
      const detail = await (await fetch(`${SOURCES.gmsNews}/${entry.id}`, AGENT)).json();
      if (typeof detail.body !== "string")
        throw new Error(`news ${entry.id} has no body (API changed?)`);
      await scanNotices("GMS", [{ ...entry, html: detail.body }], gmsNotes);
    }
  } catch (error) {
    unreadable.push(`GMS patch notes (${SOURCES.gmsNews}): ${error.message}`);
  }
}

async function checkAhead() {
  // KMS gets every change first, usually months ahead of GMS.
  try {
    const html = await (await fetch(SOURCES.kms, AGENT)).text();
    const entries = [
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
    if (!entries.length) throw new Error("no entries found (page layout changed?)");
    await scanNotices("KMS", entries);
  } catch (error) {
    unreadable.push(`KMS update list: ${error.message}`);
  }

  // JMS: the list is loaded by script from this partial.
  try {
    const html = await (await fetch(SOURCES.jms, AGENT)).text();
    const entries = [
      ...html.matchAll(
        /alias=([a-z0-9]{32})&amp;id=update">([^<]*)<\/a>[\s\S]*?class="date">(\d{4})\.(\d{2})\.(\d{2})</g
      ),
    ].map((m) => ({
      title: decode(m[2]).trim(),
      url: `https://maplestory.nexon.co.jp/notice/view/?alias=${m[1]}&id=update`,
      date: Date.UTC(+m[3], +m[4] - 1, +m[5]),
    }));
    if (!entries.length) throw new Error("no entries found (page layout changed?)");
    await scanNotices("JMS", entries);
  } catch (error) {
    unreadable.push(`JMS update list: ${error.message}`);
  }

  // MSEA: dates are "[dd.mm]"; shop and gachapon notices are skipped.
  try {
    const html = await (await fetch(SOURCES.msea, AGENT)).text();
    const now = new Date();
    const entries = [
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
    if (!entries.length) throw new Error("no entries found (page layout changed?)");
    await scanNotices("MSEA", entries);
  } catch (error) {
    unreadable.push(`MapleSEA update list: ${error.message}`);
  }
}

try {
  await checkSymbols();
  checkFormula();
  await checkPending();
  await checkRoster();
  await checkStats();
  await checkGmsNotes();
  await checkAhead();
} catch (error) {
  // A bug or a surprise in a source must not read as "our numbers moved" (exit 1).
  unreadable.push(`The check itself failed: ${error.stack ?? error.message}`);
}

const line = (prefix, items) => items.forEach((item) => console.log(`${prefix} ${item}`));

console.log(
  `Checked ${symbols.symbols.length} symbols and ${PENDING.length} not yet modelled against maplestorywiki.net: ` +
    "daily, extra and weekly amounts, quest names, meso costs (also against the cost formula), " +
    "per-level stat gains, " +
    "and the symbol lists.\n" +
    `Read the GMS, KMS, JMS and MSEA patch notes from the last ${DAYS} day${DAYS === 1 ? "" : "s"}.\n`
);

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
if (notes.length) {
  console.log("Regions that patch before GMS changed something about symbols:");
  line("  •", notes);
  console.log(
    "\nNothing to change yet: note it in GAME §5, and expect it in GMS in a later patch.\n"
  );
}
if (unreadable.length) {
  console.log("Could not read:");
  line("  ?", unreadable);
  console.log("");
}
const quiet = !problems.length && !gmsNotes.length && !notes.length && !unreadable.length;
if (quiet) console.log("Everything matches.");

process.exit(problems.length ? 1 : unreadable.length ? 2 : gmsNotes.length || notes.length ? 3 : 0);
