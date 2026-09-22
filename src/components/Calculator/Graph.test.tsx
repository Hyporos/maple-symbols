import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Graph from "./Graph";
import { seedSymbol, WED } from "../../test/helpers";

// The chart itself measures 0×0 in jsdom (no paths, ticks or chart tooltip render); these
// tests cover the power summary and target-power logic around it.
const targetInput = () => screen.getByPlaceholderText("Target");

describe("Graph", () => {
  it("with nothing enabled shows 0 / 0 and disables the target input", () => {
    render(<Graph />);
    expect(screen.getByText("0 / 0")).toBeInTheDocument();
    expect(targetInput()).toHaveAttribute("tabindex", "-1");
    expect(screen.getByText("Enter a target power")).toBeInTheDocument();
  });

  it("shows current power over the max for the enabled symbols (arcane: level*10+20 of 220)", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<Graph />);
    expect(screen.getByText("70 / 220")).toBeInTheDocument();
    expect(screen.getByText("Arcane Power")).toBeInTheDocument();
  });

  it("sacred power is level*10 of 110 per symbol", () => {
    seedSymbol(7, { level: 5, experience: 0, daily: true });
    render(<Graph />);
    expect(screen.getByText("50 / 110")).toBeInTheDocument();
    expect(screen.getByText("Sacred Power")).toBeInTheDocument();
  });

  it("validates the target power and reports the attainment date (frozen Wednesday)", () => {
    vi.setSystemTime(WED);
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<Graph />);

    fireEvent.change(targetInput(), { target: { value: "60" } });
    expect(screen.getByText("Target must be greater than 70")).toBeInTheDocument();

    fireEvent.change(targetInput(), { target: { value: "80" } }); // level 6 = +10 power, 36 symbols at 20/day
    expect(screen.getByText("2026-09-18")).toBeInTheDocument();

    fireEvent.change(targetInput(), { target: { value: "9999" } }); // clamps to max reachable power (220)
    expect(targetInput()).toHaveValue(220);
  });

  it("offers Dynamic (default) and Linear x-axis modes", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<Graph />);
    expect(screen.getByText("Dynamic")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Linear"));
    expect(screen.getByText("70 / 220")).toBeInTheDocument(); // still renders after the switch
  });

  it("the x-axis choice is a named radio group; the radios, not their tooltip triggers, take focus (KI-011)", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<Graph />);
    const group = screen.getByRole("radiogroup", { name: "X-axis spacing" });
    const dynamic = within(group).getByRole("radio", { name: "Dynamic" });
    const linear = within(group).getByRole("radio", { name: "Linear" });
    expect(within(group).queryAllByRole("button")).toHaveLength(0);
    expect(dynamic).toHaveAttribute("aria-checked", "true");

    fireEvent.keyDown(dynamic, { key: "ArrowRight" });
    expect(linear).toHaveFocus();
    expect(linear).toHaveAttribute("aria-checked", "true");
    expect(dynamic).toHaveAttribute("tabindex", "-1");
  });
});
