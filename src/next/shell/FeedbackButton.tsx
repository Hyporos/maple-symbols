import { useRef, useState } from "react";
import { HiOutlineChatBubbleLeftEllipsis } from "react-icons/hi2";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useMessages } from "../../i18n";
import ComingSoonNote from "./ComingSoonNote";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * FeedbackButton floats over every /next page (spec §3): reporting a wrong number or
// * suggesting an improvement is a 2.0 feature, so today it only opens a note saying so.
// * On phones the label is visually hidden so the icon stays a small round button, but it
// * keeps naming the button for a screen reader.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const FeedbackButton = () => {
  const m = useMessages().next.shell;
  const { isMobile } = useBreakpoint();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-20 z-30 flex items-center gap-2 rounded-full border border-accent/40 bg-secondary px-4 py-2.5 text-sm text-primary shadow-[0_6px_18px_rgb(0_0_0/0.4)] hover:bg-hover md:bottom-6"
      >
        <HiOutlineChatBubbleLeftEllipsis />
        {isMobile ? <span className="sr-only">{m.feedback}</span> : m.feedback}
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
