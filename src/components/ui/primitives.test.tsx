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
