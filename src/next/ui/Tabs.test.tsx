import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Tabs from "./Tabs";

const tabs = [
  { value: "exp", label: "Exp" },
  { value: "cost", label: "Cost" },
] as const;

describe("Tabs", () => {
  it("is a tablist with the current tab selected and its panel named", () => {
    render(
      <Tabs label="Tables" tabs={[...tabs]} value="exp" onChange={() => {}} idPrefix="handbook" />
    );
    expect(screen.getByRole("tablist", { name: "Tables" })).toBeInTheDocument();
    const current = screen.getByRole("tab", { name: "Exp" });
    expect(current).toHaveAttribute("aria-selected", "true");
    expect(current).toHaveAttribute("aria-controls", "handbook-panel-exp");
  });
  it("moves and changes on ArrowRight", () => {
    const onChange = vi.fn();
    render(
      <Tabs label="Tables" tabs={[...tabs]} value="exp" onChange={onChange} idPrefix="handbook" />
    );
    fireEvent.keyDown(screen.getByRole("tab", { name: "Exp" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("cost");
  });
  it("points aria-controls only from the selected tab, whose panel is the one rendered", () => {
    render(
      <Tabs label="Tables" tabs={[...tabs]} value="exp" onChange={() => {}} idPrefix="handbook" />
    );
    expect(screen.getByRole("tab", { name: "Cost" })).not.toHaveAttribute("aria-controls");
  });
});
