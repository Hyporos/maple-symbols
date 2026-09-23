// ---------------------------------------------------------------------------
// interactiveNesting.test.tsx — regression net for KI-007 / KI-011 / KI-012: no interactive
// element nested in a <button>, and no React DOM warning, across the calculator page and Handbook.
// ---------------------------------------------------------------------------

import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { fireEvent, render, within } from "@testing-library/react";
import Header from "../components/Header";
import Selector from "../components/Selector";
import Calculator from "../components/Calculator/Calculator";
import Tools from "../components/Calculator/Tools";
import Overview from "../components/Calculator/Overview";
import Graph from "../components/Calculator/Graph";
import Handbook from "../components/Handbook/Handbook";
import { RouterProvider } from "../contexts/RouterContext";
import { BreakpointProvider } from "../contexts/BreakpointContext";
import { mockBrowser, seedSymbol, setViewport, WED, type Viewport } from "./helpers";

// Interactive content that must never sit inside a <button>.
const NESTED = ["button button", "button input", "button a", "button [role=radio]"];

// React 19 DOM warnings: "In HTML, %s cannot be a descendant of <%s>", "cannot contain a
// nested %s", "cannot be a child of", and "Received NaN for the `%s` attribute".
const DOM_WARNING = /descendant|cannot contain|cannot be a child|Received NaN/;

let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
});

const domWarnings = () =>
  consoleError.mock.calls
    .map((args) => args.map(String).join(" "))
    .filter((message) => DOM_WARNING.test(message));

const expectNoNesting = (container: HTMLElement) => {
  for (const selector of NESTED) {
    expect(container.querySelectorAll(selector), selector).toHaveLength(0);
  }
  expect(domWarnings()).toEqual([]);
};

const renderPage = () =>
  render(
    <RouterProvider>
      <BreakpointProvider>
        <Header />
        <Selector />
        <Calculator />
        <Tools />
        <Overview />
        <Graph />
      </BreakpointProvider>
    </RouterProvider>
  );

const VIEWPORTS: Viewport[] = ["desktop", "tablet"];
const CAP_STATES = [
  { name: "locked", locked: true },
  { name: "unlocked", locked: false },
];

describe("interactive nesting on the calculator page", () => {
  for (const viewport of VIEWPORTS) {
    for (const cap of CAP_STATES) {
      it(`${viewport}, cap ${cap.name}: no nested interactive content or DOM warning`, () => {
        vi.setSystemTime(WED);
        setViewport(viewport);
        seedSymbol(3, { level: 7, experience: 30, daily: true }, false);
        seedSymbol(1, {
          level: 5,
          experience: 20,
          daily: true,
          weekly: true,
          locked: cap.locked,
        });

        const { container } = renderPage();

        // Exercise both radio groups, last to first, so the page ends on Arcane + Dynamic.
        const radios = within(container).getAllByRole("radio");
        expect(radios).toHaveLength(4);
        for (const radio of radios.reverse()) fireEvent.click(radio);

        // Expand Vanishing Journey's Overview row (the last image with that name) so its target
        // panel and input are live.
        const overviewRow = within(container)
          .getAllByAltText("Vanishing Journey")
          .at(-1)!
          .closest("button")!;
        fireEvent.click(overviewRow);
        expect(overviewRow.nextElementSibling).not.toHaveClass("hidden");

        expectNoNesting(container);
      });
    }
  }
});

describe("interactive nesting in the Handbook", () => {
  for (const viewport of VIEWPORTS) {
    it(`${viewport}: no nested interactive content or DOM warning on any tab`, () => {
      setViewport(viewport);
      seedSymbol(1, { level: 5, experience: 20 });

      const { container, getByText } = render(
        <BreakpointProvider>
          <Handbook />
        </BreakpointProvider>
      );
      expectNoNesting(container);

      fireEvent.click(getByText("Meso Cost Table"));
      expectNoNesting(container);

      fireEvent.click(getByText("Damage Ratio Table"));
      expectNoNesting(container);
    });
  }
});

describe("interactive nesting in the header's suggestion banner", () => {
  for (const viewport of ["desktop", "mobile"] as const) {
    it(`${viewport}: the banner's link and dismiss button stand alone`, () => {
      setViewport(viewport);
      mockBrowser({ languages: ["ko-KR"] });
      const { container } = render(
        <RouterProvider>
          <BreakpointProvider>
            <Header />
          </BreakpointProvider>
        </RouterProvider>
      );
      expect(within(container).getByRole("complementary")).toBeInTheDocument();
      expectNoNesting(container);
      vi.restoreAllMocks();
    });
  }
});
