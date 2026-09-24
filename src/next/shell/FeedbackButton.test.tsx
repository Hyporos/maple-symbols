import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FeedbackButton from "./FeedbackButton";
import { BreakpointProvider } from "../../contexts/BreakpointContext";

describe("FeedbackButton", () => {
  it("is always on screen and opens the coming-soon note", () => {
    render(
      <BreakpointProvider>
        <FeedbackButton />
      </BreakpointProvider>
    );
    const button = screen.getByRole("button", { name: "Feedback" });
    expect(button.className).toMatch(/fixed/);
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(button);
    expect(screen.getByRole("dialog", { name: "Feedback" })).toHaveTextContent(
      "report a wrong number"
    );
  });
  it("is a small round icon button below 1440 px, its label kept for screen readers", () => {
    render(
      <BreakpointProvider>
        <FeedbackButton />
      </BreakpointProvider>
    );
    const button = screen.getByRole("button", { name: "Feedback" });
    expect(button).toHaveClass("size-11", "rounded-full", "min-[1440px]:size-auto");
    expect(screen.getByText("Feedback")).toHaveClass("sr-only", "min-[1440px]:not-sr-only");
  });
});
