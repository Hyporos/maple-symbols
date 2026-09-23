import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
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

// Elements a keyboard user could land on; the first one in the content gets focus on open.
const FOCUSABLE =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * Sheet is the redesign's overlay: a modal bottom sheet on phones (focus trapped, backdrop closes
// * it), a floating popover at `anchor` on desktop (follows the anchor on scroll; a click outside or
// * focus leaving closes it). Both are a labelled dialog, portalled to the body, that close on
// * Escape wherever focus is, focus the first field of their content on open, and give focus back
// * to the opener on close.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Sheet = ({ open, onClose, title, closeLabel, anchor, children }: SheetProps) => {
  const { isMobile } = useBreakpoint();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (next) => {
      if (!next) onClose();
    },
    elements: { reference: anchor ?? null },
    placement: "bottom",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });
  // Escape anywhere closes it; on phones the backdrop takes the outside click instead, so the
  // tap that closes the sheet never lands on the page underneath.
  const { getFloatingProps } = useInteractions([useDismiss(context, { outsidePress: !isMobile })]);

  // Focus the content's first field on open (the close button when it has none); give focus back
  // to whatever opened it on close, unless focus already moved on somewhere else.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    (contentRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? closeRef.current)?.focus();
    return () => {
      const active = document.activeElement;
      if (!active || active === document.body || panel?.contains(active)) previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const setPanelRef = (node: HTMLDivElement | null) => {
    panelRef.current = node;
    refs.setFloating(node);
  };

  const body = (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p id={titleId} className="text-sm font-semibold text-primary">
          {title}
        </p>
        <button ref={closeRef} type="button" aria-label={closeLabel} onClick={onClose}>
          <HiXMark size={18} />
        </button>
      </div>
      <div ref={contentRef}>{children}</div>
    </>
  );

  if (isMobile) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-40 bg-dark/70" onClick={onClose} />
        <FloatingFocusManager context={context} initialFocus={-1} returnFocus={false}>
          <div
            ref={setPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            {...getFloatingProps()}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-white/6 bg-light p-5 pb-8 shadow-[0_-8px_24px_rgb(0_0_0/0.4)] motion-safe:animate-[sheet-in_200ms_ease-out]"
          >
            {body}
          </div>
        </FloatingFocusManager>
      </>,
      document.body
    );
  }

  return createPortal(
    <FloatingFocusManager
      context={context}
      modal={false}
      closeOnFocusOut
      initialFocus={-1}
      returnFocus={false}
    >
      <div
        ref={setPanelRef}
        role="dialog"
        aria-labelledby={titleId}
        {...getFloatingProps()}
        style={floatingStyles}
        className="z-50 w-[340px] rounded-xl border border-white/6 bg-light p-5 shadow-input"
      >
        {body}
      </div>
    </FloatingFocusManager>,
    document.body
  );
};

export default Sheet;
