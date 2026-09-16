import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import RadioButton from "./RadioButton";
import SlideButton from "./SlideButton";

describe("RadioButton", () => {
  it("shows its label and reports clicks", () => {
    const onClick = vi.fn();
    render(<RadioButton label="Arcane" selected={false} onClick={onClick} />);
    fireEvent.click(screen.getByText("Arcane"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is a radio named by its label, checked and tabbable only when selected (KI-011)", () => {
    render(
      <div role="radiogroup" aria-label="Pair">
        <RadioButton label="One" selected={true} onClick={() => {}} />
        <RadioButton label="Two" selected={false} onClick={() => {}} />
      </div>
    );
    const one = screen.getByRole("radio", { name: "One" });
    const two = screen.getByRole("radio", { name: "Two" });
    expect(one).toHaveAttribute("aria-checked", "true");
    expect(one).toHaveAttribute("tabindex", "0");
    expect(two).toHaveAttribute("aria-checked", "false");
    expect(two).toHaveAttribute("tabindex", "-1");
  });

  it("shows the focus outline for keyboard focus only, not after a click", () => {
    render(<RadioButton label="Arcane" selected={true} onClick={() => {}} />);
    const radio = screen.getByRole("radio", { name: "Arcane" });
    expect(radio).toHaveClass("focus:outline-none", "focus-visible:outline-solid");
  });

  it("arrow keys move focus and selection within the group, wrapping around", () => {
    const pickOne = vi.fn();
    const pickTwo = vi.fn();
    render(
      <div role="radiogroup" aria-label="Pair">
        <RadioButton label="One" selected={true} onClick={pickOne} />
        <RadioButton label="Two" selected={false} onClick={pickTwo} />
      </div>
    );
    const one = screen.getByRole("radio", { name: "One" });
    const two = screen.getByRole("radio", { name: "Two" });

    fireEvent.keyDown(one, { key: "ArrowDown" });
    expect(two).toHaveFocus();
    expect(pickTwo).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(two, { key: "ArrowRight" }); // wraps to the first
    expect(one).toHaveFocus();
    expect(pickOne).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(one, { key: "ArrowLeft" }); // wraps to the last
    expect(two).toHaveFocus();
    expect(pickTwo).toHaveBeenCalledTimes(2);
  });
});

describe("SlideButton", () => {
  it("reports its target index when clicked", () => {
    const setSelectedInfo = vi.fn();
    render(
      <SlideButton
        label="Credits"
        selectedInfo={1}
        setSelectedInfo={setSelectedInfo}
        targetInfo={2}
      />
    );
    fireEvent.click(screen.getByText("Credits"));
    expect(setSelectedInfo).toHaveBeenCalledWith(2);
  });
});
