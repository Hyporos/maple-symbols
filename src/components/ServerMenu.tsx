import { useEffect, useId, useRef, useState } from "react";
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
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ServerMenu = ({ compact = false }: ServerMenuProps) => {
  const m = useMessages().shell;
  const { edition, path } = useEdition();
  const region = useAppStore((s) => s.region);
  const setRegion = useAppStore((s) => s.setRegion);

  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Close on Escape or on a click outside the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const page = routeFor(path).path;
  const override = region !== edition.region;

  return (
    <div ref={wrapper} className="relative">
      <button
        aria-label={m.serverMenu}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
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
        <div
          id={menuId}
          className="absolute right-0 z-50 mt-2 w-[230px] rounded-lg bg-[#111111] p-3 text-sm shadow-input"
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
      )}
    </div>
  );
};

export default ServerMenu;
