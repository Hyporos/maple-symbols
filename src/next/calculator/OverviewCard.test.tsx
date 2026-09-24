import { describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import OverviewCard from "./OverviewCard";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { seedSymbol, setViewport, WED } from "../../test/helpers";
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
    // The picker's "–", not a "0" target, and the whole row dimmed (but still selectable).
    expect(within(row).getAllByRole("cell")[1]).toHaveTextContent(/^–$/);
    expect(row).toHaveClass("opacity-40");
    expect(within(row).getByRole("button", { name: "Vanishing Journey" })).toBeEnabled();
  });

  it("names each symbol in plain text, not an accent span that reads as a link", () => {
    render(<OverviewCard />);
    const name = within(screen.getByRole("button", { name: "Chu Chu Island" })).getByText(
      "Chu Chu Island"
    );
    expect(name.tagName).toBe("P");
    expect(name).toHaveClass("text-primary");
  });

  it("puts the target label and field on one line, and shows the results only once a target is entered", () => {
    vi.setSystemTime(WED);
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<OverviewCard />);
    const input = screen.getByRole("spinbutton", { name: "Target Level" });
    expect(input.parentElement).toHaveClass("flex", "items-center");
    expect(screen.getByText("Enter a target level")).toBeInTheDocument();
    expect(screen.queryByText("Days Remaining")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "6" } });
    expect(screen.queryByText("Enter a target level")).not.toBeInTheDocument();
    expect(screen.getByText("Days Remaining").parentElement).toHaveTextContent("2 days");
    expect(screen.getAllByText("Symbols Remaining")).toHaveLength(2); // column header + box
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

  it("shows each symbol by its icon alone below 1150 px, still named for screen readers", () => {
    setViewport("tablet");
    render(
      <BreakpointProvider>
        <OverviewCard />
      </BreakpointProvider>
    );
    const select = screen.getByRole("button", { name: "Chu Chu Island" });
    expect(within(select).getByText("Chu Chu Island")).toHaveClass("sr-only");
  });
});
