import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import NextHeader from "./NextHeader";
import { RouterProvider } from "../../contexts/RouterContext";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { setViewport } from "../../test/helpers";

const renderHeader = (path = "/next/handbook") => {
  window.history.replaceState(null, "", path);
  return render(
    <RouterProvider>
      <BreakpointProvider>
        <NextHeader />
      </BreakpointProvider>
    </RouterProvider>
  );
};

// KI-007/KI-011: no interactive element (button, link, radio) may sit inside another one.
// Task 7 owns src/test/interactiveNesting.test.tsx; this is the shell's own net.
const NESTED = ["button button", "button a", "a button", "button [role=radio]"];
const expectNoNesting = (container: HTMLElement) => {
  for (const selector of NESTED) {
    expect(container.querySelectorAll(selector), selector).toHaveLength(0);
  }
};

describe("NextHeader", () => {
  it("nests no interactive element inside another, desktop or phone, menu open or closed", () => {
    setViewport("desktop");
    const desktop = renderHeader();
    expectNoNesting(desktop.container);

    setViewport("mobile");
    const phone = renderHeader();
    expectNoNesting(phone.container);
    fireEvent.click(within(phone.container).getByRole("button", { name: "Open navigation menu" }));
    expectNoNesting(phone.container);
  });

  it("links every page inside /next and marks the current one", () => {
    setViewport("desktop");
    renderHeader();
    expect(screen.getByRole("link", { name: "Calculator" })).toHaveAttribute("href", "/next");
    expect(screen.getByRole("link", { name: "Handbook" })).toHaveAttribute("aria-current", "page");
  });

  it("has the character chip, the server menu and the text-and-contrast button on desktop", () => {
    setViewport("desktop");
    renderHeader();
    expect(screen.getByRole("button", { name: /Main/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose your server" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Text and contrast" })).toBeInTheDocument();
  });

  it("on phones keeps the character chip and moves the server and text buttons into the menu", () => {
    setViewport("mobile");
    renderHeader();
    expect(screen.getByRole("button", { name: /Main/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Text and contrast" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(screen.getByRole("button", { name: "Text and contrast" })).toBeInTheDocument();
  });

  it("opens a coming-soon note from the character chip", () => {
    setViewport("desktop");
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /Main/ }));
    expect(screen.getByRole("dialog", { name: "Choose a character" })).toHaveTextContent(
      "Character profiles are coming in 2.0"
    );
  });

  it("keeps the server menu's site-version links on the current page, inside /next", () => {
    setViewport("desktop");
    renderHeader("/next/handbook");
    fireEvent.click(screen.getByRole("button", { name: "Choose your server" }));
    const dialog = screen.getByRole("dialog", { name: "Choose your server" });
    expect(within(dialog).getByRole("link", { name: /^GMS/ })).toHaveAttribute(
      "href",
      "/next/handbook"
    );
    expect(within(dialog).getByRole("link", { name: /^MSEA/ })).toHaveAttribute(
      "href",
      "/msea/next/handbook"
    );
  });

  it("says whether the phone menu is open and which element it controls", () => {
    setViewport("mobile");
    renderHeader();
    const toggle = screen.getByRole("button", { name: "Open navigation menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    const open = screen.getByRole("button", { name: "Close navigation menu" });
    expect(open).toHaveAttribute("aria-expanded", "true");
    const menu = document.getElementById(open.getAttribute("aria-controls")!);
    expect(menu).toContainElement(screen.getAllByRole("navigation").at(-1)!);
  });
});
