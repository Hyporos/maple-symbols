import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Tools from "./Tools";
import { useAppStore } from "../../state/store";
import { seedSymbol } from "../../test/helpers";

const countInput = () => screen.getByPlaceholderText("Count");

describe("Tools — Symbol Selector", () => {
  it("is unreachable by keyboard while the symbol has no level", () => {
    render(<Tools />);
    expect(screen.getByRole("button", { name: /Symbol Selector/ })).toHaveAttribute(
      "tabindex",
      "-1"
    );
  });

  it("previews the level/exp after using N symbols and applies it to the store", () => {
    seedSymbol(0, { level: 1, experience: 0, symbolsRemaining: 2679 }); // VJ, arcane
    render(<Tools />);
    expect(screen.getAllByText("1 / 0").length).toBeGreaterThan(0); // "before" (both tool panels show it)
    expect(screen.getAllByText("? / ?").length).toBeGreaterThan(0); // after, no count yet

    fireEvent.change(countInput(), { target: { value: "5" } });
    expect(screen.getByText("1 / 5")).toBeInTheDocument();

    fireEvent.change(countInput(), { target: { value: "30" } }); // 12 + 15 = 27 → level 3 with 3 left
    expect(screen.getByText("3 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(useAppStore.getState().symbols[0]).toMatchObject({ level: 3, experience: 3 });
    expect(countInput()).toHaveValue(null); // count resets
  });

  it("clamps the count: '0' → 1, more than symbolsRemaining → symbolsRemaining", () => {
    seedSymbol(0, { level: 1, experience: 0, symbolsRemaining: 2679 });
    render(<Tools />);
    fireEvent.change(countInput(), { target: { value: "0" } });
    expect(countInput()).toHaveValue(1);
    fireEvent.change(countInput(), { target: { value: "3000" } });
    expect(countInput()).toHaveValue(2679);
  });
});

describe("Tools — Catalyst", () => {
  it("needs level 2 or higher", () => {
    seedSymbol(0, { level: 1, experience: 0 });
    render(<Tools />);
    fireEvent.click(screen.getByRole("button", { name: /Arcane Catalyst/ }));
    expect(screen.getByText("Must be level 2 or higher")).toBeInTheDocument();
  });

  it("arcane keeps 80% of cumulative exp: level 5 → 4 / 13", () => {
    seedSymbol(0, { level: 5, experience: 0 }); // invested 12+15+20+27 = 74; ×0.8 = 59.2 → level 4, 12.2 → ceil 13
    render(<Tools />);
    fireEvent.click(screen.getByRole("button", { name: /Arcane Catalyst/ }));
    expect(screen.getByText("4 / 13")).toBeInTheDocument();
    expect(screen.getByText("-20% EXP upon use")).toBeInTheDocument();
  });

  it("sacred keeps 60%: Cernium level 5 → 4 / 36", () => {
    seedSymbol(6, { level: 5, experience: 0 }); // invested 29+76+141+224 = 470; ×0.6 = 282 → level 4, 36 left
    render(<Tools />);
    fireEvent.click(screen.getByRole("button", { name: /Sacred Catalyst/ }));
    expect(screen.getByText("4 / 36")).toBeInTheDocument();
    expect(screen.getByText("-40% EXP upon use")).toBeInTheDocument();
  });
});
