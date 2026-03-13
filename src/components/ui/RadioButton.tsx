import { cn } from "../../lib/utils";

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The RadioButton component, when used as a set, provide the user with options to select or toggle
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const RadioButton = ({ label, selected, onClick }: RadioButtonProps) => {
  return (
    <div className="group flex cursor-pointer items-center gap-4" onClick={onClick}>
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
    </div>
  );
};

export default RadioButton;
