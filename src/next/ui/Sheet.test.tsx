import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Sheet from "./Sheet";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { setViewport } from "../../test/helpers";

const renderSheet = (onClose = vi.fn()) =>
  render(
    <BreakpointProvider>
      <button>opener</button>
      <Sheet open title="Symbol Selector" closeLabel="Close" onClose={onClose}>
        <input aria-label="Count" />
      </Sheet>
    </BreakpointProvider>
  );

describe("Sheet", () => {
  it("is a dialog named by its title that takes focus, and Escape closes it", () => {
    setViewport("mobile");
    const onClose = vi.fn();
    renderSheet(onClose);
    const dialog = screen.getByRole("dialog", { name: "Symbol Selector" });
    expect(dialog.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
  it("closes from its close button", () => {
    setViewport("desktop");
    const onClose = vi.fn();
    renderSheet(onClose);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
  it("renders nothing while closed", () => {
    render(
      <BreakpointProvider>
        <Sheet open={false} title="t" closeLabel="c" onClose={() => {}}>
          x
        </Sheet>
      </BreakpointProvider>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
