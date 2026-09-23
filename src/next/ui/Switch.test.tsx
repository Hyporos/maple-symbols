import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Switch from "./Switch";

describe("Switch", () => {
  it("is a switch reflecting its checked state", () => {
    render(<Switch checked={false} onChange={() => {}} label="Daily" />);
    expect(screen.getByRole("switch", { name: "Daily" })).toHaveAttribute("aria-checked", "false");
  });
  it("calls onChange on click", () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="Daily" />);
    fireEvent.click(screen.getByRole("switch", { name: "Daily" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
  it("is disabled and ignores clicks", () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="Daily" disabled />);
    const el = screen.getByRole("switch", { name: "Daily" });
    expect(el).toBeDisabled();
    fireEvent.click(el);
    expect(onChange).not.toHaveBeenCalled();
  });
});
