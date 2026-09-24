import { useRef, useState } from "react";
import { HiOutlineChatBubbleLeftEllipsis } from "react-icons/hi2";
import { cn } from "../../lib/utils";
import { useMessages } from "../../i18n";
import ComingSoonNote from "./ComingSoonNote";

interface FeedbackButtonProps {
  /**
   * "floating": bottom-right over the page, from FLOATING_FEEDBACK_MIN_WIDTH up (NextShell).
   * "chip": a header chip like the server menu and "Aa", below it (NextHeader, and its ☰ menu).
   */
  placement: "floating" | "chip";
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * FeedbackButton is /next's feedback place (spec §3): reporting a wrong number or suggesting an
// * improvement is a 2.0 feature, so today it only opens a note saying so. It floats in the page
// * gutter where that is wide enough (round below 1440 px, labelled from there), and is a header
// * chip everywhere narrower (useFeedbackInHeader), so it never covers a card.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const FeedbackButton = ({ placement }: FeedbackButtonProps) => {
  const m = useMessages().next.shell;
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const floating = placement === "floating";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn(
          floating
            ? "fixed right-4 bottom-6 z-30 flex size-11 items-center justify-center gap-2 rounded-full border border-accent/40 bg-secondary text-sm text-primary shadow-[0_6px_18px_rgb(0_0_0/0.4)] hover:bg-hover min-[1440px]:size-auto min-[1440px]:px-4 min-[1440px]:py-2.5"
            : "flex min-h-9 items-center gap-2 rounded-lg bg-light px-3 py-2 text-sm text-secondary transition-colors hover:text-primary motion-reduce:transition-none"
        )}
      >
        <HiOutlineChatBubbleLeftEllipsis size={floating ? 18 : 16} />
        <span className={cn("sr-only", floating && "text-primary min-[1440px]:not-sr-only")}>
          {m.feedback}
        </span>
      </button>
      <ComingSoonNote
        open={open}
        onClose={() => setOpen(false)}
        title={m.feedback}
        text={m.feedbackSoon}
        anchor={buttonRef.current}
      />
    </>
  );
};

export default FeedbackButton;
