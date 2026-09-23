import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StatBox from "./StatBox";

describe("StatBox", () => {
  it("renders its caption and value", () => {
    render(<StatBox caption="Power">1234</StatBox>);
    expect(screen.getByText("Power")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });

  // The value slot takes arbitrary content (GraphCard puts a NumberField row there), so it must
  // not be a <p>: a block child such as a <div> wrapping an <input> would be invalid HTML there.
  it("holds a block child (a div with an input) with no invalid-nesting console error", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <StatBox caption="Target">
        <div>
          <input type="number" aria-label="Target" />
        </div>
      </StatBox>
    );

    const messages = consoleError.mock.calls.map((args) => args.map(String).join(" "));
    expect(messages.some((m) => /validateDOMNesting|descendant of.*<p>/.test(m))).toBe(false);

    consoleError.mockRestore();
  });
});
