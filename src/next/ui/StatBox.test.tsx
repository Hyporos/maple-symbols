import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StatBox from "./StatBox";

describe("StatBox", () => {
  it("renders its caption and value", () => {
    render(<StatBox caption="Power">1234</StatBox>);
    expect(screen.getByText("Power")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });
});
