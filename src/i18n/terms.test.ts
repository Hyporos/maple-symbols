import { describe, expect, it } from "vitest";
import { DEFAULT_EDITION, EDITIONS, nameSetFor, pageMetaFor } from "../lib/routes";
import { en } from "./en";
import { editionMessages, messagesFor } from "./index";
import { DEFAULT_NAME_SET, fillTerms, TERM_NAMES, TERMS, termsFor } from "./terms";

// Walks a catalogue and yields [dotted.key, message] for every string in it.
function* messages(node: unknown, path = ""): Generator<[string, string]> {
  if (typeof node === "string") {
    yield [path, node];
    return;
  }
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    yield* messages(value, path ? `${path}.${key}` : key);
  }
}

const placeholders = (message: string) =>
  [...message.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const isTerm = (name: string) => (TERM_NAMES as readonly string[]).includes(name);
const byRegion = (region: string) => EDITIONS.find((e) => e.region === region)!;

describe("the terms table (docs/I18N.md §10)", () => {
  it("gives every edition's page its own client's name set, each with a table", () => {
    expect(DEFAULT_NAME_SET).toBe(DEFAULT_EDITION.nameSet);
    expect(EDITIONS.map((e) => [e.region, nameSetFor(e)])).toEqual([
      ["gms", "en-gms"],
      ["msea", "en-msea"],
      // Served in their own language since 2026-09-23 (an edition served in English would
      // get en-gms: never Korean words in English copy).
      ["kms", "ko"],
      ["jms", "ja"],
      ["tms", "zh-Hant"],
      ["cms", "zh-Hans"],
    ]);
    for (const edition of EDITIONS) expect(() => termsFor(nameSetFor(edition))).not.toThrow();
  });

  it("gives every table the same terms, none of them blank", () => {
    const keys = Object.keys(TERMS["en-gms"]);
    for (const [nameSet, terms] of Object.entries(TERMS)) {
      expect(Object.keys(terms!), nameSet).toEqual(keys);
      for (const value of Object.values(terms!)) expect(value.trim(), nameSet).not.toBe("");
    }
  });

  it("leaves no term placeholder in any edition's catalogue, and every run-time one untouched", () => {
    const english = new Map(messages(en));
    for (const edition of EDITIONS) {
      for (const [key, message] of messages(editionMessages(edition))) {
        const expected = placeholders(english.get(key)!).filter((name) => !isTerm(name));
        expect(placeholders(message), `${edition.region} ${key}`).toEqual(expected);
      }
    }
  });

  it("uses a term in the English catalogue, so the table is not dead weight", () => {
    const used = new Set([...messages(en)].flatMap(([, message]) => placeholders(message)));
    for (const name of TERM_NAMES) expect(used.has(name), name).toBe(true);
  });

  it("keeps GMS in the words it has always used", () => {
    const m = editionMessages(DEFAULT_EDITION);
    expect(m.shell.sacred).toBe("Sacred");
    expect(m.graph.targetPowerFull.arcane).toBe("Target Arcane Power");
    expect(m.handbook.symbolsHeading.sacred).toBe("Sacred Symbols");
    expect(m.tools.catalystWorldTag).toBe("<b>[Regular Server Only]</b>");
    expect(m.tools.sacredCatalystTooltip).toBe(
      "Transfer a Sacred Symbol once within the same world"
    );
    expect(m.calculator.demonAvengerHp).toBe("<b>+{hp}</b> HP (Demon Avenger)");
  });

  it("reads MSEA in its own client's terms (D-19)", () => {
    const m = editionMessages(byRegion("msea"));
    expect(m.shell.sacred).toBe("Authentic");
    expect(m.graph.power).toEqual({ arcane: "Arcane Force", sacred: "Authentic Force" });
    expect(m.handbook.symbolsHeading.sacred).toBe("Authentic Symbols");
    expect(m.handbook.sacredPowerTooltip).toBe(
      "The difference between <b>your Authentic Force</b> and the <b>map requirement</b>"
    );
    expect(m.tools.sacredCatalyst).toBe("Authentic Catalyst");
    // MSEA's word, though the tag is not shown there (catalystRegularWorldOnly is false).
    expect(m.tools.catalystWorldTag).toBe("<b>[Normal World Only]</b>");
    expect(m.tools.sacredCatalystTooltip).toBe(
      "Transfer an Authentic Symbol once within the same world"
    );
  });

  it("gives each edition its own page titles and descriptions", () => {
    expect(pageMetaFor("/").title).toBe(
      "MapleStory Arcane & Sacred Symbol Calculator | Maple Symbols"
    );
    expect(pageMetaFor("/", byRegion("msea")).title).toBe(
      "MSEA Arcane & Authentic Symbol Calculator | Maple Symbols"
    );
    expect(pageMetaFor("/handbook", byRegion("msea")).description).toBe(
      "Complete Arcane and Authentic Symbol reference for MapleStory (MSEA): experience tables, meso upgrade costs, and damage ratios."
    );
    // A translated edition reads its own language and terms, and names its own server.
    expect(pageMetaFor("/handbook", byRegion("kms")).description).toContain(
      "메이플스토리(KMS) 아케인심볼·어센틱심볼"
    );
  });

  it("memoises the filled catalogue per page", () => {
    expect(messagesFor("en", "en-msea", { pageServer: "MSEA", pageGame: "MSEA" })).toBe(
      editionMessages(byRegion("msea"))
    );
    expect(messagesFor("fr")).toBe(editionMessages(DEFAULT_EDITION));
  });

  it("fills only the names it knows", () => {
    const values = { ...TERMS["en-msea"], pageServer: "MSEA", pageGame: "MSEA" };
    expect(fillTerms("{count} {sacredSymbols} on {server} ({pageServer})", values)).toBe(
      "{count} Authentic Symbols on {server} (MSEA)"
    );
    expect(fillTerms({ one: "{sacredSymbol}", other: "{sacredSymbols}" }, values)).toEqual({
      one: "Authentic Symbol",
      other: "Authentic Symbols",
    });
  });
});
