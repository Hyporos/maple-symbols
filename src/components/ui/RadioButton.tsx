import type { KeyboardEvent } from "react";
import { cn } from "../../lib/utils";

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

// Arrow keys that move to the previous (-1) or next (+1) radio in the group, as native radios do.
const ARROW_STEP: Record<string, number> = {
  ArrowUp: -1,
  ArrowLeft: -1,
  ArrowDown: 1,
  ArrowRight: 1,
};

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The RadioButton component, when used as a set, provide the user with options to select or toggle.
// * Place the set inside an element with role="radiogroup" and an aria-label; only the selected
// * option is in the tab order, and the arrow keys move and select within the group.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const RadioButton = ({ label, selected, onClick }: RadioButtonProps) => {
  // Move focus and selection to the neighbouring radio of the same group (wrapping around).
  // The group is found in the DOM so the radios can sit inside tooltip triggers.
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = ARROW_STEP[event.key];
    const group = event.currentTarget.closest('[role="radiogroup"]');
    if (!step || !group) return;

    event.preventDefault();
    const radios = Array.from(group.querySelectorAll<HTMLElement>('[role="radio"]'));
    const index = radios.indexOf(event.currentTarget);
    const next = radios[(index + step + radios.length) % radios.length];
    next.focus();
    next.click();
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      className="group flex cursor-pointer items-center gap-4"
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          "h-[17.5px] w-[17.5px] rounded-full border-[3px] border-secondary transition-colors md:h-[20px] md:w-[20px]",
          selected ? "border-accent" : "group-hover:border-accent/25"
        )}
      />
      <p
        className={cn(
          "text-sm transition-colors group-hover:text-primary md:text-base",
          selected && "text-primary"
        )}
      >
        {label}
      </p>
    </button>
  );
};

export default RadioButton;
