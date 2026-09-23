import { describe, expect, it } from "vitest";
import { rovingIndex } from "./rovingIndex";

describe("rovingIndex", () => {
  it("steps forward on ArrowRight/ArrowDown and back on ArrowLeft/ArrowUp", () => {
    expect(rovingIndex(3, 0, "ArrowRight")).toBe(1);
    expect(rovingIndex(3, 0, "ArrowDown")).toBe(1);
    expect(rovingIndex(3, 2, "ArrowLeft")).toBe(1);
    expect(rovingIndex(3, 2, "ArrowUp")).toBe(1);
  });
  it("wraps around at both ends", () => {
    expect(rovingIndex(3, 2, "ArrowRight")).toBe(0);
    expect(rovingIndex(3, 0, "ArrowLeft")).toBe(2);
  });
  it("is null for any other key", () => {
    expect(rovingIndex(3, 0, "Enter")).toBeNull();
    expect(rovingIndex(3, 0, "Tab")).toBeNull();
  });
  it("is null for an empty list instead of an index into nothing", () => {
    expect(rovingIndex(0, -1, "ArrowRight")).toBeNull();
  });
});
