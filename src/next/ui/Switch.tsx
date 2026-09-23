import { cn } from "../../lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  /** Id of an element that describes the switch (e.g. the quest it toggles). */
  describedBy?: string;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * Switch is the redesign's on/off toggle for a quest flag (daily, weekly, extra).
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Switch = ({ checked, onChange, label, disabled, describedBy }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    aria-describedby={describedBy}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-40 motion-reduce:transition-none",
      checked ? "bg-accent/35" : "bg-secondary"
    )}
  >
    <span
      className={cn(
        "absolute top-0.5 left-0.5 size-4 rounded-full transition-transform motion-reduce:transition-none",
        checked ? "translate-x-4 bg-accent" : "bg-tertiary"
      )}
    />
  </button>
);

export default Switch;
