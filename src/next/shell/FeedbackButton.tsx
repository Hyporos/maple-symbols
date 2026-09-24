import { useRef, useState } from "react";
import { HiOutlineChatBubbleLeftEllipsis } from "react-icons/hi2";
import { useMessages } from "../../i18n";
import ComingSoonNote from "./ComingSoonNote";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * FeedbackButton floats over every /next page (spec §3): reporting a wrong number or
// * suggesting an improvement is a 2.0 feature, so today it only opens a note saying so.
// * Below 1440 px it is a small round icon button that fits the page gutter without covering a
// * card; the label is then visually hidden but still names the button for a screen reader.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const FeedbackButton = () => {
  const m = useMessages().next.shell;
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-20 z-30 flex size-11 items-center justify-center gap-2 rounded-full border border-accent/40 bg-secondary text-sm text-primary shadow-[0_6px_18px_rgb(0_0_0/0.4)] hover:bg-hover min-[1440px]:size-auto min-[1440px]:px-4 min-[1440px]:py-2.5 md:bottom-6"
      >
        <HiOutlineChatBubbleLeftEllipsis size={18} />
        <span className="sr-only text-primary min-[1440px]:not-sr-only">{m.feedback}</span>
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
