// ---------------------------------------------------------------------------
// rovingIndex.ts — the arrow-key step shared by the kit's radiogroup and tablists.
//
// SegmentedSwitch, Tabs and BottomTabBar keep only the current option in the tab order and let
// the arrow keys move between options, wrapping around at both ends.
// ---------------------------------------------------------------------------

// Arrow keys that move to the previous (-1) or next (+1) option.
const ARROW_STEP: Record<string, number> = {
  ArrowUp: -1,
  ArrowLeft: -1,
  ArrowDown: 1,
  ArrowRight: 1,
};

/**
 * The option an arrow key moves to from `index` in a list of `length`, wrapping around; null
 * when the key is not an arrow or the list is empty (nothing to move to).
 */
export function rovingIndex(length: number, index: number, key: string): number | null {
  const step = ARROW_STEP[key];
  if (!step || length === 0) return null;
  return (index + step + length) % length;
}
