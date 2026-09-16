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

  it("without asChild, wraps an icon in a button that anchors the tooltip", () => {
    // The convention that replaced the {" "} hack (AGENTS.md gotcha 4 / ARCHITECTURE D12):
    // an icon is a function component, so the trigger renders its own anchor element.
    render(
      <Tooltip>
        <TooltipTrigger>
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

  it('with as="div", wraps interactive content without nesting it in a button', () => {
    render(
      <Tooltip>
        <TooltipTrigger as="div" className="cursor-default">
          <input placeholder="Level" />
          <button>inner</button>
        </TooltipTrigger>
        <TooltipContent>level</TooltipContent>
      </Tooltip>
    );
    const input = screen.getByPlaceholderText("Level");
    const wrapper = input.parentElement!;
    expect(wrapper.tagName).toBe("DIV");
    expect(wrapper).toHaveClass("cursor-default");
    expect(screen.getAllByRole("button")).toHaveLength(1);
    // Focus bubbles out of the input, so the wrapper still anchors and opens the tooltip.
    fireEvent.focus(input);
    expect(screen.getByRole("tooltip")).toHaveTextContent("level");
  });
});
