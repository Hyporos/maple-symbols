import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Overview from "./Overview";
import { seedSymbol, WED } from "../../test/helpers";

// Each row is a <button> (collapsed line) followed by an expander panel; both live in one
// wrapper. Overview renders a desktop and a mobile <img> per row, hence getAllByAltText.
const rowOf = (name: string) =>
  screen.getAllByAltText(name)[0].closest("button")!.parentElement as HTMLElement;

describe("Overview — collapsed rows", () => {
  it("lists the six symbols of the current mode", () => {
    render(<Overview />);
    for (const name of [
      "Vanishing Journey",
      "Chu Chu Island",
      "Lachelein",
      "Arcana",
      "Morass",
      "Esfera",
    ]) {
      expect(screen.getAllByAltText(name).length).toBeGreaterThan(0);
    }
    expect(screen.queryByAltText("Cernium")).not.toBeInTheDocument();
  });

  it("derives the completion date, days and symbols remaining (frozen Wednesday)", () => {
    vi.setSystemTime(WED);
    seedSymbol(1, { level: 5, experience: 0, daily: true }); // 2605 symbols at 20/day
    render(<Overview />);
    const row = within(rowOf("Vanishing Journey"));
    expect(row.getByText("2027-01-25")).toBeInTheDocument();
    expect(row.getByText("131 days")).toBeInTheDocument();
    expect(row.getByText("2605")).toBeInTheDocument();
  });

  it("is fresh for every row, not only the selected symbol (KI-002 resolved)", () => {
    vi.setSystemTime(WED);
    seedSymbol(3, { level: 5, experience: 0, daily: true }, false); // Lachelein, 40/day
    seedSymbol(1, { level: 5, experience: 0, daily: true }); // selects Vanishing Journey
    render(<Overview />);
    const lachelein = within(rowOf("Lachelein"));
    expect(lachelein.getByText("66 days")).toBeInTheDocument(); // 2605 at 40/day
    expect(lachelein.getByText("2605")).toBeInTheDocument();
    expect(lachelein.queryByText("Complete")).not.toBeInTheDocument();
  });

  it("singularises one day", () => {
    vi.setSystemTime(WED);
    seedSymbol(1, { level: 19, experience: 362, daily: true }); // 10 short of the last step
    render(<Overview />);
    expect(within(rowOf("Vanishing Journey")).getByText("1 day")).toBeInTheDocument();
  });

  it("says Complete / Ready for upgrade / 0 once the experience covers max", () => {
    seedSymbol(1, { level: 19, experience: 372, daily: true });
    render(<Overview />);
    const row = within(rowOf("Vanishing Journey"));
    expect(row.getByText("Complete")).toBeInTheDocument();
    expect(row.getByText("Ready for upgrade")).toBeInTheDocument();
    expect(row.getAllByText("0").length).toBeGreaterThan(0);
  });

  it("shows Indefinite / ? days when no quest is enabled", () => {
    seedSymbol(1, { level: 5, experience: 0 });
    render(<Overview />);
    const row = within(rowOf("Vanishing Journey"));
    expect(row.getAllByText("Indefinite").length).toBeGreaterThan(0);
    expect(row.getAllByText("? days").length).toBeGreaterThan(0);
  });

  it("shows MAX for a maxed symbol and 0 for an unset one in the target column", () => {
    seedSymbol(1, { level: 20, experience: 0 });
    render(<Overview />);
    expect(within(rowOf("Vanishing Journey")).getAllByText("MAX").length).toBeGreaterThan(0);
    expect(within(rowOf("Lachelein")).getAllByText("0").length).toBeGreaterThan(0);
  });
});

describe("Overview — target level panel", () => {
  const openRow = (name: string) => {
    const wrapper = rowOf(name);
    fireEvent.click(wrapper.querySelector("button")!);
    return within(wrapper);
  };
  const typeTarget = (row: ReturnType<typeof within>, value: string) =>
    fireEvent.change(row.getByPlaceholderText("Level"), { target: { value } });

  it("computes symbols, days and date for a target level (frozen Wednesday)", () => {
    vi.setSystemTime(WED);
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<Overview />);
    const row = openRow("Vanishing Journey");

    typeTarget(row, "6"); // 36 symbols at 20/day → 2 days → 2026-09-18
    expect(row.getByText("36")).toBeInTheDocument();
    expect(row.getByText("2 days")).toBeInTheDocument();
    expect(row.getByText("2026-09-18")).toBeInTheDocument();

    typeTarget(row, "25"); // clamps to 20: 2605 symbols → 131 days → 2027-01-25
    // At max target the panel agrees with the collapsed row, so each string appears twice.
    expect(row.getAllByText("2605")).toHaveLength(2);
    expect(row.getAllByText("131 days")).toHaveLength(2);
    expect(row.getAllByText("2027-01-25")).toHaveLength(2);
  });

  it("explains a target at or below the current level, and an empty target", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<Overview />);
    const row = openRow("Vanishing Journey");

    typeTarget(row, "3");
    expect(row.getByText("Level must be over 5")).toBeInTheDocument();
    expect(row.getAllByText("Indefinite").length).toBeGreaterThan(0);

    typeTarget(row, "");
    expect(row.getByText("Enter a target level")).toBeInTheDocument();
  });

  it("renders an empty target input, not NaN, until a target is typed (KI-012)", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<Overview />);
    const row = openRow("Vanishing Journey");
    const input = row.getByPlaceholderText("Level");
    expect(input).toHaveAttribute("value", ""); // was the string "NaN", with a React warning

    typeTarget(row, "6");
    expect(input).toHaveValue(6);
    typeTarget(row, ""); // clearing goes back to empty, not NaN
    expect(input).toHaveAttribute("value", "");
  });

  it("shows ? days when no quest is enabled even with a valid target", () => {
    seedSymbol(1, { level: 5, experience: 0 });
    render(<Overview />);
    const row = openRow("Vanishing Journey");
    typeTarget(row, "6");
    expect(row.getByText("36")).toBeInTheDocument();
    expect(row.getAllByText("? days").length).toBeGreaterThan(0);
  });
});
