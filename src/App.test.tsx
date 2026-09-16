import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { RouterProvider } from "./contexts/RouterContext";

const renderAt = (path: string) => {
  window.history.replaceState(null, "", path);
  return render(
    <RouterProvider>
      <App />
    </RouterProvider>
  );
};

describe("App routing", () => {
  it("/handbook shows the symbol picker and the handbook tabs", () => {
    renderAt("/handbook");
    expect(screen.getByText("Experience Table")).toBeInTheDocument();
    expect(screen.getByAltText("Vanishing Journey")).toBeInTheDocument();
  });

  it("/credits shows the credits tab", () => {
    renderAt("/credits");
    expect(screen.getByText("Resources Used")).toBeInTheDocument();
  });

  it("an unknown path falls through to the calculator page", async () => {
    renderAt("/does-not-exist");
    expect(await screen.findByText("DISABLED", {}, { timeout: 15_000 })).toBeInTheDocument();
    expect(screen.getByText("Symbol Overview")).toBeInTheDocument();
  }, 20_000);
});

describe("App on Samsung Internet", () => {
  afterEach(() => {
    delete (navigator as unknown as { userAgent?: string }).userAgent;
  });

  it("warns once that the forced dark mode breaks the colours", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S911B) SamsungBrowser/24.0",
      configurable: true,
    });
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderAt("/credits");
    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert.mock.calls[0][0]).toMatch(/Samsung Internet/);
    alert.mockRestore();
  });
});
