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
        className="flex items-center gap-2 rounded-lg bg-light px-3 py-2 text-sm text-secondary hover:text-primary"
      >
        <span className="font-semibold">Aa</span>
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
