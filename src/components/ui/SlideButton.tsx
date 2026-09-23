import { cn } from "../../lib/utils";

interface SlideButtonProps {
  label: string;
  selectedInfo: number;
  setSelectedInfo: (value: number) => void;
  targetInfo: number;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The SlideButton component is the main navigation button used in the Handbook and Extras pages.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const SlideButton = ({ label, selectedInfo, setSelectedInfo, targetInfo }: SlideButtonProps) => {
  return (
    <div
      className={cn(
        "group relative flex w-1/2 cursor-pointer flex-col justify-center py-4 transition-colors hover:bg-light hover:text-white md:py-5",
        selectedInfo === targetInfo && "bg-light text-white"
      )}
      onClick={() => setSelectedInfo(targetInfo)}
    >
      {/* A <p>, not a <span>: every span is accent purple (global.css), and not an <h1> (SEO-8). */}
      <p className="text-sm md:text-base">{label}</p>
      <div
        className={cn(
          "absolute right-0 bottom-0 left-0 mx-auto h-px w-0 bg-accent transition-all",
          selectedInfo === targetInfo ? "w-full" : "group-hover:w-1/4"
        )}
      ></div>
    </div>
  );
};

export default SlideButton;
