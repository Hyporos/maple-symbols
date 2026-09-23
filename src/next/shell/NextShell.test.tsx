import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import NextShell from "./NextShell";
import { RouterProvider } from "../../contexts/RouterContext";
import { BreakpointProvider } from "../../contexts/BreakpointContext";

describe("NextShell", () => {
  it("wraps the page in a main landmark between the header and the footer", () => {
    render(
      <RouterProvider>
        <BreakpointProvider>
          <NextShell>
            <p>page</p>
          </NextShell>
        </BreakpointProvider>
      </RouterProvider>
    );
    expect(screen.getByRole("main")).toHaveTextContent("page");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
