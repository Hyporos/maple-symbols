import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import NumberField from "./NumberField";

describe("NumberField", () => {
  it("shows blank for NaN and the number otherwise", () => {
    const { rerender } = render(
      <NumberField value={NaN} onChange={() => {}} placeholder="1" label="Level" />
    );
    expect(screen.getByRole("spinbutton", { name: "Level" })).toHaveValue(null);
    rerender(<NumberField value={12} onChange={() => {}} placeholder="1" label="Level" />);
    expect(screen.getByRole("spinbutton", { name: "Level" })).toHaveValue(12);
  });
  it("calls onChange with the raw typed value", () => {
    const onChange = vi.fn();
    render(<NumberField value={NaN} onChange={onChange} placeholder="1" label="Level" />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Level" }), { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith("5");
  });
  it("blurs on wheel so scrolling the page cannot change it", () => {
    render(<NumberField value={5} onChange={() => {}} placeholder="1" label="Level" />);
    const input = screen.getByRole("spinbutton", { name: "Level" });
    input.focus();
    expect(input).toHaveFocus();
    fireEvent.wheel(input);
    expect(input).not.toHaveFocus();
  });
  it("leaves the global keyboard focus ring alone (no outline utility overriding it)", () => {
    render(<NumberField value={5} onChange={() => {}} placeholder="1" label="Level" />);
    expect(screen.getByRole("spinbutton", { name: "Level" }).className).not.toMatch(/outline-/);
  });
});
