import type { KeyboardEvent } from "react";
import { cn } from "../../lib/utils";

interface TabsProps<T extends string> {
  label: string;
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  idPrefix: string;
}

// Arrow keys that move to the previous (-1) or next (+1) tab, wrapping around.
const ARROW_STEP: Record<string, number> = {
  ArrowUp: -1,
  ArrowLeft: -1,
  ArrowDown: 1,
  ArrowRight: 1,
};

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * Tabs renders a tablist whose panels the caller owns; panel ids follow `${idPrefix}-panel-${value}`
// * so a `Tabs` and its panel markup stay linked without the caller re-deriving the id scheme.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Tabs = <T extends string>({ label, tabs, value, onChange, idPrefix }: TabsProps<T>) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = ARROW_STEP[event.key];
    if (!step) return;

    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.value === value);
    const next = tabs[(index + step + tabs.length) % tabs.length];
    onChange(next.value);
    (
      event.currentTarget.parentElement?.children[(index + step + tabs.length) % tabs.length] as
        HTMLElement | undefined
    )?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="flex border-b border-white/8">
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.value}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${tab.value}`}
            tabIndex={selected ? 0 : -1}
            className={cn(
              "flex-1 py-3 text-sm transition-colors motion-reduce:transition-none",
              selected
                ? "text-primary shadow-[inset_0_-2px_0_var(--color-accent)]"
                : "text-tertiary hover:text-secondary"
            )}
            onClick={() => onChange(tab.value)}
            onKeyDown={handleKeyDown}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
