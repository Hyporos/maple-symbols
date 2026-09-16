import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MdOutlineInfo } from "react-icons/md";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

describe("Tooltip", () => {
  it("throws when Trigger/Content are used outside <Tooltip>", () => {
    const silence = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TooltipTrigger>x</TooltipTrigger>)).toThrow(
      "Tooltip components must be wrapped in <Tooltip />"
    );
    silence.mockRestore();
  });

  it("opens instantly on focus and renders the content with role=tooltip", () => {
    render(
      <Tooltip>
        <TooltipTrigger>hover me</TooltipTrigger>
        <TooltipContent className="tooltip">hello there</TooltipContent>
      </Tooltip>
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.focus(screen.getByRole("button", { name: "hover me" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent("hello there");
  });

  it("opens on hover only after the 400 ms delay", () => {
    vi.useFakeTimers();
    render(
      <Tooltip>
        <TooltipTrigger>hover me</TooltipTrigger>
        <TooltipContent>delayed</TooltipContent>
      </Tooltip>
    );
    const trigger = screen.getByRole("button", { name: "hover me" });
    fireEvent.mouseEnter(trigger);
    act(() => vi.advanceTimersByTime(390));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(20));
    expect(screen.getByRole("tooltip")).toHaveTextContent("delayed");
  });

  it("with asChild and a real element, renders no extra wrapper", () => {
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <button>only me</button>
        </TooltipTrigger>
        <TooltipContent>x</TooltipContent>
      </Tooltip>
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it('with asChild and the {" "} + icon convention, falls back to a wrapper button that anchors the tooltip', () => {
    // Pins the load-bearing quirk described in AGENTS.md gotcha 4 / ARCHITECTURE D12.
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          {" "}
          <MdOutlineInfo size={20} />
        </TooltipTrigger>
        <TooltipContent>info</TooltipContent>
      </Tooltip>
    );
    const wrapper = screen.getByRole("button");
    expect(wrapper.querySelector("svg")).not.toBeNull();
    fireEvent.focus(wrapper);
    expect(screen.getByRole("tooltip")).toHaveTextContent("info");
  });
});
