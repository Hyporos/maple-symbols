import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import FeedbackButton from "./FeedbackButton";
import { FLOATING_FEEDBACK_MIN_WIDTH, useFeedbackInHeader } from "./useFeedbackInHeader";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { setViewport } from "../../test/helpers";

const wrapper = ({ children }: { children: ReactNode }) => (
  <BreakpointProvider>{children}</BreakpointProvider>
);

afterEach(() => vi.restoreAllMocks());

describe("FeedbackButton", () => {
  it("floats bottom-right and opens the coming-soon note", () => {
    render(<FeedbackButton placement="floating" />, { wrapper });
    const button = screen.getByRole("button", { name: "Feedback" });
    expect(button).toHaveClass("fixed", "right-4", "bottom-6");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(button);
    expect(screen.getByRole("dialog", { name: "Feedback" })).toHaveTextContent(
      "report a wrong number"
    );
  });

  it("floats as a small round icon below 1440 px, its label kept for screen readers", () => {
    render(<FeedbackButton placement="floating" />, { wrapper });
    expect(screen.getByRole("button", { name: "Feedback" })).toHaveClass(
      "size-11",
      "rounded-full",
      "min-[1440px]:size-auto"
    );
    expect(screen.getByText("Feedback")).toHaveClass("sr-only", "min-[1440px]:not-sr-only");
  });

  it("is a header chip, not floating, as a chip: icon plus accessible name, same note", () => {
    render(<FeedbackButton placement="chip" />, { wrapper });
    const button = screen.getByRole("button", { name: "Feedback" });
    expect(button).not.toHaveClass("fixed");
    expect(button).toHaveClass("rounded-lg", "bg-light");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.getByText("Feedback")).toHaveClass("sr-only");
    fireEvent.click(button);
    expect(screen.getByRole("dialog", { name: "Feedback" })).toBeInTheDocument();
  });
});

describe("useFeedbackInHeader", () => {
  it("floats on a wide desktop and moves to the header on tablets and phones", () => {
    setViewport("desktop");
    expect(renderHook(useFeedbackInHeader, { wrapper }).result.current).toBe(false);
    setViewport("tablet");
    expect(renderHook(useFeedbackInHeader, { wrapper }).result.current).toBe(true);
    setViewport("mobile");
    expect(renderHook(useFeedbackInHeader, { wrapper }).result.current).toBe(true);
  });

  it(`moves to the header below ${FLOATING_FEEDBACK_MIN_WIDTH} px on a desktop too`, () => {
    setViewport("desktop");
    // Only the floating width's query matches: a 1200 px desktop window.
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query === `(max-width: ${FLOATING_FEEDBACK_MIN_WIDTH - 1}px)`,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList
    );
    expect(renderHook(useFeedbackInHeader, { wrapper }).result.current).toBe(true);
  });
});
