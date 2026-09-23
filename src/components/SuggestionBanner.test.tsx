import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import SuggestionBanner from "./SuggestionBanner";
import { RouterProvider } from "../contexts/RouterContext";
import { SUGGESTION_KEY } from "../lib/suggestion";
import { mockBrowser } from "../test/helpers";

/** Pretend to be a browser with these languages in this time zone. */
const browser = (languages: string[], timeZone = "America/Toronto") =>
  mockBrowser({ languages, timeZone });

const renderAt = (path: string) => {
  window.history.replaceState(null, "", path);
  return render(
    <RouterProvider>
      <SuggestionBanner />
    </RouterProvider>
  );
};

afterEach(() => vi.restoreAllMocks());

describe("SuggestionBanner", () => {
  it("suggests a Korean browser the KMS version of the same page", () => {
    browser(["ko-KR", "ko"]);
    renderAt("/handbook");
    expect(screen.getByText("KMS").closest("p")).toHaveTextContent(
      "KMS에서 플레이하시나요? 이 페이지는 KMS 버전이 있어요."
    );
    expect(screen.getByRole("link", { name: "KMS 버전으로 이동" })).toHaveAttribute(
      "href",
      "/kms/handbook"
    );
    // Written in the suggested edition's language (Brian, 2026-09-23), so a Korean browser
    // on the GMS page reads Korean.
    expect(screen.getByRole("complementary")).toHaveAttribute("lang", "ko");
  });

  it("suggests MSEA from a Singapore time zone on an English browser", () => {
    browser(["en-US", "en"], "Asia/Singapore");
    renderAt("/");
    expect(screen.getByRole("link", { name: "Switch to MSEA" })).toHaveAttribute("href", "/msea");
  });

  it("shows nothing on the visitor's own server's edition, or with nothing to go on", () => {
    browser(["ko-KR"], "Asia/Seoul");
    const { unmount } = renderAt("/kms");
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    unmount();

    browser(["en"], "America/Chicago");
    renderAt("/msea/handbook");
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("hides when dismissed and does not come back", () => {
    browser(["ja-JP"]);
    const { unmount } = renderAt("/");
    fireEvent.click(screen.getByRole("button", { name: "この提案を閉じる" }));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(SUGGESTION_KEY)).toBe("jms");
    unmount();

    renderAt("/handbook");
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("remembers the edition taken, so returning to this page does not ask again", () => {
    browser(["zh-TW"]);
    renderAt("/");
    const link = screen.getByRole("link", { name: "前往 TMS 版本" });
    link.addEventListener("click", (e) => e.preventDefault()); // jsdom cannot load another page
    fireEvent.click(link);
    expect(window.localStorage.getItem(SUGGESTION_KEY)).toBe("tms");
  });

  it("still suggests an edition other than the one dismissed", () => {
    window.localStorage.setItem(SUGGESTION_KEY, "kms");
    browser(["zh-CN"]);
    renderAt("/");
    expect(screen.getByRole("link", { name: "前往 CMS 版本" })).toBeInTheDocument();
  });

  it("renders nothing before mount, so prebuilt HTML and hydration agree", () => {
    browser(["ko-KR"], "Asia/Seoul");
    const html = renderToString(
      <RouterProvider initialPath="/">
        <SuggestionBanner />
      </RouterProvider>
    );
    expect(html).toBe("");
  });
});
