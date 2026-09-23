import type { ChangeEvent, WheelEvent } from "react";
import { cn } from "../../lib/utils";

interface NumberFieldProps {
  value: number;
  onChange: (raw: string) => void;
  placeholder: string;
  label: string;
  className?: string;
  disabled?: boolean;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * NumberField is a number input for level/experience entry. NaN renders as blank, and the mouse
// * wheel blurs it so scrolling the page never changes the value.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const NumberField = ({
  value,
  onChange,
  placeholder,
  label,
  className,
  disabled,
}: NumberFieldProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);
  const handleWheel = (event: WheelEvent<HTMLInputElement>) => event.currentTarget.blur();

  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={label}
      placeholder={placeholder}
      value={Number.isNaN(value) ? "" : value}
      onChange={handleChange}
      onWheel={handleWheel}
      disabled={disabled}
      className={cn(
        "w-full rounded-lg bg-secondary px-3 py-2 text-center text-sm text-secondary outline-hidden transition-colors hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary motion-reduce:transition-none",
        className
      )}
    />
  );
};

export default NumberField;
