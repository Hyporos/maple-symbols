import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CalculatorCard from "./CalculatorCard";
import SymbolPicker from "./SymbolPicker";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { useAppStore } from "../../state/store";
import { fullText, seedSymbol, setViewport, type Viewport } from "../../test/helpers";

const renderCard = (viewport: Viewport = "desktop") => {
  setViewport(viewport);
  return render(
    <BreakpointProvider>
      <CalculatorCard />
    </BreakpointProvider>
  );
};

const openTool = (name: RegExp) => {
  const opener = screen.getByRole("button", { name });
  opener.focus();
  fireEvent.click(opener);
  return opener;
};

describe("ToolsSheet", () => {
  it("previews and applies Symbol Selector coupons (the Tools.test.tsx case)", () => {
    seedSymbol(1, { level: 1, experience: 0 });
    renderCard();
    openTool(/Symbol Selector/);
    expect(screen.getByRole("dialog", { name: "Symbol Selector" })).toBeInTheDocument();
    expect(screen.getByText("1 / 0")).toBeInTheDocument(); // before
    expect(screen.getByText("? / ?")).toBeInTheDocument(); // after, no count yet
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    fireEvent.change(screen.getByRole("spinbutton", { name: "Count" }), {
      target: { value: "30" },
    });
    expect(screen.getByText("3 / 3")).toBeInTheDocument(); // 12 + 15 = 27 → level 3 with 3 left
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(useAppStore.getState().symbols[0]).toMatchObject({ level: 3, experience: 3 });
    expect(screen.getByRole("spinbutton", { name: "Count" })).toHaveValue(null); // count resets
  });

  it("clamps the count to the symbols left to max", () => {
    seedSymbol(1, { level: 1, experience: 0 });
    renderCard();
    openTool(/Symbol Selector/);
    const count = screen.getByRole("spinbutton", { name: "Count" });
    fireEvent.change(count, { target: { value: "0" } });
    expect(count).toHaveValue(1);
    fireEvent.change(count, { target: { value: "3000" } });
    expect(count).toHaveValue(2679);
  });

  it("disables the Selector while unlocked experience overflows, and says why", () => {
    seedSymbol(1, { level: 1, experience: 30, locked: false });
    renderCard();
    openTool(/Symbol Selector/);
    expect(
      screen.getByText(fullText("This feature is disabled while experience is unlocked"))
    ).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Count" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it("previews the Catalyst's kept level", () => {
    seedSymbol(1, { level: 5, experience: 0 });
    renderCard();
    openTool(/Arcane Catalyst/);
    expect(screen.getByRole("dialog", { name: "Arcane Catalyst" })).toBeInTheDocument();
    expect(screen.getByText("4 / 13")).toBeInTheDocument(); // 74 invested × 0.8 = 59.2 → level 4, 13 exp
    expect(screen.getByText("-20% EXP upon use")).toBeInTheDocument();
    // GMS limits the Catalyst to its regular worlds.
    expect(screen.getByText("[Regular Server Only]")).toBeInTheDocument();
  });

  it("says a level 1 symbol cannot use the Catalyst", () => {
    seedSymbol(7, { level: 1, experience: 0 });
    renderCard();
    openTool(/Sacred Catalyst/);
    expect(screen.getByText("Must be level 2 or higher")).toBeInTheDocument();
  });

  it("closes with Escape and returns focus to its button", () => {
    seedSymbol(1, { level: 5, experience: 0 });
    renderCard();
    const opener = openTool(/Arcane Catalyst/);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
  });

  it("opens as a bottom sheet on phones and closes from its close button", () => {
    seedSymbol(1, { level: 5, experience: 0 });
    renderCard("mobile");
    const opener = openTool(/Symbol Selector/);
    expect(screen.getByRole("dialog", { name: "Symbol Selector" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
  });
});

// The desktop popover is not modal, so the picker stays usable while a tool is open.
describe("ToolsSheet, when the selection changes under it", () => {
  const renderPickerAndCard = () => {
    setViewport("desktop");
    return render(
      <BreakpointProvider>
        <SymbolPicker />
        <CalculatorCard />
      </BreakpointProvider>
    );
  };

  it("closes the Selector opened on Tallahart when Geardock (which has none) is selected", () => {
    seedSymbol(14, { level: 3, experience: 0 }, false);
    seedSymbol(13, { level: 3, experience: 0 });
    renderPickerAndCard();
    openTool(/Symbol Selector/);
    expect(screen.getByRole("dialog", { name: "Symbol Selector" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Geardock/ }));
    expect(useAppStore.getState().selectedId).toBe(14);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the Catalyst opened on an Arcane symbol when the family switches to Grand", () => {
    seedSymbol(1, { level: 5, experience: 0 });
    renderPickerAndCard();
    openTool(/Arcane Catalyst/);
    expect(screen.getByRole("dialog", { name: "Arcane Catalyst" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Grand" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on a new symbol even when that symbol has the same tool", () => {
    seedSymbol(2, { level: 5, experience: 0 }, false);
    seedSymbol(1, { level: 5, experience: 0 });
    renderPickerAndCard();
    openTool(/Symbol Selector/);
    fireEvent.click(screen.getByRole("button", { name: /Chu Chu Island/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
