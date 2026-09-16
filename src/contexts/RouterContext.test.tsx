import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { RouterProvider, useRouter } from "./RouterContext";

const setup = () => renderHook(() => useRouter(), { wrapper: RouterProvider });

describe("RouterContext", () => {
  it("normalises trailing slashes on the initial path", () => {
    window.history.replaceState(null, "", "/handbook/");
    const { result } = setup();
    expect(result.current.path).toBe("/handbook");
  });

  it("navigate() pushes once and ignores a repeat navigation to the same path", async () => {
    const push = vi.spyOn(window.history, "pushState");
    const { result } = setup();

    act(() => result.current.navigate("/credits"));
    await waitFor(() => expect(result.current.path).toBe("/credits"));
    act(() => result.current.navigate("/credits"));

    expect(push).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe("/credits");
    push.mockRestore();
  });

  it("follows popstate (browser back/forward)", async () => {
    const { result } = setup();
    window.history.pushState(null, "", "/handbook");
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await waitFor(() => expect(result.current.path).toBe("/handbook"));
  });

  it("is a silent no-op outside the provider (does not throw)", () => {
    const { result } = renderHook(() => useRouter());
    expect(result.current.path).toBe("/");
    expect(() => result.current.navigate("/anywhere")).not.toThrow();
  });
});
