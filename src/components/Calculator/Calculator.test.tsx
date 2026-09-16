import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import Calculator from "./Calculator";
import { useAppStore } from "../../state/store";
import { fullText, seedSymbol, WED } from "../../test/helpers";

const levelInput = () => screen.getByPlaceholderText("Level");
const expInput = () => screen.getByPlaceholderText(/^Exp/); // "Experience" (locked) or "Exp" (unlocked)
const vj = () => useAppStore.getState().symbols[0];

describe("Calculator — level and experience inputs", () => {
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

  it("sacred symbols cap at level 11", () => {
    seedSymbol(7, { level: 1, experience: 0 });
    render(<Calculator />);
    fireEvent.change(levelInput(), { target: { value: "15" } });
    expect(useAppStore.getState().symbols[6]).toMatchObject({ id: 7, level: 11, experience: 0 });
  });

  it("caps experience at the next-level requirement while locked and reports readiness", () => {
    seedSymbol(1, { level: 1, experience: 0 });
    render(<Calculator />);

    fireEvent.change(expInput(), { target: { value: "50" } });

    expect(vj().experience).toBe(12); // arcane table: level 1 → 2 needs 12
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("Sufficient")).toBeInTheDocument();
  });

  it("unlocking the cap allows experience up to the whole table (2679), and it can be re-locked", () => {
    seedSymbol(1, { level: 1, experience: 12 });
    render(<Calculator />);

    fireEvent.click(screen.getByLabelText("Unlock experience cap"));
    expect(vj().locked).toBe(false);

    fireEvent.change(expInput(), { target: { value: "50" } });
    expect(vj().experience).toBe(50);
    fireEvent.change(expInput(), { target: { value: "3000" } });
    expect(vj().experience).toBe(2679);

    fireEvent.click(screen.getByLabelText("Lock experience cap"));
    expect(vj()).toMatchObject({ locked: true, experience: 12 }); // re-locking clamps back to the cap
  });

  it("the check icon converts unlocked overflow into levels and re-locks", () => {
    seedSymbol(1, { level: 1, experience: 50, locked: false });
    render(<Calculator />);
    fireEvent.click(screen.getByLabelText("Apply overflow experience"));
    expect(vj()).toMatchObject({ level: 4, experience: 3, locked: true }); // 12+15+20 = 47
  });

  it("applying overflow that reaches max keeps the leftover experience (KI-005, current behaviour)", () => {
    seedSymbol(1, { level: 19, experience: 2679, locked: false });
    render(<Calculator />);
    fireEvent.click(screen.getByLabelText("Apply overflow experience"));
    expect(vj()).toMatchObject({ level: 20, experience: 2307, locked: true });
  });

  it("at max level with the cap locked, any experience is accepted (KI-004, current behaviour)", () => {
    seedSymbol(1, { level: 20, experience: 0 });
    render(<Calculator />);
    fireEvent.change(expInput(), { target: { value: "999" } });
    expect(vj().experience).toBe(999);
  });

  it("re-locks automatically at max level with 0 exp", () => {
    seedSymbol(1, { level: 20, experience: 0, locked: false });
    render(<Calculator />);
    expect(vj().locked).toBe(true);
  });
});

describe("Calculator — quests and the next-level panel", () => {
  it("reflects daily / extra / weekly toggles in the quoted rates", () => {
    seedSymbol(1, { level: 1, experience: 0 });
    render(<Calculator />);
    expect(screen.getByText("0 symbols / day")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Daily"));
    expect(screen.getByText("10 symbols / day")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Extra"));
    expect(screen.getByText("20 symbols / day")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Weekly"));
    expect(screen.getByText("120 symbols / week")).toBeInTheDocument();
  });

  it("sacred symbols have no weekly rate line", () => {
    seedSymbol(7, { level: 1, experience: 0 });
    render(<Calculator />);
    expect(screen.queryByText(/symbols \/ week/)).not.toBeInTheDocument();
  });

  it("explains what is missing: experience, then quests", () => {
    seedSymbol(1, { level: 1, experience: NaN });
    render(<Calculator />);
    expect(screen.getByText("Experience")).toBeInTheDocument(); // "<span>Experience</span> is not set"
    expect(screen.getByText("Unknown")).toBeInTheDocument(); // "Unknown symbols remaining"

    fireEvent.change(expInput(), { target: { value: "5" } });
    expect(screen.getByText("Quests")).toBeInTheDocument(); // "<span>Quests</span> are not set"
    expect(screen.getByText("7")).toBeInTheDocument(); // 12 - 5 symbols remaining
  });

  it("counts days to the next level from the daily rate (frozen Wednesday)", () => {
    vi.setSystemTime(WED);
    seedSymbol(1, { level: 1, experience: 0, daily: true });
    render(<Calculator />);
    expect(screen.getByText(fullText("2 days to go"))).toBeInTheDocument(); // 12 symbols at 10/day

    fireEvent.click(screen.getByText("Extra"));
    expect(screen.getByText(fullText("1 day to go"))).toBeInTheDocument(); // 20/day
  });

  it("shows the meso cost and main-stat gain for the next level", () => {
    seedSymbol(1, { level: 1, experience: 0 });
    render(<Calculator />);
    expect(screen.getByText(fullText("970,000 mesos required"))).toBeInTheDocument();
    expect(screen.getByText(fullText("+100 main stat"))).toBeInTheDocument();

    act(() => {
      seedSymbol(7, { level: 1, experience: 0 }); // switch to Cernium while mounted
    });
    expect(screen.getByText(fullText("36,500,000 mesos required"))).toBeInTheDocument();
    expect(screen.getByText(fullText("+200 main stat"))).toBeInTheDocument();
  });

  it("does not write derived values into the store on mount (they are computed on read)", () => {
    vi.setSystemTime(WED);
    const seeded = seedSymbol(1, { level: 1, experience: 0, daily: true });
    render(<Calculator />);
    expect(vj()).toEqual(seeded);
    expect(vj()).not.toHaveProperty("symbolsRemaining");
  });
});
