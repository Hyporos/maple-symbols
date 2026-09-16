import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Calculator from "./Calculator";
import { useAppStore } from "../../state/store";
import { seedSymbol } from "../../test/helpers";

const levelInput = () => screen.getByPlaceholderText("Level");
const expInput = () => screen.getByPlaceholderText(/^Exp/); // "Experience" (locked) or "Exp" (unlocked)
const vj = () => useAppStore.getState().symbols[0];

describe("Calculator", () => {
  it("shows DISABLED until a level is entered", () => {
    render(<Calculator />);
    expect(screen.getByText("DISABLED")).toBeInTheDocument();
  });

  it("clamps the level input: '0' → 1, ≥ 20 → 20 with exp reset, negative → unset", () => {
    render(<Calculator />);

    fireEvent.change(levelInput(), { target: { value: "0" } });
    expect(vj().level).toBe(1);

    fireEvent.change(levelInput(), { target: { value: "25" } });
    expect(vj()).toMatchObject({ level: 20, experience: 0 });
    expect(screen.getByText("MAX LEVEL")).toBeInTheDocument();

    fireEvent.change(levelInput(), { target: { value: "-3" } });
    expect(vj().level).toBeNaN();
    expect(screen.getByText("DISABLED")).toBeInTheDocument();
  });

  it("caps experience at the next-level requirement while locked and reports readiness", () => {
    seedSymbol(0, { level: 1, experience: 0 });
    render(<Calculator />);

    fireEvent.change(expInput(), { target: { value: "50" } });

    expect(vj().experience).toBe(12); // arcane table: level 1 → 2 needs 12
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("Sufficient")).toBeInTheDocument();
  });

  it("reflects daily / extra / weekly toggles in the quoted rates", () => {
    seedSymbol(0, { level: 1, experience: 0 });
    render(<Calculator />);
    expect(screen.getByText("0 symbols / day")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Daily"));
    expect(screen.getByText("10 symbols / day")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Extra"));
    expect(screen.getByText("20 symbols / day")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Weekly"));
    expect(screen.getByText("120 symbols / week")).toBeInTheDocument();
  });
});
