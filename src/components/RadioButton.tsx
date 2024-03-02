import { Dispatch, SetStateAction } from "react";
import { cn } from "../lib/utils";

interface RadioButtonProps {
  label: string;
  selected: boolean;
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The RadioButton component, when used as a set, provide the user with options to select or toggle
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const RadioButton = ({
  label,
  selected,
  value,
  setValue,
}: RadioButtonProps) => {
  return (
    <div
      className="group flex items-center gap-4 cursor-pointer"
      onClick={() => setValue(value)}
    >
      <div
        className={cn(
          "border-[3px] border-secondary rounded-full h-[17.5px] w-[17.5px] md:h-[20px] md:w-[20px] transition-colors",
          selected ? "border-accent" : "group-hover:border-accent/25"
        )}
      />
      <p
        className={cn(
          "text-sm md:text-base group-hover:text-primary transition-colors",
          selected && "text-primary"
        )}
      >
        {label}
      </p>
    </div>
  );
};

export default RadioButton;
