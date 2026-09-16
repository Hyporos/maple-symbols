// ---------------------------------------------------------------------------
// The Umami gate in index.html: production hosts send, every other host logs and
// drops. The inline function is extracted from the real file and run as-is.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

const html = readFileSync("index.html", "utf8");

type BeforeSend = (type: string, payload: Record<string, unknown>) => unknown;

function loadGate(hostname: string): BeforeSend {
  const script = html.match(/<script>\s*(window\.umamiBeforeSend[\s\S]*?)<\/script>/);
  if (!script) throw new Error("umamiBeforeSend inline script not found in index.html");
  const fakeWindow = { location: { hostname } } as {
    location: { hostname: string };
    umamiBeforeSend?: BeforeSend;
  };
  new Function("window", script[1])(fakeWindow);
  if (typeof fakeWindow.umamiBeforeSend !== "function")
    throw new Error("gate did not define itself");
  return fakeWindow.umamiBeforeSend;
}

describe("Umami tracker tag", () => {
  it("points the tracker at the gate and enables Web Vitals and search stripping", () => {
    const tag = html.match(/<script[^>]*cloud\.umami\.is\/script\.js[^>]*>/)?.[0] ?? "";
    expect(tag).toContain('data-before-send="umamiBeforeSend"');
    expect(tag).toContain('data-performance="true"');
    expect(tag).toContain('data-exclude-search="true"');
    // data-domains would block non-production hosts before the gate runs, hiding them from the console.
    expect(tag).not.toContain("data-domains");
  });

  it("defines the gate before the tracker loads", () => {
    expect(html.indexOf("window.umamiBeforeSend")).toBeLessThan(
      html.indexOf("cloud.umami.is/script.js")
    );
  });
});

describe("umamiBeforeSend", () => {
  afterEach(() => vi.restoreAllMocks());

  it.each(["maplesymbols.com", "www.maplesymbols.com"])("sends from production (%s)", (host) => {
    const payload = { url: "/handbook" };
    expect(loadGate(host)("event", payload)).toBe(payload);
  });

  it.each([
    "localhost",
    "127.0.0.1",
    "maple-symbols-git-v2-hyporos.vercel.app",
    "maplesymbols.com.evil.test",
  ])("logs and drops everywhere else (%s)", (host) => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    expect(loadGate(host)("event", { name: "quest_toggle" })).toBe(false);
    expect(info).toHaveBeenCalledWith(`[umami] not sent from ${host}:`, "event", {
      name: "quest_toggle",
    });
  });
});
