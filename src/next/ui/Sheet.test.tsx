import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Sheet from "./Sheet";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { setViewport } from "../../test/helpers";

// Holds `open` itself so the opener button is a real DOM element Sheet can hand focus back to,
// not a mock ref: closing Sheet re-renders this component to null, same as real callers do.
const SheetWithOpener = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>opener</button>
      <Sheet open={open} title="Symbol Selector" closeLabel="Close" onClose={() => setOpen(false)}>
        <input aria-label="Count" />
      </Sheet>
    </>
  );
};

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
  it("returns focus to the opener when Escape closes it", () => {
    render(
      <BreakpointProvider>
        <SheetWithOpener />
      </BreakpointProvider>
    );
    const opener = screen.getByRole("button", { name: "opener" });
    opener.focus();
    expect(opener).toHaveFocus();

    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Symbol Selector" });
    expect(dialog.contains(document.activeElement)).toBe(true);

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
  it("closes on Escape after focus moved inside, wherever the key event lands", () => {
    setViewport("mobile");
    const onClose = vi.fn();
    render(
      <BreakpointProvider>
        <Sheet open title="Symbol Selector" closeLabel="Close" onClose={onClose}>
          <input aria-label="Count" />
          <button>Apply</button>
        </Sheet>
      </BreakpointProvider>
    );
    const apply = screen.getByRole("button", { name: "Apply" });
    apply.focus();
    expect(apply).toHaveFocus();
    // The old panel-only handler missed a key that reached the document (focus had left the panel).
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
  it("closes on a click outside it on desktop", () => {
    setViewport("desktop");
    const onClose = vi.fn();
    renderSheet(onClose);
    fireEvent.pointerDown(screen.getByRole("button", { name: "opener" }));
    expect(onClose).toHaveBeenCalled();
  });
  it("does not close on a click inside it", () => {
    setViewport("desktop");
    const onClose = vi.fn();
    renderSheet(onClose);
    fireEvent.pointerDown(screen.getByRole("textbox", { name: "Count" }));
    expect(onClose).not.toHaveBeenCalled();
  });
  it("focuses the content's first field, not the header's close button", () => {
    setViewport("mobile");
    renderSheet();
    expect(screen.getByRole("textbox", { name: "Count" })).toHaveFocus();
  });
  it("is modal on phones and not on desktop, and caps the phone sheet's height", () => {
    setViewport("mobile");
    const { unmount } = renderSheet();
    const phone = screen.getByRole("dialog");
    expect(phone).toHaveAttribute("aria-modal", "true");
    expect(phone).toHaveClass("max-h-[85dvh]", "overflow-y-auto");
    unmount();
    setViewport("desktop");
    renderSheet();
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-modal");
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
