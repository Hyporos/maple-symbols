import { readdirSync, readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notFoundPath, resetAnalyticsSession, targetBucket, track, trackOnce } from "./analytics";

describe("track", () => {
  let umamiTrack: ReturnType<typeof vi.fn<(...args: unknown[]) => unknown>>;

  beforeEach(() => {
    umamiTrack = vi.fn<(...args: unknown[]) => unknown>();
    window.umami = { track: umamiTrack };
    resetAnalyticsSession();
  });

  afterEach(() => {
    delete window.umami;
  });

  it("forwards the event name and data to Umami", () => {
    track("mode_switch", { to: "sacred" });
    expect(umamiTrack).toHaveBeenCalledWith("mode_switch", { to: "sacred" });
  });

  it("sends a data-less event with the name only", () => {
    track("cap_unlocked");
    expect(umamiTrack).toHaveBeenCalledWith("cap_unlocked");
  });

  it("is a silent no-op when the script is absent (dev, tests, blockers)", () => {
    delete window.umami;
    expect(() => track("graph_mode", { mode: "linear" })).not.toThrow();
  });

  it("never lets a throwing tracker break the caller (AN-8)", () => {
    window.umami = {
      track: () => {
        throw new Error("blocked");
      },
    };
    expect(() => track("graph_mode", { mode: "exponential" })).not.toThrow();
  });

  it("trackOnce sends a given key only once per session (AN-5)", () => {
    trackOnce("input:level", "symbol_input", { field: "level", mode: "arcane" });
    trackOnce("input:level", "symbol_input", { field: "level", mode: "arcane" });
    trackOnce("input:experience", "symbol_input", { field: "experience", mode: "arcane" });
    expect(umamiTrack).toHaveBeenCalledTimes(2);
  });
});

describe("bucketing (AN-4: never send raw values)", () => {
  it.each([
    [NaN, undefined],
    [1, undefined],
    [2, "2-5"],
    [5, "2-5"],
    [6, "6-10"],
    [11, "11-15"],
    [16, "16-20"],
    [20, "16-20"],
  ])("targetBucket(%s) is %s", (level, expected) => {
    expect(targetBucket(level)).toBe(expected);
  });

  it.each([
    ["/", "/"],
    ["/foo", "/foo"],
    ["/foo/bar/baz", "/foo"],
    ["/foo?x=1#y", "/foo"],
    [`/${"a".repeat(80)}`, `/${"a".repeat(49)}`],
  ])("notFoundPath(%s) is %s", (pathname, expected) => {
    expect(notFoundPath(pathname)).toBe(expected);
  });
});

describe("the wrapper is the only way in (AN-8)", () => {
  it("no source file outside src/lib/analytics.ts mentions window.umami", () => {
    const offenders = readdirSync("src", { recursive: true, encoding: "utf8" })
      .map((f) => f.replace(/\\/g, "/"))
      .filter((f) => /\.(ts|tsx)$/.test(f) && !f.endsWith(".test.ts") && !f.endsWith(".test.tsx"))
      .filter((f) => f !== "lib/analytics.ts" && !f.endsWith(".d.ts"))
      .filter((f) => readFileSync(`src/${f}`, "utf8").includes("umami"));
    expect(offenders).toEqual([]);
  });
});
