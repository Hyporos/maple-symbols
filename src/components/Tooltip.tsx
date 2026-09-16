import * as React from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  useMergeRefs,
  useTransitionStyles,
} from "@floating-ui/react";
import type { Placement } from "@floating-ui/react";

interface TooltipOptions {
  initialOpen?: boolean;
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Elements `TooltipTrigger` can render when it has to provide its own wrapper. */
type TriggerElement = "button" | "div" | "span";

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Tooltip component is part of Floating UI. It includes Tooltip, TooltipTrigger & TooltipContent.
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

export function useTooltip({
  initialOpen = false,
  placement = "top",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: TooltipOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  // No arrow is rendered, so this is the whole gap between trigger and tooltip.
  const GAP = 12;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [offset(GAP), flip(), shift()],
  });

  const context = data.context;

  const hover = useHover(context, {
    move: false,
    enabled: controlledOpen == null,
    delay: {
      open: 400,
      close: 250,
    },
  });
  const focus = useFocus(context, {
    enabled: controlledOpen == null,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const interactions = useInteractions([hover, focus, dismiss, role]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
    }),
    [open, setOpen, interactions, data]
  );
}

type ContextType = ReturnType<typeof useTooltip> | null;

const TooltipContext = React.createContext<ContextType>(null);

export const useTooltipState = () => {
  const context = React.useContext(TooltipContext);

  if (context == null) {
    throw new Error("Tooltip components must be wrapped in <Tooltip />");
  }

  return context;
};

export function Tooltip({ children, ...options }: { children: React.ReactNode } & TooltipOptions) {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const tooltip = useTooltip(options);
  return <TooltipContext.Provider value={tooltip}>{children}</TooltipContext.Provider>;
}

export const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLProps<HTMLElement> & { asChild?: boolean; as?: TriggerElement }
>(function TooltipTrigger({ children, asChild = false, as = "button", ...props }, propRef) {
  const state = useTooltipState();

  // React 19 exposes an element's ref as a regular prop (element.ref is gone).
  const childrenRef = React.isValidElement<{ ref?: React.Ref<HTMLElement> }>(children)
    ? children.props.ref
    : undefined;
  const ref = useMergeRefs([state.refs.setReference, propRef, childrenRef]);

  // `asChild` allows the user to pass any element as the anchor
  if (asChild && React.isValidElement<Record<string, unknown>>(children)) {
    return React.cloneElement(
      children,
      state.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        "data-state": state.open ? "open" : "closed",
      } as React.HTMLProps<Element>)
    );
  }

  // Otherwise the trigger provides its own anchor element. `as` picks the tag so a
  // trigger wrapping inputs or buttons does not nest interactive content (KI-007).
  return React.createElement(
    as,
    {
      ref,
      // The user can style the trigger based on the state
      "data-state": state.open ? "open" : "closed",
      ...state.getReferenceProps(props),
    } as React.HTMLProps<HTMLElement>,
    children
  );
});

export const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  function TooltipContent(props, propRef) {
    const state = useTooltipState();
    const ref = useMergeRefs([state.refs.setFloating, propRef]);

    const { isMounted, styles } = useTransitionStyles(state.context, {
      duration: 250,
      initial: {
        opacity: 0,
      },
    });

    if (!isMounted) return null;

    return (
      <FloatingPortal>
        <div
          ref={ref}
          style={{
            ...state.floatingStyles,
            ...props.style,
            ...styles,
          }}
          {...state.getFloatingProps(props)}
        />
      </FloatingPortal>
    );
  }
);
