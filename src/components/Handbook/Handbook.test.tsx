import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Handbook from "./Handbook";
import ExpTable from "./ExpTable";
import CostTable from "./CostTable";
import RatioTable from "./RatioTable";
import { seedSymbol } from "../../test/helpers";
import { useAppStore } from "../../state/store";

const dataRows = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);
const cells = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((c) => c.textContent?.trim());

describe("Handbook", () => {
  it("has three tabs and opens on the experience table", () => {
    render(<Handbook />);
    expect(screen.getByText("Arcane Symbols")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Meso Cost Table"));
    expect(screen.getByRole("heading", { name: "Vanishing Journey" })).toBeInTheDocument();
    fireEvent.click(screen.getByText("Damage Ratio Table"));
    expect(screen.getByText("Arcane River")).toBeInTheDocument();
  });
});

describe("ExpTable", () => {
  it("lists 20 arcane levels with per-level and cumulative symbols; level 1 costs nothing", () => {
    render(<ExpTable />);
    const rows = dataRows();
    expect(rows).toHaveLength(20);
    expect(cells(rows[0])).toEqual(["1", "-", "-"]);
    expect(cells(rows[1])).toEqual(["2", "12", "12"]);
    expect(cells(rows[2])).toEqual(["3", "15", "27"]);
    expect(cells(rows[19])).toEqual(["20", "372", "2,679"]);
  });

  it("switches to the 11 sacred levels totalling 4,565", () => {
    useAppStore.setState({ mode: "sacred", selectedId: 7 });
    render(<ExpTable />);
    expect(screen.getByText("Sacred Symbols")).toBeInTheDocument();
    const rows = dataRows();
    expect(rows).toHaveLength(11);
    expect(cells(rows[10])).toEqual(["11", "1,100", "4,565"]);
  });

  it("marks the selected symbol's current level with its icon", () => {
    seedSymbol(1, { level: 5, experience: 0 });
    render(<ExpTable />);
    const rows = dataRows();
    expect(within(rows[4]).getByRole("img")).toBeInTheDocument(); // row "5"
    expect(within(rows[3]).queryByRole("img")).not.toBeInTheDocument();
  });
});

describe("CostTable", () => {
  it("shows the selected symbol's meso costs with running totals", () => {
    render(<CostTable />);
    expect(screen.getByRole("heading", { name: "Vanishing Journey" })).toBeInTheDocument();
    const rows = dataRows();
    expect(rows).toHaveLength(20);
    expect(cells(rows[0])).toEqual(["1", "-", "-"]);
    expect(cells(rows[1])).toEqual(["2", "970,000", "970,000"]);
    expect(cells(rows[2])).toEqual(["3", "1,230,000", "2,200,000"]);
  });

  it("follows the selected symbol (Cernium: 11 rows)", () => {
    seedSymbol(7, { level: 2, experience: 0 });
    render(<CostTable />);
    expect(screen.getByRole("heading", { name: "Cernium" })).toBeInTheDocument();
    expect(dataRows()).toHaveLength(11);
  });
});

describe("RatioTable", () => {
  it("arcane: nine power bands from 0–9% to 150%+", () => {
    render(<RatioTable />);
    expect(screen.getByText("Arcane River")).toBeInTheDocument();
    const rows = dataRows();
    expect(rows).toHaveLength(9);
    expect(cells(rows[0])).toEqual(["0% - 9%", "10%", "280%"]);
    expect(cells(rows[8])).toEqual(["150% +", "150%", "0%"]);
  });

  it("sacred: sixteen difference bands from < -100 to 50+", () => {
    useAppStore.setState({ mode: "sacred" });
    render(<RatioTable />);
    expect(screen.getByText("Grandis")).toBeInTheDocument();
    const rows = dataRows();
    expect(rows).toHaveLength(16);
    expect(cells(rows[0])).toEqual(["< -100", "5%", "200%"]);
    expect(cells(rows[10])).toEqual(["0", "100%", "100%"]);
    expect(cells(rows[15])).toEqual(["50 +", "125%", "100%"]);
  });
});
