import type { ReactNode } from "react";

interface ProgressRingProps {
  value: number;
  max: number;
  label: string;
  size?: number;
  children: ReactNode;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * ProgressRing wraps its child (a level number, an icon) with a conic-gradient progress ring.
// * value/max clamp to 0..1; a NaN or non-finite value renders an empty ring rather than crashing.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ProgressRing = ({ value, max, label, size = 56, children }: ProgressRingProps) => {
  const fraction = Number.isFinite(value) && max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;

  return (
    <span
      role="img"
      aria-label={label}
      data-fraction={String(fraction)}
      className="grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--color-accent) ${fraction * 360}deg, var(--background-color-secondary) 0)`,
      }}
    >
      <span
        className="grid place-items-center rounded-full bg-card"
        style={{ width: size - 6, height: size - 6 }}
      >
        {children}
      </span>
    </span>
  );
};

export default ProgressRing;
