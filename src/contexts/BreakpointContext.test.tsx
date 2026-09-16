import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { BreakpointProvider, useBreakpoint } from "./BreakpointContext";
import { setViewport } from "../test/helpers";

const read = () =>
  renderHook(() => useBreakpoint(), { wrapper: BreakpointProvider }).result.current;

describe("BreakpointContext", () => {
  it("desktop: neither flag", () => {
    expect(read()).toEqual({ isMobile: false, isTablet: false });
  });

  it("tablet (< 1150px): isTablet only", () => {
    setViewport("tablet");
    expect(read()).toEqual({ isMobile: false, isTablet: true });
  });

  it("phone (< 768px): both flags (isTablet is a superset)", () => {
    setViewport("mobile");
    expect(read()).toEqual({ isMobile: true, isTablet: true });
  });

  it("defaults to desktop outside the provider", () => {
    setViewport("mobile");
    expect(renderHook(() => useBreakpoint()).result.current).toEqual({
      isMobile: false,
      isTablet: false,
    });
  });
});
