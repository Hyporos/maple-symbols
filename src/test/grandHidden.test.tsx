// ---------------------------------------------------------------------------
// grandHidden.test.tsx — Grand Sacred symbols are in the data but not in the interface
// until the 2.0 design places them (REGIONS D-18). With both levelled and their dailies
// on, no card may list them, count their power, or let them be selected.
// ---------------------------------------------------------------------------

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Selector from "../components/Selector";
import Overview from "../components/Calculator/Overview";
import Graph from "../components/Calculator/Graph";
import Tools from "../components/Calculator/Tools";
import Calculator from "../components/Calculator/Calculator";
import ExpTable from "../components/Handbook/ExpTable";
import CostTable from "../components/Handbook/CostTable";
import { useAppStore } from "../state/store";
import { seedSymbol, WED } from "./helpers";

const GRAND = ["Tallahart", "Geardock"];

const expectNoGrand = () => {
  for (const name of GRAND) {
    expect(screen.queryAllByAltText(name)).toHaveLength(0);
    expect(screen.queryAllByText(new RegExp(name))).toHaveLength(0);
  }
};

beforeEach(() => {
  vi.setSystemTime(WED);
  // Levelled Grand symbols with their dailies on, as a future interface could leave them.
  seedSymbol(13, { level: 5, experience: 0, daily: true }, false);
  seedSymbol(14, { level: 8, experience: 0, daily: true }, false);
});

describe("Grand Sacred stays out of the interface", () => {
  for (const mode of ["arcane", "sacred"] as const) {
    it(`lists exactly six symbols in ${mode} mode, none of them Grand`, () => {
      useAppStore.getState().setMode(mode);
      render(<Selector />);
      expect(screen.getAllByText(/^Lv\. /)).toHaveLength(6);
      expectNoGrand();
    });

    it(`leaves Grand out of the Overview, Graph, Calculator and Tools in ${mode} mode`, () => {
      useAppStore.getState().setMode(mode);
      render(
        <>
          <Calculator />
          <Tools />
          <Overview />
          <Graph />
        </>
      );
      expectNoGrand();
    });

    it(`leaves Grand out of the Handbook tables in ${mode} mode`, () => {
      useAppStore.getState().setMode(mode);
      render(
        <>
          <ExpTable />
          <CostTable />
        </>
      );
      expectNoGrand();
    });
  }

  it("adds Grand power to the Sacred total and its max (spec §1, Brian 2026-09-23)", () => {
    seedSymbol(7, { level: 5, experience: 0, daily: true });
    render(<Graph />);
    // Numerator: Sacred (id 7, level 5) 50 + Grand (id 13, level 5) 50 + Grand (id 14, level 8) 80
    // = 180. Denominator: the same three enabled symbols' own max (110 each) = 330, so the max
    // grows with Grand Sacred exactly as the total does (Calculator/Graph.tsx maxFamilyPower).
    expect(screen.getByText("180 / 330")).toBeInTheDocument();
  });

  for (const mode of ["arcane", "sacred"] as const) {
    it(`the current Selector offers no Grand symbol in ${mode} mode`, () => {
      useAppStore.getState().setMode(mode);
      render(<Selector />);
      expect(screen.getAllByText(/^Lv\. /)).toHaveLength(6);
      expectNoGrand();
    });
  }
});
