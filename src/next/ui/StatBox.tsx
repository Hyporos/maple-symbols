import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface StatBoxProps {
  caption: string;
  children: ReactNode;
  className?: string;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * StatBox is a small labelled figure (a stat, a target date) inside a Card.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const StatBox = ({ caption, children, className }: StatBoxProps) => (
  <div className={cn("rounded-lg bg-dark px-3 py-2", className)}>
    <p className="text-xs text-tertiary">{caption}</p>
    <div className="text-sm text-primary">{children}</div>
  </div>
);

export default StatBox;
