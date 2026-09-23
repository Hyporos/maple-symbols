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
    fireEvent.click(button);
    expect(screen.getByRole("dialog", { name: "Feedback" })).toHaveTextContent(
      "report a wrong number"
    );
  });
});
