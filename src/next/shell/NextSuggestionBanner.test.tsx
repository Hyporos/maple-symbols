import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import NextSuggestionBanner from "./NextSuggestionBanner";
import { RouterProvider } from "../../contexts/RouterContext";
import { SUGGESTION_KEY } from "../../lib/suggestion";
import { mockBrowser } from "../../test/helpers";

const renderAt = (path: string) => {
  window.history.replaceState(null, "", path);
  return render(
    <RouterProvider>
      <NextSuggestionBanner />
    </RouterProvider>
  );
};

afterEach(() => vi.restoreAllMocks());

describe("NextSuggestionBanner", () => {
  it("links to the same /next page in the suggested edition", () => {
    mockBrowser({ languages: ["ko-KR", "ko"] });
    renderAt("/next/handbook");
    expect(screen.getByRole("link", { name: "KMS 버전으로 이동" })).toHaveAttribute(
      "href",
      "/kms/next/handbook"
    );
    expect(screen.getByRole("complementary")).toHaveAttribute("lang", "ko");
  });

  it("stays in /next from another edition's calculator too", () => {
    mockBrowser({ languages: ["en-US", "en"], timeZone: "Asia/Singapore" });
    renderAt("/kms/next");
    expect(screen.getByRole("link", { name: "Switch to MSEA" })).toHaveAttribute(
      "href",
      "/msea/next"
    );
  });

  it("sits in the page's flow, not positioned over the page", () => {
    mockBrowser({ languages: ["ko-KR", "ko"] });
    renderAt("/next/handbook");
    expect(screen.getByRole("complementary").className).not.toMatch(/absolute|fixed|sticky/);
  });

  it("hides when dismissed and remembers the answer, like the shared banner", () => {
    mockBrowser({ languages: ["ja-JP"] });
    renderAt("/next");
    fireEvent.click(screen.getByRole("button", { name: "この提案を閉じる" }));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(SUGGESTION_KEY)).toBe("jms");
  });

  it("shows nothing on the visitor's own server's edition", () => {
    mockBrowser({ languages: ["ko-KR"], timeZone: "Asia/Seoul" });
    renderAt("/kms/next/handbook");
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });
});
