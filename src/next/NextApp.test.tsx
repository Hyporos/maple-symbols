import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
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
});
