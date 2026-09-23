import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressRing from "./ProgressRing";

describe("ProgressRing", () => {
  it("renders its child inside a labelled ring", () => {
    render(
      <ProgressRing value={12} max={20} label="Vanishing Journey, level 12 of 20">
        <span>12</span>
      </ProgressRing>
    );
    expect(
      screen.getByRole("img", { name: "Vanishing Journey, level 12 of 20" })
    ).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });
  it("clamps NaN to a 0 fraction", () => {
    render(
      <ProgressRing value={NaN} max={20} label="l">
        <span>x</span>
      </ProgressRing>
    );
    expect(screen.getByRole("img", { name: "l" })).toHaveAttribute("data-fraction", "0");
  });
  it("clamps a value above max to a 1 fraction", () => {
    render(
      <ProgressRing value={30} max={20} label="l">
        <span>x</span>
      </ProgressRing>
    );
    expect(screen.getByRole("img", { name: "l" })).toHaveAttribute("data-fraction", "1");
  });
});
