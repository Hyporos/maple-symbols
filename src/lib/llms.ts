// ---------------------------------------------------------------------------
// llms.ts — The site as plain Markdown for AI agents (docs/AI_SEARCH.md).
//
// Builds /llms.txt (the index an agent reads first), /llms-full.txt (everything in
// one file) and a Markdown copy of every page ("/handbook" → "/handbook.md"), from
// the same data, terms and names the pages render, so the text can never disagree
// with the calculator. scripts/ai-files.mjs writes them into dist/ after the build.
// Only editions served in English get Markdown until the translated catalogues are
// published (AI_SEARCH backlog). Pure: the build date is passed in.
// ---------------------------------------------------------------------------

import { changelog } from "../i18n/en/changelog";
import { symbolNames } from "../i18n/gameNames";
import { changelogEntries } from "./changelog";
import { createInitialSymbols } from "./data";
import { formatNumber } from "./format";
import {
  CATALYST_RETENTION,
  EXTRA_MULTIPLIER,
  MAX_POWER_PER_SYMBOL,
  maxLevelFor,
  selectorWorksOn,
} from "./game";
import { arcaneRatioData, sacredRatioData } from "./ratioData";
import { isPublished, mesosKind, REGION_PROFILES, weeklySymbolsFor } from "./regions";
import {
  EDITIONS,
  markdownEditions,
  markdownPath,
  markdownUrl,
  nameSetFor,
  pageMetaFor,
  ROUTES,
  SITE_NAME,
  SITE_URL,
  termValuesFor,
  urlFor,
  type Edition,
  type RoutePath,
} from "./routes";
import type { SymbolData, SymbolType } from "./types";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export { markdownEditions, markdownPath, markdownUrl } from "./routes";

const n = (value: number) => formatNumber(value);
const brandless = (title: string) => title.replace(/\s*\|\s*Maple Symbols$/, "");
const utc = (hours: number) => (hours === 0 ? "UTC" : `UTC+${hours}`);
const table = (head: string[], rows: (string | number)[][]) =>
  [
    `| ${head.join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.map((c) => (typeof c === "number" ? n(c) : c)).join(" | ")} |`),
  ].join("\n");

interface EditionContext {
  edition: Edition;
  symbols: SymbolData[];
  name: (s: SymbolData) => string;
  terms: ReturnType<typeof termValuesFor>;
}

const contextFor = (edition: Edition): EditionContext => {
  const nameSet = nameSetFor(edition);
  return {
    edition,
    symbols: createInitialSymbols(edition.region),
    name: (s) => symbolNames(s, nameSet).name,
    terms: termValuesFor(edition),
  };
};

const familyLabel = (c: EditionContext, type: SymbolType) =>
  type === "arcane"
    ? c.terms.arcaneSymbols
    : type === "sacred"
      ? c.terms.sacredSymbols
      : `Grand ${c.terms.sacredSymbols}`;

const total = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

const header = (c: EditionContext, path: RoutePath, generated: string) => {
  const meta = pageMetaFor(path, c.edition);
  return [
    `# ${brandless(meta.title)}`,
    "",
    `> ${meta.description}`,
    "",
    `Source page: ${urlFor(path, c.edition)} · Server: ${c.edition.name} · Generated ${generated} from the site's own data.`,
  ].join("\n");
};

function calculatorMarkdown(c: EditionContext, generated: string): string {
  const { edition, symbols, terms } = c;
  const profile = REGION_PROFILES[edition.region];
  const weekly = weeklySymbolsFor(edition.region);
  const byType = (type: SymbolType) => symbols.filter((s) => s.type === type);
  const toMax = (type: SymbolType) => total(byType(type)[0]?.symbolsRequired ?? []);
  const rateRows = symbols.map((s) => [
    c.name(s),
    familyLabel(c, s.type),
    s.dailySymbols,
    s.extraName
      ? `${n(s.dailySymbols * (EXTRA_MULTIPLIER[s.type] ?? 1))} (with ${symbolNames(s, nameSetFor(edition)).extraName})`
      : "–",
    s.weeklyName ? weekly : "–",
  ]);
  return [
    header(c, "/", generated),
    "",
    `${SITE_NAME} is a free, ad-free web calculator: enter each symbol's level and experience and which daily and weekly quests you do, and it gives the day each symbol reaches max level, the mesos every upgrade costs, and a graph of your ${terms.arcanePower} and ${terms.sacredPower} over time.`,
    "",
    "## How symbols level",
    "",
    `- ${terms.arcaneSymbols}: level 1 to ${maxLevelFor("arcane")}, +10 ${terms.arcanePower} per level (${MAX_POWER_PER_SYMBOL.arcane} at max, counting the 20 at level 1). ${n(toMax("arcane"))} symbols take one from level 1 to max.`,
    `- ${terms.sacredSymbols}: level 1 to ${maxLevelFor("sacred")}, +10 ${terms.sacredPower} per level (${MAX_POWER_PER_SYMBOL.sacred} at max). ${n(toMax("sacred"))} symbols take one from level 1 to max.`,
    `- Grand ${terms.sacredSymbols} (${byType("grand").map(c.name).join(", ")}): the ${terms.sacredSymbols} table, max level ${maxLevelFor("grand")}, no weekly quest, no ${terms.sacredCatalyst}, no main stat. The Symbol Selector works on ${byType("grand").filter(selectorWorksOn).map(c.name).join(", ") || "none of them"}.`,
    `- ${terms.arcaneCatalyst} keeps ${CATALYST_RETENTION.arcane! * 100}% of a symbol's experience and ${terms.sacredCatalyst} ${CATALYST_RETENTION.sacred! * 100}%; the symbol must be level 2 or higher.`,
    "",
    `## Symbols per day and week (${edition.name})`,
    "",
    table(["Symbol", "Family", "Daily", "Daily with extra quest", "Weekly"], rateRows),
    "",
    `The weekly is ${profile.weekly.clears > 1 ? `${profile.weekly.clears} clears of ${profile.weekly.perClear}` : `one clear of ${profile.weekly.perClear}`} (${weekly} a week, ${terms.arcaneRegion} only).`,
    "",
    "## Reset clock",
    "",
    `Days count on the ${edition.name} server clock: dailies reset at 00:00 ${utc(profile.resetUtcOffsetHours)} and the weekly on ${WEEKDAYS[profile.weeklyResetDay]}. The calculator starts counting from tomorrow and credits each week's weekly on its reset day.`,
    "",
    "## How far to trust the numbers",
    "",
    `Status per kind of number on ${edition.name} (confirmed = seen in game; sourced = a dated official or wiki source agrees; inferred = reasoned from other servers; unpublished = hidden on the site):`,
    "",
    table(
      ["Kind", "Status"],
      Object.entries(profile.status).map(([kind, status]) => [kind, status])
    ),
    "",
    `Sources: ${profile.sources}.`,
  ].join("\n");
}

function handbookMarkdown(c: EditionContext, generated: string): string {
  const { edition, symbols, terms } = c;
  const exp = (type: SymbolType) => {
    const table_ = symbols.find((s) => s.type === type)!.symbolsRequired;
    let running = 0;
    return table(
      ["Level", "Symbols to next level", "Total symbols"],
      table_.slice(1).map((need, i) => [`${i + 1} → ${i + 2}`, need, (running += need)])
    );
  };
  const costs = symbols.map((s) => {
    const heading = `### ${c.name(s)} (${familyLabel(c, s.type)})`;
    if (!isPublished(edition.region, mesosKind(s.type)))
      return `${heading}\n\nMeso costs are not published yet for ${edition.name}.`;
    const rows = s.mesosRequired.slice(1).map((m, i) => [`${i + 1} → ${i + 2}`, m]);
    return `${heading}\n\n${table(["Level", "Mesos"], rows)}\n\nTotal to max: ${n(total(s.mesosRequired))} mesos.`;
  });
  return [
    header(c, "/handbook", generated),
    "",
    `## Symbols per level: ${terms.arcaneSymbols}`,
    "",
    exp("arcane"),
    "",
    `## Symbols per level: ${terms.sacredSymbols} (Grand ${terms.sacredSymbols} use the same table)`,
    "",
    exp("sacred"),
    "",
    `## Meso cost per upgrade (${edition.name})`,
    "",
    costs.join("\n\n"),
    "",
    `## Damage ratio: ${terms.arcaneRegion} (${terms.arcanePower} as a share of the map's requirement)`,
    "",
    table(
      [terms.arcanePower, "Damage dealt %", "Damage taken %"],
      arcaneRatioData.map((r) => [r.arcanePower, r.damageDealt, r.damageTaken])
    ),
    "",
    `## Damage ratio: ${terms.sacredRegion} (your ${terms.sacredPower} minus the map's requirement)`,
    "",
    table(
      [`${terms.sacredPower} difference`, "Damage dealt %", "Damage taken %"],
      sacredRatioData.map((r) => [String(r.sacredPower), r.damageDealt, r.damageTaken])
    ),
  ].join("\n");
}

function changelogMarkdown(c: EditionContext, generated: string): string {
  const entries = [...changelogEntries].reverse().map((e) => {
    const notes: { additions?: readonly string[]; fixes?: readonly string[] } =
      changelog[e.version];
    const list = (title: string, items?: readonly string[]) =>
      items?.length ? `\n\n**${title}**\n\n${items.map((i) => `- ${i}`).join("\n")}` : "";
    return `## ${e.version} (${e.date})${list("New", notes.additions)}${list("Fixes", notes.fixes)}\n\nPull request: ${e.link}`;
  });
  return [header(c, "/changelog", generated), "", ...entries].join("\n\n");
}

function creditsMarkdown(c: EditionContext, generated: string): string {
  return [
    header(c, "/credits", generated),
    "",
    "- Built by Hyporos (source: https://github.com/Hyporos/maple-symbols).",
    "- Original resources: MapleStory Fandom Wiki, MapleStory Strategy Wiki, Orange Mushroom's Blog.",
    "- Numbers today: the MapleStory Wiki (maplestorywiki.net) and each server's official patch notes (nexon.com, maplesea.com, maplestory.nexon.com, maplestory.nexon.co.jp, maplestory.beanfun.com, mxd.web.sdo.com).",
    "- Thanks: Scardor, GradedPeanut, the Saku and Shark Tank guilds.",
  ].join("\n");
}

const BUILDERS: Record<RoutePath, (c: EditionContext, generated: string) => string> = {
  "/": calculatorMarkdown,
  "/handbook": handbookMarkdown,
  "/changelog": changelogMarkdown,
  "/credits": creditsMarkdown,
};

/** One page's Markdown copy. */
export const pageMarkdown = (path: RoutePath, edition: Edition, generated: string): string =>
  BUILDERS[path](contextFor(edition), generated) + "\n";

/** Every Markdown file the build writes, keyed by site path. */
export function markdownFiles(generated: string): Record<string, string> {
  const files: Record<string, string> = {};
  for (const edition of markdownEditions())
    for (const route of ROUTES)
      files[markdownPath(route.path, edition)] = pageMarkdown(route.path, edition, generated);
  return files;
}

/** /llms.txt: what the site is, and a link to every page's Markdown copy (llmstxt.org). */
export function llmsTxt(generated: string): string {
  const editions = markdownEditions();
  const section = (path: RoutePath, title: string) =>
    [
      `## ${title}`,
      "",
      ...editions.map((e) => {
        const meta = pageMetaFor(path, e);
        return `- [${brandless(meta.title)} (${e.name})](${markdownUrl(path, e)}): ${meta.description}`;
      }),
    ].join("\n");
  return [
    `# ${SITE_NAME}`,
    "",
    "> Free, ad-free MapleStory symbol calculator for Arcane, Sacred (Authentic) and Grand Sacred symbols: completion dates from daily and weekly quests, meso upgrade costs, power over time, and reference tables, with each game server's own numbers and reset clock.",
    "",
    `One site version per server: ${EDITIONS.map((e) => `${e.name} at ${SITE_URL}${e.prefix || "/"}`).join(", ")}. Each Markdown file below is generated from the same data as its page (${generated}); prefer it over the HTML, which is an interactive app. Numbers carry a trust status (confirmed, sourced, inferred, unpublished) listed on each calculator page.`,
    "",
    section("/", "Calculator"),
    "",
    section("/handbook", "Handbook: tables"),
    "",
    "## Optional",
    "",
    ...editions.flatMap((e) =>
      (["/changelog", "/credits"] as const).map(
        (path) =>
          `- [${brandless(pageMetaFor(path, e).title)} (${e.name})](${markdownUrl(path, e)})`
      )
    ),
    `- [Everything in one file](${SITE_URL}/llms-full.txt)`,
    "",
  ].join("\n");
}

/** /llms-full.txt: every Markdown page in one file, for agents that read a single URL. */
export const llmsFullTxt = (generated: string): string =>
  [llmsTxt(generated), ...Object.values(markdownFiles(generated))].join("\n---\n\n");
