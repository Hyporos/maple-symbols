import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import NextServerMenu from "./NextServerMenu";
import { RouterProvider } from "../../contexts/RouterContext";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { useAppStore } from "../../state/store";
import { setViewport } from "../../test/helpers";

const openMenuAt = (path: string) => {
  setViewport("desktop");
  window.history.replaceState(null, "", path);
  render(
    <RouterProvider>
      <BreakpointProvider>
        <NextServerMenu />
      </BreakpointProvider>
    </RouterProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Choose your server" }));
  return screen.getByRole("dialog");
};

describe("NextServerMenu", () => {
  it("links every edition to the current page, inside /next", () => {
    const menu = openMenuAt("/msea/next/handbook");
    const links = within(menu).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/next/handbook",
      "/msea/next/handbook",
      "/kms/next/handbook",
      "/jms/next/handbook",
      "/tms/next/handbook",
      "/cms/next/handbook",
    ]);
    expect(within(menu).getByRole("link", { current: "page" })).toHaveAttribute(
      "href",
      "/msea/next/handbook"
    );
  });

  it("swaps only the numbers from its Numbers from picker", () => {
    const menu = openMenuAt("/next");
    fireEvent.change(within(menu).getByRole("combobox"), { target: { value: "kms" } });
    expect(useAppStore.getState().region).toBe("kms");
    expect(window.location.pathname).toBe("/next"); // still the same page
  });

  it("says it opens a dialog and whether it is open", () => {
    setViewport("desktop");
    window.history.replaceState(null, "", "/next");
    render(
      <RouterProvider>
        <BreakpointProvider>
          <NextServerMenu />
        </BreakpointProvider>
      </RouterProvider>
    );
    const opener = screen.getByRole("button", { name: "Choose your server" });
    expect(opener).toHaveAttribute("aria-haspopup", "dialog");
    expect(opener).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(opener);
    expect(opener).toHaveAttribute("aria-expanded", "true");
  });
});
