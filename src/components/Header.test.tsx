import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Header from "./Header";
import { RouterProvider } from "../contexts/RouterContext";
import { BreakpointProvider } from "../contexts/BreakpointContext";
import { setViewport } from "../test/helpers";

const renderHeader = () =>
  render(
    <RouterProvider>
      <BreakpointProvider>
        <Header />
      </BreakpointProvider>
    </RouterProvider>
  );

describe("Header", () => {
  it("links to the three pages, plus the logo to the calculator", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: "Calculator" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Handbook" })).toHaveAttribute("href", "/handbook");
    expect(screen.getByRole("link", { name: "Extras" })).toHaveAttribute("href", "/changelog");
    expect(screen.getByRole("link", { name: "Go to calculator" })).toHaveAttribute("href", "/");
  });

  it("navigates client-side (pushState) instead of reloading", () => {
    const push = vi.spyOn(window.history, "pushState");
    renderHeader();
    fireEvent.click(screen.getByRole("link", { name: "Handbook" }));
    expect(push).toHaveBeenCalledWith(null, "", "/handbook");
    expect(window.location.pathname).toBe("/handbook");
    push.mockRestore();
  });

  it("shows the language selector as coming soon (not functional yet)", () => {
    renderHeader();
    const button = screen.getByRole("button", { name: "Language selector (coming soon)" });
    expect(button).toHaveTextContent("EN");
  });

  it("on a phone, a menu button toggles the page links and a link click closes the menu", () => {
    setViewport("mobile");
    renderHeader();

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(screen.getByRole("button", { name: "Close navigation menu" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Handbook" }));
    expect(screen.getByRole("button", { name: "Open navigation menu" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/handbook");
  });

  it("on a tablet, shows the links inline and keeps the language button", () => {
    setViewport("tablet");
    renderHeader();
    expect(screen.getByRole("link", { name: "Handbook" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /navigation menu/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /language selector/i })).toBeInTheDocument();
  });
});
