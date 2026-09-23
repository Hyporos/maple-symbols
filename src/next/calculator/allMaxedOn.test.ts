import { describe, expect, it } from "vitest";
import { allMaxedOn } from "./allMaxedOn";
import { createInitialSymbols } from "../../lib/data";
import { dayjs } from "../../lib/dayjs";
import { WED } from "../../test/helpers";

const NOW = dayjs(WED);
const arcane = () => createInitialSymbols().filter((s) => s.type === "arcane");

describe("allMaxedOn", () => {
  it("is the latest completion day of the family", () => {
    const symbols = arcane().map((s) => ({ ...s, level: 20, experience: 0 }));
    symbols[0] = { ...symbols[0], level: 5, experience: 0, daily: true };
    expect(allMaxedOn(symbols, "arcane", NOW, "gms")).toBe("2027-01-25"); // Overview.test's 131-day case
  });

  it("is null while any symbol of the family cannot be dated", () => {
    expect(allMaxedOn(arcane(), "arcane", NOW, "gms")).toBeNull();
  });

  it("ignores symbols outside the family", () => {
    const symbols = arcane().map((s) => ({ ...s, level: 20, experience: 0 }));
    symbols[0] = { ...symbols[0], level: 5, experience: 0, daily: true };
    const sacred = createInitialSymbols()
      .filter((s) => s.type === "sacred")
      .map((s) => ({ ...s, level: 5, experience: 0 })); // unset quest, would be null if counted
    expect(allMaxedOn([...symbols, ...sacred], "arcane", NOW, "gms")).toBe("2027-01-25");
  });

  it("is null when the family is fully maxed but not truthy-empty (no symbols to date)", () => {
    const symbols = arcane().map((s) => ({ ...s, level: 20, experience: 0 }));
    expect(allMaxedOn(symbols, "arcane", NOW, "gms")).toBeNull();
  });
});
