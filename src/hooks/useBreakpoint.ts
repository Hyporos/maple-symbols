// ---------------------------------------------------------------------------
// useBreakpoint.ts — Re-exports the hook from BreakpointContext.
//
// All components import from this path; the actual listener logic lives in
// BreakpointContext so only two matchMedia listeners exist for the whole app.
// ---------------------------------------------------------------------------

export { useBreakpoint } from "../contexts/BreakpointContext";
