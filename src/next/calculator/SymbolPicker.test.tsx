import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SymbolPicker from "./SymbolPicker";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { useAppStore } from "../../state/store";
import { seedSymbol, setViewport } from "../../test/helpers";

// The symbol chips (the family switch's radios are not buttons with aria-pressed).
const chips = () => screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-pressed"));

const renderPicker = () =>
  render(
    <BreakpointProvider>
      <SymbolPicker />
    </BreakpointProvider>
  );

describe("SymbolPicker", () => {
  it("switches families, lists that family's symbols as chips with rings, and shows the power total", () => {
    seedSymbol(1, { level: 12 });
    renderPicker();
    expect(screen.getByRole("radiogroup", { name: "Symbol family" })).toBeInTheDocument();
    expect(chips()).toHaveLength(6);
    expect(
      screen.getByRole("img", { name: "Vanishing Journey, level 12 of 20" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Arcane Power/)).toHaveTextContent("Arcane Power: 140 / 1,320");
    fireEvent.click(screen.getByRole("radio", { name: "Grand" }));
    expect(chips()).toHaveLength(2);
    expect(useAppStore.getState().selectedId).toBe(13);
  });

  it("counts Grand Sacred toward Sacred Power on the Sacred and Grand tabs", () => {
    seedSymbol(7, { level: 3 }, false); // Cernium: 30
    seedSymbol(13, { level: 2 }); // Tallahart: 20, selected (Grand tab)
    renderPicker();
    // Six Sacred and two Grand symbols at 110 each: 880.
    expect(screen.getByText(/Sacred Power/)).toHaveTextContent("Sacred Power: 50 / 880");
    fireEvent.click(screen.getByRole("radio", { name: "Sacred" }));
    expect(chips()).toHaveLength(6);
    expect(screen.getByText(/Sacred Power/)).toHaveTextContent("Sacred Power: 50 / 880");
  });

  it("marks the selected chip and selects on click", () => {
    renderPicker();
    fireEvent.click(screen.getByRole("button", { name: /Chu Chu Island/ }));
    expect(useAppStore.getState().selectedId).toBe(2);
    expect(screen.getByRole("button", { name: /Chu Chu Island/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: /Vanishing Journey/ })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("restores a family's last selection after visiting another family", () => {
    renderPicker();
    fireEvent.click(screen.getByRole("button", { name: /Chu Chu Island/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Grand" }));
    expect(useAppStore.getState().selectedId).toBe(13);
    fireEvent.click(screen.getByRole("radio", { name: "Arcane" }));
    expect(useAppStore.getState().selectedId).toBe(2);
    expect(screen.getByRole("button", { name: /Chu Chu Island/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("shows an unset symbol with an empty ring and a dash", () => {
    renderPicker();
    expect(screen.getByRole("img", { name: "Esfera" })).toHaveAttribute("data-fraction", "0");
    // Named by the symbol and described as not set, never "level 0 of 20".
    expect(screen.getByRole("button", { name: "Esfera" })).toHaveAccessibleDescription("Not set");
    expect(screen.queryByRole("button", { name: /level 0/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("–")).toHaveLength(6);
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it("shows MAX under a maxed symbol and a full ring", () => {
    seedSymbol(1, { level: 20 });
    renderPicker();
    expect(screen.getByText("MAX")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Vanishing Journey, level 20 of 20/ })).toHaveAttribute(
      "data-fraction",
      "1"
    );
  });

  it("switches family from the keyboard, and each chip is one button with nothing inside it to focus", () => {
    setViewport("mobile");
    renderPicker();
    const arcane = screen.getByRole("radio", { name: "Arcane" });
    arcane.focus();
    fireEvent.keyDown(arcane, { key: "ArrowRight" });
    expect(useAppStore.getState().mode).toBe("sacred");
    expect(screen.getByRole("radio", { name: "Sacred" })).toHaveFocus();
    for (const chip of chips()) {
      expect(chip.querySelector("button, input, a, [tabindex]")).toBeNull();
    }
  });
});
