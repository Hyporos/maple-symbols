import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import GraphCard from "./GraphCard";
import { seedSymbol, WED } from "../../test/helpers";

const targetInput = () => screen.getByRole("spinbutton", { name: "Target Arcane Power" });

describe("GraphCard", () => {
  it("shows the current and target power and the spacing switch", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<GraphCard />);
    // Captions name the power (no "Target" twice: the field has no placeholder of its own).
    expect(screen.getByText("Arcane Power")).toBeInTheDocument();
    expect(screen.getByText("Target Arcane Power")).toBeInTheDocument();
    expect(targetInput().getAttribute("placeholder") ?? "").toBe("");
    expect(screen.getByRole("radiogroup", { name: "X-axis spacing" })).toBeInTheDocument();
  });

  it("disables the target input and shows the empty-target message with nothing enabled", () => {
    render(<GraphCard />);
    expect(targetInput()).toBeDisabled();
    expect(screen.getByText("Enter a target power")).toBeInTheDocument();
  });

  it("answers a target power with its day (frozen Wednesday)", () => {
    vi.setSystemTime(WED);
    seedSymbol(1, { level: 5, experience: 0, daily: true }); // power 70
    render(<GraphCard />);

    fireEvent.change(targetInput(), { target: { value: "60" } });
    expect(screen.getByText("Target must be greater than 70")).toBeInTheDocument();

    fireEvent.change(targetInput(), { target: { value: "80" } }); // level 6, 36 symbols at 20/day
    expect(screen.getByText(/by/)).toHaveTextContent("by 2026-09-18");
  });

  it("sums Grand Sacred power into the Sacred total on the Grand tab", () => {
    seedSymbol(13, { level: 5, experience: 0 }, false); // Tallahart, no daily quest on Grand
    seedSymbol(7, { level: 5, experience: 0, daily: true }, false); // Cernium
    seedSymbol(13, { level: 5, experience: 0 }); // selects Tallahart, mode → grand
    render(<GraphCard />);
    expect(screen.getByText("Sacred Power")).toBeInTheDocument();
    // (5*10) + (5*10) of the whole Sacred family at max: 6 Sacred + 2 Grand, 110 each.
    expect(screen.getByText("100 / 880")).toBeInTheDocument();
  });

  it("offers Dynamic (default) and Linear x-axis modes", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<GraphCard />);
    const group = screen.getByRole("radiogroup", { name: "X-axis spacing" });
    expect(screen.getByRole("radio", { name: "Dynamic" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "Linear" }));
    expect(screen.getByText("70 / 1,320")).toBeInTheDocument(); // still renders after the switch
    expect(group).toBeInTheDocument();
  });

  it("reads the same maximum as the picker: the whole family, set or not", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: true }); // one set symbol of six
    render(<GraphCard />);
    expect(screen.getByText("70 / 1,320")).toBeInTheDocument(); // 6 × 220, grouped like the picker
  });
});
