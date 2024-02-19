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
      className="flex items-center space-x-4 cursor-pointer"
      onClick={() => setValue(value)}
    >
      <div
        className={cn(
          "border-[3px] border-secondary rounded-full h-[20px] w-[20px] transition-all",
          toggled && "bg-accent"
        )}
      />
      <p>{label}</p>
    </div>
  );
};

export default RadioButton;
