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

  it("shows the stored completion date, days and symbols remaining", () => {
    seedSymbol(1, {
      level: 5,
      experience: 0,
      daily: true,
      daysRemaining: 12,
      completion: "2026-09-28",
      symbolsRemaining: 2500,
    });
    render(<Overview />);
    const row = within(rowOf("Vanishing Journey"));
    expect(row.getByText("2026-09-28")).toBeInTheDocument();
    expect(row.getByText("12 days")).toBeInTheDocument();
    expect(row.getByText("2500")).toBeInTheDocument();
  });

  it("singularises one day", () => {
    seedSymbol(1, {
      level: 5,
      experience: 0,
      daily: true,
      daysRemaining: 1,
      completion: "2026-09-17",
    });
    render(<Overview />);
    expect(within(rowOf("Vanishing Journey")).getByText("1 day")).toBeInTheDocument();
  });

  it("maps zeroed derived fields to Complete / Ready for upgrade / 0 (KI-002: what a reload shows)", () => {
    seedSymbol(1, {
      level: 5,
      experience: 0,
      daily: true,
      daysRemaining: 0,
      completion: "",
      symbolsRemaining: 0,
    });
    render(<Overview />);
    const row = within(rowOf("Vanishing Journey"));
    expect(row.getByText("Complete")).toBeInTheDocument();
    expect(row.getByText("Ready for upgrade")).toBeInTheDocument();
    expect(row.getAllByText("0").length).toBeGreaterThan(0);
  });

  it("shows Indefinite / ? days when no quest is enabled", () => {
    seedSymbol(1, { level: 5, experience: 0, daysRemaining: 12, completion: "2026-09-28" });
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

    typeTarget(row, "6"); // 36 symbols at 10/day → 4 days → 2026-09-20
    expect(row.getByText("36")).toBeInTheDocument();
    expect(row.getByText("4 days")).toBeInTheDocument();
    expect(row.getByText("2026-09-20")).toBeInTheDocument();

    typeTarget(row, "25"); // clamps to 20: 2605 symbols → 261 days → 2027-06-04
    expect(row.getByText("2605")).toBeInTheDocument();
    expect(row.getByText("261 days")).toBeInTheDocument();
    expect(row.getByText("2027-06-04")).toBeInTheDocument();
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

  it("shows ? days when no quest is enabled even with a valid target", () => {
    seedSymbol(1, { level: 5, experience: 0 });
    render(<Overview />);
    const row = openRow("Vanishing Journey");
    typeTarget(row, "6");
    expect(row.getByText("36")).toBeInTheDocument();
    expect(row.getAllByText("? days").length).toBeGreaterThan(0);
  });
});
