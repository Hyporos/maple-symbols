import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { changelogEntries } from "../../lib/changelog";
import { setViewport } from "../../test/helpers";
import { renderNextAt as renderAt } from "../testing";

// NextApp is behind a top-level React.lazy (App.tsx), so the first query after a render
// awaits its chunk before any synchronous query runs.
describe("ExtrasPage", () => {
  it("switches Changelog and Credits with tabs and updates the URL inside /next", async () => {
    renderAt("/next/changelog");
    fireEvent.click(await screen.findByRole("tab", { name: "Credits" }));
    expect(window.location.pathname).toBe("/next/credits");
  });

  it("shows the newest changelog entry first, with its date", async () => {
    renderAt("/next/changelog");
    await screen.findByRole("tablist");
    const newest = changelogEntries[changelogEntries.length - 1]; // the newest entry is last in changelog.ts
    const first = screen.getAllByRole("heading", { level: 3 })[0];
    expect(first).toHaveTextContent(newest.version);
    expect(screen.getAllByRole("time")[0]).toHaveAttribute("datetime", newest.date);
  });

  it("shows credits directly at /credits, with its resources heading", async () => {
    renderAt("/next/credits");
    expect(await screen.findByRole("tab", { name: "Credits" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("heading", { name: "Resources Used" })).toBeInTheDocument();
  });

  it("shows a version picker with one entry at a time on phones", async () => {
    setViewport("mobile");
    renderAt("/next/changelog");
    const newest = changelogEntries[changelogEntries.length - 1];
    expect(await screen.findAllByRole("heading", { level: 3 })).toHaveLength(1);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: changelogEntries[0].version },
    });
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      changelogEntries[0].version
    );
    expect(screen.getByRole("heading", { level: 3 })).not.toHaveTextContent(newest.version);
  });
});
