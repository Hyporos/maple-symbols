import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
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

  it("switching to Sacred lists sacred symbols and selects Cernium (id 7)", () => {
    render(<Selector />);
    fireEvent.click(screen.getByText("Sacred"));

    expect(screen.getByAltText("Cernium")).toBeInTheDocument();
    expect(screen.queryByAltText("Vanishing Journey")).not.toBeInTheDocument();
    expect(useAppStore.getState().mode).toBe("sacred");
    expect(useAppStore.getState().selectedId).toBe(7);
  });

  it("remembers the selected symbol per type across mode switches", () => {
    render(<Selector />);
    fireEvent.click(symbolButton("Lachelein"));
    expect(useAppStore.getState().selectedId).toBe(3);

    fireEvent.click(screen.getByText("Sacred"));
    fireEvent.click(symbolButton("Odium"));
    expect(useAppStore.getState().selectedId).toBe(9);

    fireEvent.click(screen.getByText("Arcane"));
    expect(useAppStore.getState().selectedId).toBe(3);
  });

  it("the type toggle is a named radio group operable from the keyboard (KI-011)", () => {
    render(<Selector />);
    const group = screen.getByRole("radiogroup", { name: "Symbol type" });
    const arcane = within(group).getByRole("radio", { name: "Arcane" });
    const sacred = within(group).getByRole("radio", { name: "Sacred" });
    expect(arcane).toHaveAttribute("aria-checked", "true");
    expect(arcane).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(arcane, { key: "ArrowDown" });
    expect(useAppStore.getState().mode).toBe("sacred");
    expect(sacred).toHaveFocus();
    expect(sacred).toHaveAttribute("aria-checked", "true");
    expect(arcane).toHaveAttribute("tabindex", "-1");
  });
});
