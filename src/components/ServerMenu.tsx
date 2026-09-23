import { useState } from "react";
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { FaEarthAmericas } from "react-icons/fa6";
import { cn } from "../lib/utils";
import { editionOf, EDITIONS, hrefFor, routeFor } from "../lib/routes";
import { REGIONS, type Region } from "../lib/regions";
import { useEdition } from "../hooks/useEdition";
import { useAppStore } from "../state/store";
import { interpolate, useMessages } from "../i18n";

interface ServerMenuProps {
  /** Icon-less square button, for the phone header. */
  compact?: boolean;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The header's server menu (docs/REGIONS.md D-2). "Site version" links to the same page in
// * each edition (a full page load, so the new page arrives with its own language and head).
// * "Numbers from" swaps only the numbers, kept in this browser; the page's own server clears it.
// * The panel is portalled to <body> (floating-ui, like Tooltip): the header clips its own overflow
// * for the phone menu's height animation, which hid an absolutely positioned panel.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ServerMenu = ({ compact = false }: ServerMenuProps) => {
  const m = useMessages().shell;
  const { edition, path } = useEdition();
  const region = useAppStore((s) => s.region);
  const setRegion = useAppStore((s) => s.setRegion);

  const [open, setOpen] = useState(false);

  // Opens on click; Escape and a click outside close it.
  const { refs, floatingStyles, context } = useFloating({
    placement: "bottom-end",
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ]);

  const page = routeFor(path).path;
  const override = region !== edition.region;

  return (
    <>
      <button
        ref={refs.setReference}
        aria-label={m.serverMenu}
        {...getReferenceProps()}
        className={cn(
          "flex h-[40px] min-w-[80px] items-center justify-center gap-3 bg-dark px-3",
          compact && "h-[45px] min-w-[45px] px-2"
        )}
      >
        {!compact && <FaEarthAmericas size={23} className="fill-basic/75" />}
        <p>
          {edition.name}
          {override && <b className="text-accent">{` · ${editionOf(region).name}`}</b>}
        </p>
      </button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 w-[230px] rounded-lg bg-[#111111] p-3 text-sm shadow-input"
          >
            <p className="pb-1.5 text-xs text-tertiary">{m.siteVersion}</p>
            <ul className="flex flex-col gap-0.5">
              {EDITIONS.map((e) => (
                <li key={e.region}>
                  <a
                    href={hrefFor(page, e)}
                    aria-current={e.region === edition.region ? "page" : undefined}
                    className={cn(
                      "flex justify-between rounded-lg px-2 py-1 transition-colors hover:bg-light hover:text-white",
                      e.region === edition.region && "bg-light text-white"
                    )}
                  >
                    <p>{e.name}</p>
                    <p lang={e.language} className="text-tertiary">
                      {e.languageName}
                    </p>
                  </a>
                </li>
              ))}
            </ul>

            <div className="my-3 h-px w-full bg-white/10" />

            <label className="flex flex-col gap-1.5">
              <p className="text-xs text-tertiary">{m.numbersFrom}</p>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
                className="rounded-lg bg-dark px-2 py-1.5 text-secondary"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r === edition.region
                      ? interpolate(m.numbersFromPage, { server: editionOf(r).name })
                      : editionOf(r).name}
                  </option>
                ))}
              </select>
            </label>
            {override && (
              <p className="pt-2 text-xs text-tertiary">
                {interpolate(m.numbersFromNote, { server: editionOf(region).name })}
              </p>
            )}
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export default ServerMenu;
