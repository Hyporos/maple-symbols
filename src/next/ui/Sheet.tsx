import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFloating, offset, flip, shift } from "@floating-ui/react";
import { HiXMark } from "react-icons/hi2";
import { useBreakpoint } from "../../hooks/useBreakpoint";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  anchor?: HTMLElement | null;
  children: ReactNode;
}

// Elements a keyboard user could land on; the first one found gets focus when the sheet opens.
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * Sheet is the redesign's overlay: a bottom sheet on phones, a floating popover at `anchor` on
// * desktop. Both are a labelled dialog, portalled to the body, that takes focus on open, returns it
// * to the opener on close, and closes on Escape or its own close button.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Sheet = ({ open, onClose, title, closeLabel, anchor, children }: SheetProps) => {
  const { isMobile } = useBreakpoint();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    elements: { reference: anchor ?? null },
    placement: "bottom",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  // Focus the sheet on open; give focus back to whatever opened it on close.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return () => previous?.focus?.();
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") onClose();
  };

  const setPanelRef = (node: HTMLDivElement | null) => {
    panelRef.current = node;
    refs.setFloating(node);
  };

  const header = (
    <div className="mb-4 flex items-center justify-between">
      <p id={titleId} className="text-sm font-semibold text-primary">
        {title}
      </p>
      <button type="button" aria-label={closeLabel} onClick={onClose}>
        <HiXMark size={18} />
      </button>
    </div>
  );

  if (isMobile) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
        <div
          ref={setPanelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={handleKeyDown}
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-white/6 bg-light p-5 pb-8 shadow-[0_-8px_24px_rgb(0_0_0/0.4)] motion-safe:animate-[sheet-in_200ms_ease-out]"
        >
          {header}
          {children}
        </div>
      </>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={setPanelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      style={floatingStyles}
      className="z-50 w-[340px] rounded-xl border border-white/6 bg-light p-5 shadow-input"
    >
      {header}
      {children}
    </div>,
    document.body
  );
};

export default Sheet;
