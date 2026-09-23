import { describe, expect, it } from "vitest";
import { EDITIONS, PUBLISHED_LANGUAGES } from "../lib/routes";
import { displayWidth } from "../test/helpers";
import { DRAFT_CATALOGUES, DRAFT_LANGUAGES } from "./drafts";
import { CATALOGUES } from "./index";
import { en } from "./en";
import { fillTerms, TERM_NAMES, TERMS } from "./terms";

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

const isTerm = (name: string) => (TERM_NAMES as readonly string[]).includes(name);
const runtime = (message: string) =>
  [...message.matchAll(/\{(\w+)\}/g)]
    .map((m) => m[1])
    .filter((name) => !isTerm(name))
    .sort();
const bold = (message: string) => [
  (message.match(/<b>/g) ?? []).length,
  (message.match(/<\/b>/g) ?? []).length,
];

const english = new Map(messages(en));

// Every translation, published or still a draft, is held to the English contract.
const TRANSLATIONS = [...PUBLISHED_LANGUAGES.filter((l) => l !== "en"), ...DRAFT_LANGUAGES];
const catalogueOf = (language: string) => CATALOGUES[language] ?? DRAFT_CATALOGUES[language];

describe.each(TRANSLATIONS)("the %s translation", (language) => {
  const draft = catalogueOf(language)!;
  const edition = EDITIONS.find((e) => e.language === language)!;
  const terms = TERMS[edition.nameSet];

  it("has a terms table for its edition's name set, from the official client", () => {
    expect(terms).toBeDefined();
  });

  it("asks for exactly the run-time values the English does, message by message", () => {
    for (const [key, message] of messages(draft)) {
      expect(runtime(message), `${language} ${key}`).toEqual(runtime(english.get(key)!));
    }
  });

  it("keeps its accent markup balanced and has no line breaks (I18N-10, I18N-11)", () => {
    for (const [key, message] of messages(draft)) {
      const [open, close] = bold(message);
      expect(open, `${language} ${key}`).toBe(close);
      expect(message, `${language} ${key}`).not.toMatch(/<br|\n/);
    }
  });

  it("names only known terms, and none is left once its edition's terms are filled", () => {
    const filled = fillTerms(draft, {
      ...terms!,
      pageServer: edition.name,
      pageGame: edition.name,
    });
    for (const [key, message] of messages(filled)) {
      const left = [...message.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter(isTerm);
      expect(left, `${language} ${key}`).toEqual([]);
    }
  });

  it("fits every title in 60 columns and every description in 155 (SEO-6, SEO-7)", () => {
    const filled = fillTerms(draft.pages, {
      ...terms!,
      pageServer: edition.name,
      pageGame: edition.name,
    });
    for (const page of [filled.calculator, filled.handbook, filled.changelog, filled.credits]) {
      expect(displayWidth(page.title), page.title).toBeLessThanOrEqual(60);
      expect(displayWidth(page.description), page.description).toBeLessThanOrEqual(155);
      expect(page.title).toMatch(/\| Maple Symbols$/);
    }
  });
});

describe("translations", () => {
  it("cover the four translated editions' languages", () => {
    expect([...TRANSLATIONS].sort()).toEqual(
      EDITIONS.map((e) => e.language)
        .filter((l) => l !== "en")
        .sort()
    );
  });
});
