import { Dispatch, SetStateAction } from "react";
import { cn } from "../lib/utils";

interface SlideButtonProps {
  label: string;
  selectedInfo: number;
  setSelectedInfo: Dispatch<SetStateAction<number>>;
  targetInfo: number;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The SlideButton component is the main navigation button used in the Handbook and Extras pages.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const SlideButton = ({
  label,
  selectedInfo,
  setSelectedInfo,
  targetInfo,
}: SlideButtonProps) => {
  return (
    <div
      className={cn(
        "group flex flex-col justify-center hover:bg-light hover:text-white transition-colors py-4 md:py-5 cursor-pointer w-1/2 relative",
        selectedInfo === targetInfo && "bg-light text-white"
      )}
      onClick={() => setSelectedInfo(targetInfo)}
    >
      <h1 className="text-sm md:text-base">{label}</h1>
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 mx-auto h-px w-0 bg-accent transition-all",
          selectedInfo === targetInfo ? "w-full" : "group-hover:w-1/4"
        )}
      ></div>
    </div>
  );
};

export default SlideButton;
