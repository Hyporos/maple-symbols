import { describe, expect, it } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { REGION_PROFILES } from "../../lib/regions";
import { seedSymbol } from "../../test/helpers";
import { useAppStore } from "../../state/store";
import { renderNextAt as renderAt } from "../testing";

// NextApp is behind a top-level React.lazy (App.tsx), so the first query after a render
// awaits its chunk before any synchronous query runs.
describe("HandbookPage", () => {
  it("switches Experience, Meso cost and Damage ratio with tabs, each with the family switch", async () => {
    renderAt("/next/handbook");
    const tabs = await screen.findByRole("tablist", { name: "Handbook" });
    expect(within(tabs).getByRole("tab", { name: "Experience Table" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("radiogroup", { name: "Symbol family" })).toBeInTheDocument();
    fireEvent.click(within(tabs).getByRole("tab", { name: "Meso Cost Table" }));
    expect(screen.getByRole("table", { name: /Meso/ })).toBeInTheDocument();
  });

  it("highlights the selected symbol's current level", async () => {
    seedSymbol(1, { level: 12, experience: 0 });
    renderAt("/next/handbook");
    expect(await screen.findByRole("row", { current: true })).toHaveTextContent("12");
  });

  it("shows no highlighted row while the selected symbol is unset (NaN level)", async () => {
    seedSymbol(1, { level: NaN, experience: NaN });
    renderAt("/next/handbook");
    await screen.findByRole("tablist");
    expect(screen.queryByRole("row", { current: true })).not.toBeInTheDocument();
  });

  it("shows Grand Sacred on the Sacred EXP table and with their own costs", async () => {
    renderAt("/next/handbook");
    fireEvent.click(await screen.findByRole("radio", { name: "Grand" }));
    expect(screen.getByRole("table")).toHaveTextContent("1,100"); // 10 → 11 on the Sacred table

    fireEvent.click(
      within(screen.getByRole("tablist")).getByRole("tab", { name: "Meso Cost Table" })
    );
    // Tallahart is selected by default in Grand mode (DEFAULT_SELECTION.grand = 13).
    expect(screen.getByRole("button", { name: "Tallahart" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("table")).toHaveTextContent("113,600,000");
  });

  it("hides a server's meso costs when nobody has published them (REGIONS D-6)", async () => {
    const status = REGION_PROFILES.cms.status;
    const saved = status.mesosArcane;
    status.mesosArcane = "unpublished";
    try {
      useAppStore.getState().setRegion("cms");
      renderAt("/next/handbook");
      const tabs = await screen.findByRole("tablist");
      fireEvent.click(within(tabs).getByRole("tab", { name: "Meso Cost Table" }));
      expect(screen.getByText(/not published yet for/)).toHaveTextContent(
        "Meso costs are not published yet for CMS."
      );
      const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1); // skip the header row
      for (const row of rows) {
        for (const cell of within(row).getAllByRole("cell").slice(1))
          expect(cell).toHaveTextContent("-");
      }
    } finally {
      status.mesosArcane = saved;
    }
  });

  it("has no fixed height: the card grows with its table", async () => {
    const { container } = renderAt("/next/handbook");
    await screen.findByRole("tablist");
    expect(container.innerHTML).not.toMatch(/h-\[(650|700|535|555)px\]/);
  });

  it("opens the Damage ratio tab via click and shows real ratio rows", async () => {
    renderAt("/next/handbook");
    const tabs = await screen.findByRole("tablist", { name: "Handbook" });
    fireEvent.click(within(tabs).getByRole("tab", { name: "Damage Ratio Table" }));

    const table = screen.getByRole("table", { name: /Damage/ });
    const rows = within(table).getAllByRole("row").slice(1); // skip the header row
    expect(rows).toHaveLength(9); // arcane: nine power bands (src/lib/ratioData.ts)
    // A known arcane band: 100% - 109% arcane power → 100% dealt, 100% taken.
    expect(
      within(rows[5])
        .getAllByRole("cell")
        .map((c) => c.textContent)
    ).toEqual(["100% - 109%", "100%", "100%"]);
  });

  it("opens the Damage ratio tab via arrow keys from the previous tab", async () => {
    renderAt("/next/handbook");
    const tabs = await screen.findByRole("tablist", { name: "Handbook" });
    const costTab = within(tabs).getByRole("tab", { name: "Meso Cost Table" });
    fireEvent.click(costTab);
    fireEvent.keyDown(within(tabs).getByRole("tab", { name: "Meso Cost Table" }), {
      key: "ArrowRight",
    });

    expect(within(tabs).getByRole("tab", { name: "Damage Ratio Table" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("table", { name: /Damage/ })).toBeInTheDocument();
  });

  it("shows the Sacred ratio bands on the Damage ratio tab when Grand is selected (the fold)", async () => {
    renderAt("/next/handbook");
    const tabs = await screen.findByRole("tablist", { name: "Handbook" });
    fireEvent.click(within(tabs).getByRole("tab", { name: "Damage Ratio Table" }));
    fireEvent.click(screen.getByRole("radio", { name: "Grand" }));

    const table = screen.getByRole("table", { name: /Damage/ });
    const rows = within(table).getAllByRole("row").slice(1); // skip the header row
    expect(rows).toHaveLength(16); // Grand folds to Sacred: sixteen difference bands
    // A known sacred band: sacredPower 0 → 100% dealt, 100% taken (src/lib/ratioData.ts).
    expect(
      within(rows[10])
        .getAllByRole("cell")
        .map((c) => c.textContent)
    ).toEqual(["0", "100%", "100%"]);
  });

  it("heads the Exp and Cost tabs with the Grand copy when Grand is selected", async () => {
    renderAt("/next/handbook");
    const tabs = await screen.findByRole("tablist", { name: "Handbook" });
    const heading = () => screen.getByRole("heading", { level: 2 });
    expect(heading()).toHaveTextContent("Arcane Symbols");

    fireEvent.click(screen.getByRole("radio", { name: "Grand" }));
    expect(heading()).toHaveTextContent(/^Grand Sacred Symbols$/);
    fireEvent.click(within(tabs).getByRole("tab", { name: "Meso Cost Table" }));
    expect(heading()).toHaveTextContent(/^Grand Sacred Symbols$/);
    // The ratio bands are the region's, so that heading stays the region.
    fireEvent.click(within(tabs).getByRole("tab", { name: "Damage Ratio Table" }));
    expect(heading()).toHaveTextContent(/^Grandis$/);

    fireEvent.click(screen.getByRole("radio", { name: "Sacred" }));
    fireEvent.click(within(tabs).getByRole("tab", { name: "Experience Table" }));
    expect(heading()).toHaveTextContent(/^Sacred Symbols$/);
  });

  it("points every aria-controls at a panel that is in the page", async () => {
    renderAt("/next/handbook");
    const tabs = await screen.findByRole("tablist", { name: "Handbook" });
    for (const tab of within(tabs).getAllByRole("tab")) {
      const controls = tab.getAttribute("aria-controls");
      if (controls) expect(document.getElementById(controls)).toHaveAttribute("role", "tabpanel");
    }
  });
});
