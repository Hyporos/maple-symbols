import { describe, expect, it } from "vitest";
import { CATALOGUES, LOCALES } from "./index";
import { en } from "./en";

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

describe("the catalogues (docs/I18N.md §6)", () => {
  it("every locale has exactly the English keys", () => {
    const englishKeys = [...messages(en)].map(([key]) => key);
    for (const locale of LOCALES) {
      expect([...messages(CATALOGUES[locale])].map(([key]) => key)).toEqual(englishKeys);
    }
  });

  it("every translation uses the same placeholders as the English message", () => {
    const english = new Map(messages(en));
    for (const locale of LOCALES) {
      for (const [key, message] of messages(CATALOGUES[locale])) {
        expect(placeholders(message), `${locale} ${key}`).toEqual(placeholders(english.get(key)!));
      }
    }
  });

  it("no message carries a line break or markup other than flat <b>…</b> (I18N-11, B-1)", () => {
    for (const locale of LOCALES) {
      for (const [key, message] of messages(CATALOGUES[locale])) {
        expect(message, `${locale} ${key}`).not.toMatch(/<br|\n/i);
        const withoutAccents = message.replace(/<b>[^<]*<\/b>/g, "");
        expect(withoutAccents, `${locale} ${key}`).not.toMatch(/<\/?\w/);
      }
    }
  });

  it("no message is empty", () => {
    for (const locale of LOCALES) {
      for (const [key, message] of messages(CATALOGUES[locale])) {
        expect(message.trim(), `${locale} ${key}`).not.toBe("");
      }
    }
  });
});
