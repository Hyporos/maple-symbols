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

  it("puts the /next suggestion banner in the page's flow between the header and the page", () => {
    // A Korean browser on the GMS edition of /next triggers the suggestion banner (REGIONS D-9).
    mockBrowser({ languages: ["ko-KR", "ko"] });
    renderShellAt("/next/handbook");
    const header = screen.getByRole("banner");
    const suggestion = screen.getByRole("complementary");
    // Its own row, after the sticky header's wrapper and before <main>: absolutely positioned
    // under the header it hid the top of the first card on phones.
    expect(suggestion.previousElementSibling).toBe(header.parentElement);
    expect(suggestion.nextElementSibling).toBe(screen.getByRole("main"));
    expect(suggestion.className).not.toMatch(/absolute/);
    // The /next copy: the link stays on this /next page in the suggested edition.
    expect(screen.getByRole("link", { name: "KMS 버전으로 이동" })).toHaveAttribute(
      "href",
      "/kms/next/handbook"
    );
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
