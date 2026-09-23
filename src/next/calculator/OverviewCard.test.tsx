import { describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import OverviewCard from "./OverviewCard";
import { seedSymbol, WED } from "../../test/helpers";
import { useAppStore } from "../../state/store";

describe("OverviewCard", () => {
  it("lists the family's symbols with target, done-by date, symbols left and a bar each", () => {
    vi.setSystemTime(WED);
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<OverviewCard />);
    expect(screen.getByRole("table", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Vanishing Journey/ })).toHaveTextContent("2027-01-25");
    expect(screen.getByRole("progressbar", { name: /Vanishing Journey/ })).toBeInTheDocument();
  });

  it("highlights the selected symbol's row and selects a symbol from its row", () => {
    render(<OverviewCard />);
    fireEvent.click(screen.getByRole("button", { name: "Chu Chu Island" }));
    expect(useAppStore.getState().selectedId).toBe(2);
    expect(screen.getByRole("row", { name: /Chu Chu Island/ })).toHaveAttribute(
      "aria-current",
      "true"
    );
  });

  it("closes with the all-maxed line once every symbol can be dated, and asks for input before", () => {
    vi.setSystemTime(WED);
    render(<OverviewCard />);
    expect(screen.getByText(/Enter each symbol's level and quests/)).toBeInTheDocument();
    cleanup();

    for (const id of [2, 3, 4, 5, 6]) seedSymbol(id, { level: 20, experience: 0 }, false);
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<OverviewCard />);
    expect(screen.getByText(/All maxed on/)).toHaveTextContent("All maxed on 2027-01-25");
  });

  it("keeps the custom target level box for the selected symbol (the Overview.test.tsx case)", () => {
    vi.setSystemTime(WED);
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<OverviewCard />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Target Level" }), {
      target: { value: "6" },
    });
    expect(screen.getByText("2026-09-18")).toBeInTheDocument(); // 36 symbols at 20/day → 2 days
  });

  it("resets the target level box when the selection changes", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<OverviewCard />);
    const input = screen.getByRole("spinbutton", { name: "Target Level" });
    fireEvent.change(input, { target: { value: "6" } });
    expect(input).toHaveValue(6);

    fireEvent.click(screen.getByRole("button", { name: "Chu Chu Island" }));
    expect(screen.getByRole("spinbutton", { name: "Target Level" })).toHaveAttribute("value", "");
  });

  it("greys out and blanks the row for an unset symbol", () => {
    render(<OverviewCard />);
    const row = screen.getByRole("row", { name: /Vanishing Journey/ });
    expect(row).toHaveTextContent("0"); // target column for an unset symbol
  });

  it("says Complete once every symbol of the family is already maxed", () => {
    for (const id of [1, 2, 3, 4, 5, 6]) seedSymbol(id, { level: 20, experience: 0 }, false);
    render(<OverviewCard />);
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.queryByText(/All maxed on/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Enter each symbol's level and quests/)).not.toBeInTheDocument();
  });

  it("lists only the Grand symbols when a Grand symbol is selected", () => {
    seedSymbol(13, { level: 5, experience: 0 }); // Tallahart, mode → grand
    render(<OverviewCard />);
    expect(screen.getByRole("row", { name: /Tallahart/ })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Geardock/ })).toBeInTheDocument();
    expect(screen.queryByText("Cernium")).not.toBeInTheDocument();
  });
});
