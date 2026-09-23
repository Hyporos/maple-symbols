import { describe, expect, it } from "vitest";
import { EDITIONS } from "../lib/routes";
import { nextHref, splitNext } from "./routing";

const kms = EDITIONS.find((e) => e.region === "kms")!;
const gms = EDITIONS[0];

describe("/next routing (spec §1)", () => {
  it("recognises a /next segment after the edition prefix and returns the page inside it", () => {
    expect(splitNext("/next")).toEqual({ next: true, rest: "/" });
    expect(splitNext("/next/handbook")).toEqual({ next: true, rest: "/handbook" });
    expect(splitNext("/handbook")).toEqual({ next: false, rest: "/handbook" });
    expect(splitNext("/nextx")).toEqual({ next: false, rest: "/nextx" });
  });

  it("builds /next links inside an edition", () => {
    expect(nextHref("/", gms)).toBe("/next");
    expect(nextHref("/handbook", gms)).toBe("/next/handbook");
    expect(nextHref("/", kms)).toBe("/kms/next");
    expect(nextHref("/credits", kms)).toBe("/kms/next/credits");
  });
});
