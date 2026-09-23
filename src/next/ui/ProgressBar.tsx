import { cn } from "../../lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * ProgressBar is a thin, labelled experience/progress bar. A NaN value renders as empty.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ProgressBar = ({ value, max, label, className }: ProgressBarProps) => {
  const now = Number.isFinite(value) ? Math.min(Math.max(value, 0), max) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={now}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: `${max > 0 ? (now / max) * 100 : 0}%` }}
      />
    </div>
  );
};

export default ProgressBar;
