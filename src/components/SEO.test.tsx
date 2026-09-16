import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import SEO from "./SEO";
import { seedHeadMeta } from "../test/helpers";

const content = (selector: string) =>
  document.head.querySelector(selector)?.getAttribute("content");
const ldTypes = () =>
  (
    JSON.parse(document.head.querySelector("script[data-seo-ld]")!.textContent!) as Array<{
      "@type": string;
    }>
  ).map((x) => x["@type"]);

describe("SEO", () => {
  beforeEach(seedHeadMeta); // SEO.setMeta() no-ops on missing tags, exactly like in production

  it("writes title, description, canonical and a WebPage-only JSON-LD for a subpage", () => {
    render(
      <SEO
        title="Symbol Handbook | Maple Symbols"
        description="Handbook description"
        url="https://maplesymbols.com/handbook"
      />
    );

    expect(document.title).toBe("Symbol Handbook | Maple Symbols");
    expect(content('meta[name="description"]')).toBe("Handbook description");
    expect(content('meta[property="og:url"]')).toBe("https://maplesymbols.com/handbook");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://maplesymbols.com/handbook"
    );
    expect(ldTypes()).toEqual(["WebPage"]);
  });

  it("emits WebApplication + WebSite + WebPage on the root URL", () => {
    render(<SEO />);
    expect(ldTypes()).toEqual(["WebApplication", "WebSite", "WebPage"]);
  });
});
