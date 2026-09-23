import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressBar from "./ProgressBar";

describe("ProgressBar", () => {
  it("reports its value as a progressbar", () => {
    render(<ProgressBar value={30} max={100} label="Experience" />);
    const bar = screen.getByRole("progressbar", { name: "Experience" });
    expect(bar).toHaveAttribute("aria-valuenow", "30");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });
  it("treats NaN as 0", () => {
    render(<ProgressBar value={NaN} max={100} label="Experience" />);
    expect(screen.getByRole("progressbar", { name: "Experience" })).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
  });
});
