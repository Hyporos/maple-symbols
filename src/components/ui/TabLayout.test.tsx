import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TabLayout from "./TabLayout";
import { BreakpointProvider } from "../../contexts/BreakpointContext";
import { setViewport } from "../../test/helpers";

const tabs = [
  { label: "Experience Table", mobileLabel: "Exp Table", content: <p>first</p> },
  { label: "Meso Cost Table", content: <p>second</p> },
];

describe("TabLayout", () => {
  it("uncontrolled: shows tab 1 by default and switches on click", () => {
    render(<TabLayout tabs={tabs} />);
    expect(screen.getByText("first")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Meso Cost Table"));

    expect(screen.getByText("second")).toBeInTheDocument();
    expect(screen.queryByText("first")).not.toBeInTheDocument();
  });

  it("controlled: reports clicks through onTabChange and does not switch by itself", () => {
    const onTabChange = vi.fn();
    render(<TabLayout tabs={tabs} activeTab={2} onTabChange={onTabChange} />);
    expect(screen.getByText("second")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Experience Table"));

    expect(onTabChange).toHaveBeenCalledWith(1);
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("uses mobileLabel on a phone viewport", () => {
    setViewport("mobile");
    render(
      <BreakpointProvider>
        <TabLayout tabs={tabs} />
      </BreakpointProvider>
    );
    expect(screen.getByText("Exp Table")).toBeInTheDocument();
    expect(screen.getByText("Meso Cost Table")).toBeInTheDocument(); // no mobileLabel → falls back
  });
});
