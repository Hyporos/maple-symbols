import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import BottomTabBar from "./BottomTabBar";

const tabs = [
  { value: "calc", label: "Calculator", icon: <span>C</span> },
  { value: "tables", label: "Tables", icon: <span>T</span> },
] as const;

describe("BottomTabBar", () => {
  it("is a fixed tablist with icon and label per tab", () => {
    render(
      <BottomTabBar
        label="Sections"
        tabs={[...tabs]}
        value="calc"
        onChange={() => {}}
        idPrefix="shell"
      />
    );
    const list = screen.getByRole("tablist", { name: "Sections" });
    expect(list.closest("nav")).toHaveClass("fixed");
    expect(screen.getByText("Calculator")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });
});
