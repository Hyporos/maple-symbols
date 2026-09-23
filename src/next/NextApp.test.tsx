import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "../App";
import { RouterProvider, useRouter } from "../contexts/RouterContext";
import { useAppStore } from "../state/store";
import { renderNextAt as renderAt } from "./testing";

describe("NextApp", () => {
  it("takes over the page at /next, marked noindex", async () => {
    renderAt("/next");
    expect(await screen.findByTestId("next-app")).toBeInTheDocument();
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe(
      "noindex"
    );
  });

  it("leaves every other path to the current interface", () => {
    renderAt("/handbook");
    expect(screen.queryByTestId("next-app")).not.toBeInTheDocument();
  });

  // The plan's Review Focus: "returning to / from /next keeps the same saved levels" — a Grand
  // selection made in /next must not leak into the current UI, which has no Grand tab and does
  // not filter Calculator/Tools's selection by mode.
  it("folds a Grand selection back to Sacred on leaving /next, the same way a nav link would", async () => {
    // A stand-in for a real nav link (none exists yet in the placeholder shell): it calls the
    // same useRouter().navigate the Header's links do (Header.tsx's handleNav).
    function NavHome() {
      const { navigate } = useRouter();
      return (
        <button type="button" onClick={() => navigate("/")}>
          home
        </button>
      );
    }

    window.history.replaceState(null, "", "/next");
    render(
      <RouterProvider>
        <NavHome />
        <App />
      </RouterProvider>
    );
    expect(await screen.findByTestId("next-app")).toBeInTheDocument();

    useAppStore.getState().selectSymbol(13); // Tallahart
    expect(useAppStore.getState().mode).toBe("grand");

    fireEvent.click(screen.getByRole("button", { name: "home" }));
    expect(screen.queryByTestId("next-app")).not.toBeInTheDocument();

    // Lazy Calculator/Overview have mounted once this heading (Overview's mobile title) appears.
    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();

    const state = useAppStore.getState();
    expect(state.mode).toBe("sacred");
    const selected = state.symbols.find((s) => s.id === state.selectedId);
    expect(selected?.type).toBe("sacred");
    expect(screen.queryByText(/Tallahart|Geardock/)).not.toBeInTheDocument();
  });
});
