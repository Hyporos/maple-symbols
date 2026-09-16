// ---------------------------------------------------------------------------
// Every custom event in docs/ANALYTICS.md §3 fires from the interaction it describes,
// with the documented data, and the once-per-session / on-change-only rules hold.
// Not covered: error_shown, which needs a real render crash inside App's ErrorBoundary.
// A stub stands in for the Umami tracker; src/lib/analytics.ts is exercised as-is.
// ---------------------------------------------------------------------------

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "../App";
import Selector from "../components/Selector";
import Calculator from "../components/Calculator/Calculator";
import Tools from "../components/Calculator/Tools";
import Overview from "../components/Calculator/Overview";
import Graph from "../components/Calculator/Graph";
import Handbook from "../components/Handbook/Handbook";
import Extras from "../components/Extras/Extras";
import Footer from "../components/Footer";
import { RouterProvider } from "../contexts/RouterContext";
import { resetAnalyticsSession } from "../lib/analytics";
import { seedSymbol } from "./helpers";

let umamiTrack: ReturnType<typeof vi.fn<(...args: unknown[]) => unknown>>;
const sent = () => umamiTrack.mock.calls;
const sentNamed = (name: string) => sent().filter(([n]) => n === name);

beforeEach(() => {
  umamiTrack = vi.fn<(...args: unknown[]) => unknown>();
  window.umami = { track: umamiTrack };
  resetAnalyticsSession();
});

afterEach(() => {
  delete window.umami;
});

describe("Selector", () => {
  it("mode_switch fires only when the type actually changes", () => {
    render(<Selector />);
    fireEvent.click(screen.getByRole("radio", { name: "Arcane" })); // already selected
    expect(sentNamed("mode_switch")).toEqual([]);
    fireEvent.click(screen.getByRole("radio", { name: "Sacred" }));
    expect(sentNamed("mode_switch")).toEqual([["mode_switch", { to: "sacred" }]]);
  });

  it("symbol_select names the symbol and mode, and skips the already-selected one", () => {
    render(<Selector />);
    fireEvent.click(screen.getByAltText("Vanishing Journey").closest("button")!); // selected by default
    fireEvent.click(screen.getByAltText("Lachelein").closest("button")!);
    expect(sentNamed("symbol_select")).toEqual([
      ["symbol_select", { symbol: "Lachelein", mode: "arcane" }],
    ]);
  });
});

describe("Calculator", () => {
  it("symbol_input fires once per field per session, never with the value (AN-3, AN-5)", () => {
    seedSymbol(1, { level: 1, experience: 0 });
    render(<Calculator />);
    const level = screen.getByPlaceholderText("Level");
    fireEvent.change(level, { target: { value: "5" } });
    fireEvent.change(level, { target: { value: "6" } });
    fireEvent.change(screen.getByPlaceholderText("Experience"), { target: { value: "3" } });
    expect(sentNamed("symbol_input")).toEqual([
      ["symbol_input", { field: "level", mode: "arcane" }],
      ["symbol_input", { field: "experience", mode: "arcane" }],
    ]);
  });

  it("quest_toggle reports the new state of each quest", () => {
    seedSymbol(1, { level: 1, experience: 0 });
    render(<Calculator />);
    fireEvent.click(screen.getByText("Daily"));
    fireEvent.click(screen.getByText("Daily"));
    fireEvent.click(screen.getByText("Weekly"));
    expect(sentNamed("quest_toggle")).toEqual([
      ["quest_toggle", { quest: "daily", state: "on" }],
      ["quest_toggle", { quest: "daily", state: "off" }],
      ["quest_toggle", { quest: "weekly", state: "on" }],
    ]);
  });

  it("cap_unlocked fires when the experience cap is unlocked", () => {
    seedSymbol(1, { level: 1, experience: 12 });
    render(<Calculator />);
    fireEvent.click(screen.getByLabelText("Unlock experience cap"));
    expect(sentNamed("cap_unlocked")).toEqual([["cap_unlocked"]]);
  });
});

describe("Tools", () => {
  it("tool_used: preview on switching tools, apply on Apply", () => {
    seedSymbol(1, { level: 1, experience: 0 });
    render(<Tools />);
    fireEvent.click(screen.getByRole("button", { name: /Symbol Selector/ })); // already open
    fireEvent.click(screen.getByRole("button", { name: /Arcane Catalyst/ }));
    fireEvent.click(screen.getByRole("button", { name: /Symbol Selector/ }));
    fireEvent.change(screen.getByPlaceholderText("Count"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(sentNamed("tool_used")).toEqual([
      ["tool_used", { tool: "catalyst", action: "preview" }],
      ["tool_used", { tool: "selector", action: "preview" }],
      ["tool_used", { tool: "selector", action: "apply" }],
    ]);
  });
});

describe("Overview", () => {
  it("overview_target sends a bucket, once per bucket, never the typed level (AN-4)", () => {
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    render(<Overview />);
    const row = screen.getAllByAltText("Vanishing Journey")[0].closest("button")!.parentElement!;
    fireEvent.click(within(row).getAllByRole("button")[0]);
    const input = within(row).getByPlaceholderText("Level");
    fireEvent.change(input, { target: { value: "1" } }); // below 2: no bucket
    fireEvent.change(input, { target: { value: "16" } });
    fireEvent.change(input, { target: { value: "18" } }); // same bucket
    fireEvent.change(input, { target: { value: "8" } });
    expect(sentNamed("overview_target")).toEqual([
      ["overview_target", { target_level: "16-20" }],
      ["overview_target", { target_level: "6-10" }],
    ]);
  });
});

describe("Graph", () => {
  it("graph_mode fires on an actual change of axis mode", () => {
    render(<Graph />);
    fireEvent.click(screen.getByRole("radio", { name: "Dynamic" })); // default
    fireEvent.click(screen.getByRole("radio", { name: "Linear" }));
    expect(sentNamed("graph_mode")).toEqual([["graph_mode", { mode: "linear" }]]);
  });
});

describe("Handbook and Extras tabs", () => {
  it("handbook_tab names the table that was opened", () => {
    render(<Handbook />);
    fireEvent.click(screen.getByText("Experience Table")); // already open
    fireEvent.click(screen.getByText("Meso Cost Table"));
    fireEvent.click(screen.getByText("Damage Ratio Table"));
    expect(sentNamed("handbook_tab")).toEqual([
      ["handbook_tab", { tab: "cost" }],
      ["handbook_tab", { tab: "ratio" }],
    ]);
  });

  it("extras_tab names the tab that was opened", () => {
    window.history.replaceState(null, "", "/changelog");
    render(
      <RouterProvider>
        <Extras />
      </RouterProvider>
    );
    fireEvent.click(screen.getByText("Credits"));
    expect(sentNamed("extras_tab")).toEqual([["extras_tab", { tab: "credits" }]]);
  });
});

describe("App", () => {
  it("not_found reports the first segment of an unknown path, and known paths send nothing", async () => {
    window.history.replaceState(null, "", "/handbook");
    const { unmount } = render(
      <RouterProvider>
        <App />
      </RouterProvider>
    );
    expect(sentNamed("not_found")).toEqual([]);
    unmount();

    window.history.replaceState(null, "", "/old-page/deep/link");
    render(
      <RouterProvider>
        <App />
      </RouterProvider>
    );
    await waitFor(() =>
      expect(sentNamed("not_found")).toEqual([["not_found", { path: "/old-page" }]])
    );
  });
});

describe("outbound links (attribute-based, no JavaScript)", () => {
  it("every footer link carries the outbound event and its destination", () => {
    window.history.replaceState(null, "", "/");
    render(
      <RouterProvider>
        <Footer />
      </RouterProvider>
    );
    const destinations = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href")?.startsWith("http"))
      .map((a) => [
        a.getAttribute("data-umami-event"),
        a.getAttribute("data-umami-event-destination"),
      ]);
    expect(destinations).toEqual([
      ["outbound", "github"],
      ["outbound", "discord"],
      ["outbound", "donate"],
    ]);
  });
});
