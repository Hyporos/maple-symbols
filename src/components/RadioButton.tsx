import { Dispatch, SetStateAction } from "react";
import { cn } from "../lib/utils";

interface RadioButtonProps {
  label: string;
  toggled: boolean;
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
}

const RadioButton = ({ label, toggled, value, setValue }: RadioButtonProps) => {
  return (
    <div
      className="group flex items-center space-x-4 cursor-pointer"
      onClick={() => setValue(value)}
    >
      <div
        className={cn(
          "border-[3px] border-secondary rounded-full h-[20px] w-[20px] transition-all",
          toggled ? "border-accent" : "group-hover:border-accent/25"
        )}
      />
      <p
        className={cn(
          "group-hover:text-primary transition-all",
          toggled && "text-primary"
        )}
      >
        {label}
      </p>
    </div>
  );
};

export default RadioButton;
