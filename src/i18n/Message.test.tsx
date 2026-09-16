import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import Message, { splitAccents } from "./Message";
import { interpolate, pluralMessage } from "./interpolate";

describe("splitAccents", () => {
  it("splits a sentence into plain and accent runs, in order", () => {
    expect(splitAccents("<b>Ready</b> for upgrade")).toEqual([
      { text: "Ready", accent: true },
      { text: " for upgrade", accent: false },
    ]);
    expect(splitAccents("Level <b>{level}</b>")).toEqual([
      { text: "Level ", accent: false },
      { text: "{level}", accent: true },
    ]);
  });

  it("returns one plain run for a message with no markup", () => {
    expect(splitAccents("Daily")).toEqual([{ text: "Daily", accent: false }]);
  });

  it("rejects any markup other than a flat <b>", () => {
    expect(() => splitAccents("line one<br>line two")).toThrow(/only <b>/);
    expect(() => splitAccents("<b>open")).toThrow(/only <b>/);
    expect(() => splitAccents("<b><i>nested</i></b>")).toThrow(/only <b>/);
  });
});

describe("interpolate", () => {
  it("fills placeholders and groups numbers for the locale", () => {
    expect(interpolate("{count} symbols / day", { count: 20 })).toBe("20 symbols / day");
    expect(interpolate("{mesos} mesos", { mesos: 1234567 })).toBe("1,234,567 mesos");
    expect(interpolate("{year}", { year: "2026" })).toBe("2026");
  });

  it("throws when a message names a value the caller did not pass", () => {
    expect(() => interpolate("{count} days", {})).toThrow(/no value for \{count\}/);
  });

  it("picks the plural form with Intl.PluralRules", () => {
    const days = { one: "{count} day", other: "{count} days" };
    expect(pluralMessage(days, 1)).toBe("{count} day");
    expect(pluralMessage(days, 0)).toBe("{count} days");
    expect(pluralMessage(days, 1, "ko")).toBe("{count} days");
  });
});

describe("<Message>", () => {
  it("renders <b> runs as the accent span and fills values inside them", () => {
    const { container } = render(
      <p>
        <Message text="<b>{count}</b> symbols remaining" values={{ count: 1500 }} />
      </p>
    );
    expect(container.textContent).toBe("1,500 symbols remaining");
    expect(container.querySelector("span")?.textContent).toBe("1,500");
  });

  it("chooses the plural form from count and exposes it as {count}", () => {
    const text = { one: "<b>{count}</b> day to go", other: "<b>{count}</b> days to go" };
    expect(render(<Message text={text} count={1} />).container.textContent).toBe("1 day to go");
    expect(render(<Message text={text} count={3} />).container.textContent).toBe("3 days to go");
  });
});
