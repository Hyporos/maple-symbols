import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Selector from "./Selector";
import { useAppStore } from "../state/store";

// Images are pointer-events-none in production CSS; click the wrapping button as a user would.
const symbolButton = (name: string) => screen.getByAltText(name).closest("button")!;

describe("Selector", () => {
  it("lists the six arcane symbols by default, all at Lv. 0", () => {
    render(<Selector />);
    expect(screen.getByAltText("Vanishing Journey")).toBeInTheDocument();
    expect(screen.queryByAltText("Cernium")).not.toBeInTheDocument();
    expect(screen.getAllByText("Lv. 0")).toHaveLength(6);
  });

  it("swapping to Sacred lists sacred symbols and selects index 6 (Cernium)", () => {
    render(<Selector />);
    fireEvent.click(screen.getByText("Sacred"));

    expect(screen.getByAltText("Cernium")).toBeInTheDocument();
    expect(screen.queryByAltText("Vanishing Journey")).not.toBeInTheDocument();
    expect(useAppStore.getState().swapped).toBe(true);
    expect(useAppStore.getState().selectedSymbol).toBe(6);
  });

  it("remembers the selected symbol per type across swaps", () => {
    render(<Selector />);
    fireEvent.click(symbolButton("Lachelein"));
    expect(useAppStore.getState().selectedSymbol).toBe(2);

    fireEvent.click(screen.getByText("Sacred"));
    fireEvent.click(symbolButton("Odium"));
    expect(useAppStore.getState().selectedSymbol).toBe(8);

    fireEvent.click(screen.getByText("Arcane"));
    expect(useAppStore.getState().selectedSymbol).toBe(2);
  });
});
