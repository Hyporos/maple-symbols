import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NextShell from "./NextShell";
import { RouterProvider } from "../../contexts/RouterContext";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { DEFAULT_EDITION, pageMetaFor } from "../../lib/routes";
import { mockBrowser, setViewport } from "../../test/helpers";

const renderShellAt = (path: string, bottomBar = false) => {
  window.history.replaceState(null, "", path);
  return render(
    <RouterProvider>
      <BreakpointProvider>
        <NextShell bottomBar={bottomBar}>
          <p>page</p>
        </NextShell>
      </BreakpointProvider>
    </RouterProvider>
  );
};

afterEach(() => vi.restoreAllMocks());

describe("NextShell", () => {
  it("wraps the page in a main landmark between the header and the footer", () => {
    renderShellAt("/next");
    expect(screen.getByRole("main")).toHaveTextContent("page");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("sets the tab title for the current /next page", () => {
    renderShellAt("/next/handbook");
    expect(document.title).toBe(pageMetaFor("/handbook", DEFAULT_EDITION).title);
  });

  it("docks the suggestion banner under the header instead of the page's own bottom", () => {
    // A Korean browser on the GMS edition of /next triggers the suggestion banner (REGIONS D-9).
    mockBrowser({ languages: ["ko-KR", "ko"] });
    renderShellAt("/next");
    const header = screen.getByRole("banner");
    const suggestion = screen.getByRole("complementary");
    // Sharing the header's own wrapper (not NextShell's outer flex column) gives the banner a
    // containing block sized to the header, so its `top-full` docks it right under the header
    // instead of at the page's own bottom (it rendered at top:740 before this fix).
    expect(suggestion.parentElement).toBe(header.parentElement);
    expect(suggestion.parentElement?.className).toMatch(/sticky/);
  });
  it("pads the foot of the page for a phone bottom tab bar, and only then", () => {
    const pad = "pb-[calc(57px+env(safe-area-inset-bottom))]";
    const root = () => screen.getByRole("main").parentElement!;
    setViewport("mobile");
    const { unmount } = renderShellAt("/next", true);
    expect(root()).toHaveClass(pad);
    unmount();

    renderShellAt("/next/handbook");
    expect(root()).not.toHaveClass(pad);
  });

  it("does not pad for the bar on desktop, where there is none", () => {
    setViewport("desktop");
    renderShellAt("/next", true);
    expect(screen.getByRole("main").parentElement).not.toHaveClass(
      "pb-[calc(57px+env(safe-area-inset-bottom))]"
    );
  });
});
