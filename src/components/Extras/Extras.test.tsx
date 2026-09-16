import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Extras from "./Extras";
import Changelog from "./Changelog";
import Credits from "./Credits";
import { RouterProvider } from "../../contexts/RouterContext";
import { changelogEntries } from "../../lib/changelog";

const newest = changelogEntries[changelogEntries.length - 1];

const renderExtrasAt = (path: string) => {
  window.history.replaceState(null, "", path);
  return render(
    <RouterProvider>
      <Extras />
    </RouterProvider>
  );
};

describe("Extras", () => {
  it("shows the changelog on /changelog and credits on /credits", () => {
    renderExtrasAt("/changelog");
    expect(screen.getByRole("heading", { name: newest.version })).toBeInTheDocument();
    expect(screen.queryByText("Resources Used")).not.toBeInTheDocument();
  });

  it("switching tabs updates the URL", () => {
    const push = vi.spyOn(window.history, "pushState");
    renderExtrasAt("/changelog");
    fireEvent.click(screen.getByText("Credits"));
    expect(push).toHaveBeenCalledWith(null, "", "/credits");
    push.mockRestore();
  });

  it("renders credits directly at /credits", () => {
    renderExtrasAt("/credits");
    expect(screen.getByText("Resources Used")).toBeInTheDocument();
  });
});

describe("Changelog", () => {
  it("opens on the newest entry (the LAST array element) with its date and PR link", () => {
    render(<Changelog />);
    expect(screen.getByRole("heading", { name: newest.version })).toBeInTheDocument();
    expect(screen.getByText(newest.date)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", newest.link);
  });

  it("lists versions newest-first and shows an older entry's sections on click", () => {
    render(<Changelog />);
    const versions = screen.getAllByRole("button").map((b) => b.textContent);
    expect(versions[0]).toBe(newest.version);
    expect(versions[versions.length - 1]).toBe(changelogEntries[0].version);

    fireEvent.click(screen.getByRole("button", { name: "v1.1" }));
    expect(screen.getByRole("heading", { name: "v1.1" })).toBeInTheDocument();
    expect(screen.getByText("New Additions")).toBeInTheDocument();
    expect(screen.getByText("Bug Fixes / Optimizations")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://github.com/Hyporos/maple-symbols/pull/3"
    );
  });

  it("omits the additions section for a fixes-only entry", () => {
    render(<Changelog />);
    fireEvent.click(screen.getByRole("button", { name: "v1.0.1" }));
    expect(screen.queryByText("New Additions")).not.toBeInTheDocument();
    expect(screen.getByText("Bug Fixes / Optimizations")).toBeInTheDocument();
  });
});

describe("Credits", () => {
  it("links resources and acknowledgements to their sites", () => {
    render(<Credits />);
    expect(screen.getByText("MapleStory Fandom Wiki").closest("a")).toHaveAttribute(
      "href",
      "https://maplestory.fandom.com/"
    );
    const scardorRow = screen.getByText("Scardor").closest("div") as HTMLElement;
    const socials = Array.from(scardorRow.querySelectorAll("a[href]")).map((a) =>
      a.getAttribute("href")
    );
    expect(socials).toEqual([
      "https://www.twitch.tv/scardor",
      "https://www.youtube.com/user/zottenkerel",
      "https://twitter.com/scardorgaming",
    ]);
    expect(screen.getByText("Members of Saku")).toBeInTheDocument();
  });
});
