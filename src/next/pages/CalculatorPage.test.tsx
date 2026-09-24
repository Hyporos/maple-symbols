import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { renderNextAt as renderAt } from "../testing";
import { useAppStore } from "../../state/store";
import { seedSymbol, setViewport, WED } from "../../test/helpers";

const panel = (section: "edit" | "overview" | "graph") =>
  document.getElementById(`calc-panel-${section}`);

describe("CalculatorPage (/next)", () => {
  it("reads the same saved levels as the current interface", async () => {
    seedSymbol(1, { level: 12, experience: 40 });
    setViewport("desktop");
    renderAt("/next");
    expect(await screen.findByRole("spinbutton", { name: "Level" })).toHaveValue(12);
  });

  it("on desktop shows the edit column and the results column together", async () => {
    setViewport("desktop");
    renderAt("/next");
    expect(await screen.findByRole("region", { name: "Symbols" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Calculator" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Power over time" })).toBeInTheDocument();
    expect(screen.queryByRole("tablist", { name: "Calculator sections" })).not.toBeInTheDocument();
  });

  it("keeps the two columns on tablets", async () => {
    setViewport("tablet");
    renderAt("/next");
    expect(await screen.findByRole("region", { name: "Overview" })).toBeInTheDocument();
    expect(screen.queryByRole("tablist", { name: "Calculator sections" })).not.toBeInTheDocument();
    // 5:7 below 1150 px, so the results column is not squeezed beside a 400 px edit column.
    const grid = screen.getByRole("region", { name: "Symbols" }).parentElement!.parentElement!;
    expect(grid).toHaveClass(
      "min-[768px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
      "min-[1150px]:grid-cols-[400px_1fr]"
    );
  });

  it("on phones switches Edit, Overview and Graph with the bottom tabs, keeping all three in the page", async () => {
    setViewport("mobile");
    renderAt("/next");
    const tabs = await screen.findByRole("tablist", { name: "Calculator sections" });
    expect(within(tabs).getByRole("tab", { name: "Edit" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tabpanel", { name: "Edit" })).not.toHaveAttribute("hidden");
    // A hidden panel has no accessible name to query by (Testing Library computes none for
    // hidden elements), so the hidden ones are found by id; each is still in the page.
    expect(panel("overview")).toHaveAttribute("hidden");
    expect(panel("overview")).toContainElement(
      screen.getByRole("region", { name: "Overview", hidden: true })
    );
    expect(panel("graph")).toHaveAttribute("hidden");
    fireEvent.click(within(tabs).getByRole("tab", { name: "Overview" }));
    expect(screen.getByRole("tabpanel", { name: "Overview" })).not.toHaveAttribute("hidden");
    expect(panel("edit")).toHaveAttribute("hidden");
  });

  it("moves between the phone tabs with the arrow keys", async () => {
    setViewport("mobile");
    renderAt("/next");
    const edit = await screen.findByRole("tab", { name: "Edit" });
    edit.focus();
    fireEvent.keyDown(edit, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    expect(screen.getByRole("tabpanel", { name: "Overview" })).not.toHaveAttribute("hidden");
  });

  it("selects a Grand symbol from the picker and follows its rules in the calculator", async () => {
    setViewport("desktop");
    renderAt("/next");
    fireEvent.click(await screen.findByRole("radio", { name: "Grand" }));
    expect(screen.getByRole("heading", { level: 2, name: "Tallahart" })).toBeInTheDocument();
    const picker = screen.getByRole("region", { name: "Symbols" });
    fireEvent.click(within(picker).getByRole("button", { name: /Geardock/ }));
    expect(useAppStore.getState().selectedId).toBe(14);
    expect(screen.getByRole("heading", { level: 2, name: "Geardock" })).toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: "Weekly" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Selector|Catalyst/ })).not.toBeInTheDocument();
  });

  it("uses no fixed width wider than a phone", async () => {
    setViewport("mobile");
    const { container } = renderAt("/next");
    await screen.findByRole("tablist", { name: "Calculator sections" }); // the lazy page is in
    for (const el of container.querySelectorAll("[class*='w-[']")) {
      // w-[…] and min-w-[…] fix a width; max-w-[…] only caps it, so it is allowed.
      for (const [, px] of el.className.matchAll(/(?:^|\s)(?:min-)?w-\[(\d+)px\]/g)) {
        expect(Number(px)).toBeLessThanOrEqual(360);
      }
    }
  });

  it("moves the Overview's done-by date as the Calculator's level and experience change (spec §4)", async () => {
    vi.setSystemTime(WED);
    seedSymbol(1, { level: 5, experience: 0, daily: true });
    setViewport("desktop");
    renderAt("/next");
    const overview = await screen.findByRole("region", { name: "Overview" });
    const row = () => within(overview).getByRole("row", { name: /Vanishing Journey/ });
    expect(row()).toHaveTextContent("2027-01-25"); // the OverviewCard.test case: 131 days

    const calculator = screen.getByRole("region", { name: "Calculator" });
    fireEvent.change(within(calculator).getByRole("spinbutton", { name: "Level" }), {
      target: { value: "19" },
    });
    // 372 symbols to max at 20 a day: 19 days.
    expect(row()).toHaveTextContent("2026-10-05");
    expect(row()).toHaveTextContent("372");

    fireEvent.change(within(calculator).getByRole("spinbutton", { name: "Experience" }), {
      target: { value: "100" },
    });
    // 272 left: 14 days.
    expect(row()).toHaveTextContent("2026-09-30");
    expect(row()).toHaveTextContent("272");
  });
});
