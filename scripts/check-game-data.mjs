// ---------------------------------------------------------------------------
// check-game-data.mjs — warns when the game's symbol numbers drift from ours.
//
// The site shipped GMS v.271's doubled acquisition rates two weeks late because
// nothing watched for it (docs/KNOWN_ISSUES.md KI-014). This compares our data
// with the MapleStory Wiki, which mirrors GMS within a day of each patch, and
// scans the regions that patch ahead of GMS for symbol wording.
//
// It reads the network only. Run it with `pnpm check:data`; the weekly workflow
// in .github/workflows/game-data.yml opens an issue when it exits non-zero.
//
// Exit codes: 0 nothing to do · 1 a number disagrees · 2 a source was unreadable.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";

const symbols = JSON.parse(readFileSync(new URL("../src/lib/symbols.json", import.meta.url)));
const gameTs = readFileSync(new URL("../src/lib/game.ts", import.meta.url), "utf8");

/** Our `WEEKLY_SYMBOLS`, read from the source so the two cannot drift apart. */
const WEEKLY_SYMBOLS = Number(gameTs.match(/WEEKLY_SYMBOLS = (\d+)/)?.[1]);
/** Our arcane extra-quest multiplier, likewise. */
const EXTRA_ARCANE = Number(gameTs.match(/EXTRA_MULTIPLIER[^=]*= \{ arcane: ([\d.]+)/)?.[1]);

/** The wiki titles each symbol's page "<family>: <our display name>". */
const pageFor = (symbol) => {
  const family = symbol.type === "arcane" ? "Arcane Symbol" : "Sacred Symbol";
  return `${family}: ${symbol.name}`.replace(/ /g, "_");
};

const WIKI = "https://maplestorywiki.net/api.php";
const RECENT_DAYS = 90;

const problems = [];
const notes = [];
const unreadable = [];

async function wikitext(page) {
  const url = `${WIKI}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json`;
  const response = await fetch(url, { headers: { "user-agent": "maple-symbols-data-check" } });
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

async function checkSymbols() {
  for (const symbol of symbols.symbols) {
    const page = pageFor(symbol);
    let found;
    try {
      found = acquisition(await wikitext(page));
    } catch (error) {
      unreadable.push(`${symbol.name}: ${page} (${error.message})`);
      continue;
    }

    if (found.daily === null) {
      unreadable.push(`${symbol.name}: no "per day" line on ${page}`);
    } else if (found.daily !== symbol.dailySymbols) {
      problems.push(
        `${symbol.name}: daily is ${found.daily} on the wiki, ${symbol.dailySymbols} in symbols.json`
      );
    }

    // The extra quest should multiply the daily by our arcane multiplier.
    if (symbol.extraName && found.dailyWithExtra !== null) {
      const ours = symbol.dailySymbols * EXTRA_ARCANE;
      if (found.dailyWithExtra !== ours) {
        problems.push(
          `${symbol.name}: with ${symbol.extraName} the wiki says ${found.dailyWithExtra}, we compute ${ours}`
        );
      }
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
    }
  }
}

/** Regions that get these patches before GMS: an early warning, not a comparison. */
async function checkAhead() {
  const since = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  const symbolWords = /symbol|심볼|シンボル|符文|徽章/i;
  const rateWords = /increase|rate|daily|weekly|reward|증가|増加|增加/i;

  try {
    const feed = await (await fetch("https://orangemushroom.net/feed/")).text();
    for (const item of feed.split("<item>").slice(1)) {
      const title = item.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
      const date = Date.parse(item.match(/<pubDate>([^<]*)<\/pubDate>/)?.[1] ?? "");
      const body = item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "";
      if (!(date > since)) continue;
      if (symbolWords.test(body) && rateWords.test(body)) {
        notes.push(
          `KMS (leads GMS by months): "${title.replace(/&#\d+;/g, "'")}" mentions symbols`
        );
      }
    }
  } catch (error) {
    unreadable.push(`Orange Mushroom feed: ${error.message}`);
  }

  try {
    const list = await (await fetch("https://www.maplesea.com/updates/")).text();
    const latest = [...list.matchAll(/updates\/view\/([^"']+)/g)].map((m) => m[1]).slice(0, 4);
    for (const slug of latest) {
      const page = await (await fetch(`https://www.maplesea.com/updates/view/${slug}`)).text();
      if (/arcane symbol|sacred symbol|authentic symbol/i.test(page) && rateWords.test(page)) {
        notes.push(`MSEA (patches before GMS): ${slug} mentions symbols`);
      }
    }
  } catch (error) {
    unreadable.push(`MapleSEA updates: ${error.message}`);
  }
}

await checkSymbols();
await checkAhead();

const line = (prefix, items) => items.forEach((item) => console.log(`${prefix} ${item}`));

console.log(`Checked ${symbols.symbols.length} symbols against maplestorywiki.net.\n`);
if (problems.length) {
  console.log("Numbers that disagree with our data:");
  line("  ✗", problems);
  console.log("\nCheck the patch notes before changing anything: the wiki may be describing");
  console.log("another region, an event bonus, or a change GMS has not received yet.");
  console.log("Then follow docs/GAME.md §6 and record the check in §7.\n");
}
if (notes.length) {
  console.log("Regions that patch ahead of GMS mentioned symbols recently:");
  line("  •", notes);
  console.log("");
}
if (unreadable.length) {
  console.log("Could not read:");
  line("  ?", unreadable);
  console.log("");
}
if (!problems.length && !notes.length && !unreadable.length) console.log("Everything matches.");

process.exit(problems.length ? 1 : unreadable.length ? 2 : 0);
