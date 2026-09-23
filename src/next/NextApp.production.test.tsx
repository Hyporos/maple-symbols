import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderNextAt } from "./testing";

vi.mock("./routing", async (original) => ({
  ...(await original<typeof import("./routing")>()),
  NEXT_UI: false,
}));

describe("/next in production", () => {
  it("is an unknown page there, so it shows the edition's calculator", async () => {
    renderNextAt("/next");
    expect(screen.queryByTestId("next-app")).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
