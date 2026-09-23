import { describe, expect, it } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { renderNextAt as renderAt } from "../testing";
import { useAppStore } from "../../state/store";
import { seedSymbol, setViewport } from "../../test/helpers";

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
    fireEvent.click(screen.getByRole("button", { name: /Geardock/ }));
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
      const px = Number(/w-\[(\d+)px\]/.exec(el.className)?.[1] ?? 0);
      expect(px).toBeLessThanOrEqual(360);
    }
  });
});
