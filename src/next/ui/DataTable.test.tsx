import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DataTable from "./DataTable";

const columns = [
  { key: "level", header: "Level" },
  { key: "cost", header: "Cost", align: "right" as const },
];
const rows = [
  { key: "1", cells: ["1", "100"] },
  { key: "2", cells: ["2", "200"], current: true },
];

describe("DataTable", () => {
  it("is a named table with headers and a current row marked", () => {
    render(<DataTable columns={columns} rows={rows} caption="Exp table" />);
    expect(screen.getByRole("table", { name: "Exp table" })).toBeInTheDocument();
    expect(screen.getByText("Level")).toBeInTheDocument();
    expect(screen.getByText("Cost")).toBeInTheDocument();
    const currentRow = screen.getByText("200").closest("tr")!;
    expect(currentRow).toHaveAttribute("aria-current", "true");
  });
});
