import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Header from "./Header";
import { RouterProvider } from "../contexts/RouterContext";
import { BreakpointProvider } from "../contexts/BreakpointContext";
import { setViewport } from "../test/helpers";
import { useAppStore } from "../state/store";

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

  it("the server menu lists every site version for the same page, the current one marked", () => {
    window.history.replaceState(null, "", "/handbook");
    renderHeader();
    const button = screen.getByRole("button", { name: "Choose your server" });
    expect(button).toHaveTextContent("GMS");
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    const hrefs = Object.fromEntries(
      ["GMS", "MSEA", "KMS", "JMS", "TMS", "CMS"].map((name) => [
        name,
        screen.getByRole("link", { name: new RegExp(`^${name}`) }).getAttribute("href"),
      ])
    );
    expect(hrefs).toEqual({
      GMS: "/handbook",
      MSEA: "/msea/handbook",
      KMS: "/kms/handbook",
      JMS: "/jms/handbook",
      TMS: "/tms/handbook",
      CMS: "/cms/handbook",
    });
    expect(screen.getByRole("link", { name: /^GMS/ })).toHaveAttribute("aria-current", "page");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("inside an edition, every link keeps its prefix", () => {
    window.history.replaceState(null, "", "/msea/handbook");
    renderHeader();
    expect(screen.getByRole("link", { name: "Calculator" })).toHaveAttribute("href", "/msea");
    expect(screen.getByRole("link", { name: "Handbook" })).toHaveAttribute(
      "href",
      "/msea/handbook"
    );
    expect(screen.getByRole("link", { name: "Extras" })).toHaveAttribute("href", "/msea/changelog");
    expect(screen.getByRole("link", { name: "Go to calculator" })).toHaveAttribute("href", "/msea");
    expect(screen.getByRole("button", { name: "Choose your server" })).toHaveTextContent("MSEA");
  });

  it("names its links in a translated edition's own language", () => {
    window.history.replaceState(null, "", "/kms/handbook");
    renderHeader();
    expect(screen.getByRole("link", { name: "계산기" })).toHaveAttribute("href", "/kms");
    expect(screen.getByRole("button", { name: "서버 선택" })).toHaveTextContent("KMS");
  });

  it("'Numbers from' swaps the numbers without leaving the page, and the page's own server resets it", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "Choose your server" }));
    const select = screen.getByRole("combobox", { name: "Numbers from" });
    expect(select).toHaveValue("gms");

    fireEvent.change(select, { target: { value: "kms" } });
    expect(useAppStore.getState()).toMatchObject({ region: "kms", regionOverride: "kms" });
    expect(window.location.pathname).toBe("/");
    expect(screen.getByRole("button", { name: "Choose your server" })).toHaveTextContent(
      "GMS · KMS"
    );

    fireEvent.change(select, { target: { value: "gms" } });
    expect(useAppStore.getState()).toMatchObject({ region: "gms", regionOverride: null });
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

  it("on a tablet, shows the links inline and keeps the server menu", () => {
    setViewport("tablet");
    renderHeader();
    expect(screen.getByRole("link", { name: "Handbook" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /navigation menu/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose your server" })).toBeInTheDocument();
  });
});
