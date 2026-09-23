import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CalculatorCard from "./CalculatorCard";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { useAppStore } from "../../state/store";
import { seedSymbol, setViewport } from "../../test/helpers";

const renderCard = () => {
  setViewport("desktop");
  return render(
    <BreakpointProvider>
      <CalculatorCard />
    </BreakpointProvider>
  );
};

const vj = () => useAppStore.getState().symbols.find((s) => s.id === 1)!;

describe("CalculatorCard", () => {
  it("names the symbol and edits level and experience with the experience bar", () => {
    seedSymbol(1, { level: 12, experience: 40 });
    renderCard();
    expect(
      screen.getByRole("heading", { level: 2, name: "Vanishing Journey" })
    ).toBeInTheDocument();
    fireEvent.change(screen.getByRole("spinbutton", { name: "Level" }), {
      target: { value: "13" },
    });
    expect(useAppStore.getState().symbols[0].level).toBe(13);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Experience" }), {
      target: { value: "50" },
    });
    expect(vj().experience).toBe(50);
    expect(screen.getByRole("progressbar", { name: /Experience/ })).toHaveAttribute(
      "aria-valuenow",
      "50"
    );
  });

  it("shows the next level's requirement beside the experience", () => {
    seedSymbol(1, { level: 1, experience: 0 });
    renderCard();
    expect(screen.getByText("/ 12 exp")).toBeInTheDocument();
  });

  it("has one switch per quest the symbol has, with its rate", () => {
    seedSymbol(1, { level: 12, experience: 40, daily: true });
    renderCard();
    expect(screen.getByRole("switch", { name: "Daily" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("20 / day")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Weekly" })).toBeInTheDocument();
    expect(screen.getByText("240 / week")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Extra (Reverse City)" })).toBeInTheDocument();
    expect(screen.getByText("×2")).toBeInTheDocument();
  });

  it("toggles quests from their switches, and the day's rate follows the extra", () => {
    seedSymbol(1, { level: 12, experience: 40, daily: true, extra: false });
    renderCard();
    fireEvent.click(screen.getByRole("switch", { name: /Extra/ }));
    expect(vj().extra).toBe(true);
    expect(screen.getByRole("switch", { name: /Extra/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("40 / day")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Weekly" }));
    expect(vj().weekly).toBe(true);
  });

  it("describes each quest switch with the quest's in-game name, for keyboard users", () => {
    seedSymbol(1, { level: 12, experience: 40 });
    renderCard();
    expect(screen.getByRole("switch", { name: "Daily" })).toHaveAccessibleDescription(
      "[Daily Quest] Vanishing Journey Research"
    );
    expect(screen.getByRole("switch", { name: "Weekly" })).toHaveAccessibleDescription(
      "[Weekly Quest] Erda Spectrum"
    );
    expect(screen.getByRole("switch", { name: /Extra/ })).toHaveAccessibleDescription(
      "[Unlocked] Reverse City"
    );
  });

  it("puts every quest switch in the tab order and inside no other button", () => {
    seedSymbol(1, { level: 12, experience: 40 });
    renderCard();
    const switches = screen.getAllByRole("switch");
    expect(switches).toHaveLength(3);
    for (const control of switches) {
      expect(control.tagName).toBe("BUTTON");
      expect(control).not.toHaveAttribute("tabindex", "-1");
      expect(control.parentElement?.closest("button")).toBeNull();
    }
  });

  it("gives a Grand Sacred symbol no weekly, extra, main stat or Catalyst", () => {
    seedSymbol(14, { level: 3, experience: 0, daily: true });
    renderCard();
    expect(screen.getByRole("switch", { name: "Daily" })).toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: "Weekly" })).not.toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: /Extra/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Main stat")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Catalyst/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Selector/ })).not.toBeInTheDocument(); // Geardock
  });

  it("offers the Symbol Selector on Tallahart, but still no Catalyst", () => {
    seedSymbol(13, { level: 3, experience: 0, daily: true });
    renderCard();
    expect(screen.getByRole("button", { name: /Symbol Selector/ })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /Catalyst/ })).not.toBeInTheDocument();
  });

  it("shows the unset state for a symbol with no level: blank fields, no NaN, tools disabled", () => {
    seedSymbol(1, { level: NaN, experience: NaN });
    renderCard();
    expect(screen.getByText("DISABLED")).toBeInTheDocument();
    expect(screen.getByText("enter a level to enable this symbol")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Level" })).toHaveValue(null);
    expect(screen.getByRole("spinbutton", { name: "Experience" })).toHaveValue(null);
    expect(document.body.textContent).not.toMatch(/NaN/);
    expect(screen.queryByText("Next level")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Symbol Selector/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Arcane Catalyst/ })).toBeDisabled();
  });

  it("shows the next level's day count, cost and main stat", () => {
    seedSymbol(1, { level: 12, experience: 40, daily: true });
    renderCard();
    expect(screen.getByText(/In \d+ days?/)).toBeInTheDocument();
    expect(screen.getByText("Cost")).toBeInTheDocument();
    expect(screen.getByText("14,260,000")).toBeInTheDocument(); // mesosRequired[12]
    expect(screen.getByText("Main stat")).toBeInTheDocument();
    expect(screen.getByText("+100")).toBeInTheDocument();
  });

  it("says ready now once the experience covers the next level, and not set without quests", () => {
    seedSymbol(1, { level: 1, experience: 12 });
    const { unmount } = renderCard();
    expect(screen.getByText("Ready now")).toBeInTheDocument();
    unmount();
    seedSymbol(1, { level: 1, experience: 5, daily: false, weekly: false });
    renderCard();
    expect(screen.getByText("Not set")).toBeInTheDocument();
  });

  it("shows MAX LEVEL at max, with no next level", () => {
    seedSymbol(1, { level: 20, experience: 0 });
    renderCard();
    expect(screen.getByText("MAX LEVEL")).toBeInTheDocument();
    expect(screen.queryByText("Next level")).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it("unlocks the cap when ready, applies the overflow as levels, and relocks", () => {
    seedSymbol(1, { level: 1, experience: 12 });
    renderCard();
    expect(screen.queryByRole("button", { name: "Lock experience cap" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Apply overflow experience" })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Unlock experience cap" }));
    expect(vj().locked).toBe(false);
    expect(screen.getByRole("button", { name: "Lock experience cap" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply overflow experience" })).toBeDisabled();
    fireEvent.change(screen.getByRole("spinbutton", { name: "Experience" }), {
      target: { value: "30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply overflow experience" }));
    expect(vj()).toMatchObject({ level: 3, experience: 3, locked: true });
  });

  it("hides the cap controls while there is nothing to unlock", () => {
    seedSymbol(1, { level: 5, experience: 3 });
    renderCard();
    expect(screen.queryByRole("button", { name: /experience cap/ })).not.toBeInTheDocument();
  });
});
