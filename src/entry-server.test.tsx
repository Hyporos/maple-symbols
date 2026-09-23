// @vitest-environment node
// ---------------------------------------------------------------------------
// The build renders every page in Node (src/entry-server.tsx, scripts/prerender.mjs).
// This runs that render with no browser globals at all, so code that reaches for
// window, document or storage while rendering fails here instead of in the build.
// ---------------------------------------------------------------------------

import { describe, expect, it } from "vitest";
import { renderPage } from "./entry-server";

describe("renderPage (build-time HTML)", () => {
  it("renders the whole GMS calculator page, lazy sections included", async () => {
    const html = await renderPage("/");
    expect(html).toContain("Vanishing Journey");
    expect(html).toContain("Symbol Overview"); // the lazily loaded Overview card
    expect(html).toContain('href="/handbook"');
  });

  it("renders an edition's page with that edition's links and server", async () => {
    const html = await renderPage("/msea/handbook");
    expect(html).toContain("Arcane Symbols");
    expect(html).toContain('href="/msea/handbook"');
    expect(html).toContain("MSEA");
    // A translated edition renders in its own language.
    const kms = await renderPage("/kms/handbook");
    expect(kms).toContain("아케인심볼");
    expect(kms).toContain('href="/kms/handbook"');
  });

  it("renders a CMS page with its own prefixed links", async () => {
    const html = await renderPage("/cms/handbook");
    expect(html).toContain('href="/cms"');
  });

  it("renders as a phone, the layout Google indexes", async () => {
    const html = await renderPage("/");
    expect(html).toContain("/main/logo-sm.webp");
    expect(html).not.toContain("/main/logo-lg.webp");
  });

  it("leaves out everything that depends on the visitor: the server suggestion, the local reset", async () => {
    const html = await renderPage("/");
    expect(html).not.toContain("Playing on");
    expect(html).not.toContain("your time");
  });
});
