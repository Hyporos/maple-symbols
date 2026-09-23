import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  it("renders its content, with the small label above it when given", () => {
    render(<Card label="Symbols">body</Card>);
    expect(screen.getByText("Symbols")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });
  it("names a section after its label", () => {
    render(
      <Card label="Overview" as="section">
        x
      </Card>
    );
    expect(screen.getByRole("region", { name: "Overview" })).toBeInTheDocument();
  });
});
