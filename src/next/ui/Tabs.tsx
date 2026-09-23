import type { KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { rovingIndex } from "./rovingIndex";

interface TabsProps<T extends string> {
  label: string;
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  idPrefix: string;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * Tabs renders a tablist whose panels the caller owns; panel ids follow `${idPrefix}-panel-${value}`
// * so a `Tabs` and its panel markup stay linked without the caller re-deriving the id scheme.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Tabs = <T extends string>({ label, tabs, value, onChange, idPrefix }: TabsProps<T>) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = tabs.findIndex((tab) => tab.value === value);
    const next = rovingIndex(tabs.length, index, event.key);
    if (next === null) return;

    event.preventDefault();
    onChange(tabs[next].value);
    (event.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
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
