import type { KeyboardEvent } from "react";
import { cn } from "../../lib/utils";

interface SegmentedSwitchProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

// Arrow keys that move to the previous (-1) or next (+1) option, wrapping around.
const ARROW_STEP: Record<string, number> = {
  ArrowUp: -1,
  ArrowLeft: -1,
  ArrowDown: 1,
  ArrowRight: 1,
};

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * SegmentedSwitch is a radiogroup rendered as a pill-shaped tab strip (the family switch, tools tab).
// * Only the current option is in the tab order; the arrow keys move and select within the group.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const SegmentedSwitch = <T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedSwitchProps<T>) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = ARROW_STEP[event.key];
    if (!step) return;

    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const next = options[(index + step + options.length) % options.length];
    onChange(next.value);
    (
      event.currentTarget.parentElement?.children[
        (index + step + options.length) % options.length
      ] as HTMLElement | undefined
    )?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex gap-0.5 rounded-lg bg-dark p-1", className)}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none",
              checked ? "bg-secondary text-primary" : "text-secondary hover:text-primary"
            )}
            onClick={() => onChange(option.value)}
            onKeyDown={handleKeyDown}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedSwitch;
