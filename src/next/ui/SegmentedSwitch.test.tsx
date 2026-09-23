import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SegmentedSwitch from "./SegmentedSwitch";

const options = [
  { value: "arcane", label: "Arcane" },
  { value: "sacred", label: "Sacred" },
  { value: "grand", label: "Grand" },
] as const;

describe("SegmentedSwitch", () => {
  it("is a radiogroup with the current option checked", () => {
    render(
      <SegmentedSwitch
        label="Symbol family"
        options={[...options]}
        value="sacred"
        onChange={() => {}}
      />
    );
    expect(screen.getByRole("radiogroup", { name: "Symbol family" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Sacred" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Arcane" })).toHaveAttribute("tabindex", "-1");
  });
  it("changes on click and with the arrow keys, wrapping", () => {
    const onChange = vi.fn();
    render(<SegmentedSwitch label="f" options={[...options]} value="grand" onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Arcane" }));
    expect(onChange).toHaveBeenLastCalledWith("arcane");
    fireEvent.keyDown(screen.getByRole("radio", { name: "Grand" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("arcane");
    fireEvent.keyDown(screen.getByRole("radio", { name: "Grand" }), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith("sacred");
  });
});
