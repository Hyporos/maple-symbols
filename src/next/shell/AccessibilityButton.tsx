import { useRef, useState } from "react";
import { useMessages } from "../../i18n";
import ComingSoonNote from "./ComingSoonNote";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * AccessibilityButton is the header's "Aa" place: higher contrast and larger text are a 2.0
// * feature, so today it only opens a note saying so (spec §3).
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const AccessibilityButton = () => {
  const m = useMessages().next.shell;
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={m.accessibility}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-light px-3 py-2 text-sm text-secondary transition-colors hover:text-primary motion-reduce:transition-none"
      >
        {/* A plain <b>, not a <span>: every <span> is accent purple globally (AGENTS.md
            gotcha 5), which would make "Aa" stand out from the grey character and server
            chips beside it. <b> carries no such override, so it inherits this button's
            colour and hover like its siblings' icon-plus-text children do. */}
        <b className="font-semibold">Aa</b>
      </button>
      <ComingSoonNote
        open={open}
        onClose={() => setOpen(false)}
        title={m.accessibility}
        text={m.accessibilitySoon}
        anchor={buttonRef.current}
      />
    </>
  );
};

export default AccessibilityButton;
