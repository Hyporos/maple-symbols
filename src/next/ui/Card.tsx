import { useId, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  label?: string;
  className?: string;
  children: ReactNode;
  as?: "section" | "div";
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * Card is the redesign's surface: the gradient card with a hairline edge and a faint top highlight.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Card = ({ label, className, children, as = "div" }: CardProps) => {
  const id = useId();
  const Tag = as;
  return (
    <Tag
      aria-labelledby={label ? id : undefined}
      className={cn(
        "rounded-xl border border-white/6 bg-linear-to-t from-card to-card-grad p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_8px_24px_rgb(0_0_0/0.25)] md:p-5",
        className
      )}
    >
      {label && (
        <p id={id} className="mb-3 text-[11px] tracking-[0.08em] text-tertiary uppercase">
          {label}
        </p>
      )}
      {children}
    </Tag>
  );
};

export default Card;
