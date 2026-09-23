import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface BottomTabBarProps<T extends string> {
  label: string;
  tabs: { value: T; label: string; icon: ReactNode }[];
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
// * BottomTabBar is the phone-shell's fixed section switcher: a tablist with an icon over each label.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const BottomTabBar = <T extends string>({
  label,
  tabs,
  value,
  onChange,
  idPrefix,
}: BottomTabBarProps<T>) => {
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
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/8 bg-card-grad/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div role="tablist" aria-label={label} className="flex flex-1">
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
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors motion-reduce:transition-none",
                selected ? "text-accent" : "text-tertiary hover:text-secondary"
              )}
              onClick={() => onChange(tab.value)}
              onKeyDown={handleKeyDown}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
