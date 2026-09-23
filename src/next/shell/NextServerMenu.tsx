import { useRef, useState } from "react";
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import Sheet from "../ui/Sheet";
import { cn } from "../../lib/utils";
import { editionOf, EDITIONS } from "../../lib/routes";
import { REGIONS, type Region } from "../../lib/regions";
import { useAppStore } from "../../state/store";
import { track } from "../../lib/analytics";
import { interpolate, useMessages } from "../../i18n";
import { nextHref, useNextRoute } from "../routing";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * NextServerMenu is the redesign's server menu (docs/REGIONS.md D-2), the current ServerMenu's
// * behaviour in a kit Sheet. "Site version" links stay inside /next (`nextHref`, a full page
// * load); "Numbers from" swaps only the numbers, kept in this browser. The chip always shows
// * the server whose numbers are on screen, i.e. the override once one is chosen.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const NextServerMenu = () => {
  const m = useMessages().shell;
  const closeLabel = useMessages().next.shell.closeNote;
  const { edition, path } = useNextRoute();
  const region = useAppStore((s) => s.region);
  const setRegion = useAppStore((s) => s.setRegion);

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const override = region !== edition.region;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={m.serverMenu}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-light px-3 py-2 text-sm text-secondary transition-colors hover:text-primary motion-reduce:transition-none"
      >
        <HiOutlineGlobeAlt />
        {editionOf(region).name}
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={m.serverMenu}
        closeLabel={closeLabel}
        anchor={buttonRef.current}
      >
        <p className="pb-1.5 text-xs text-tertiary">{m.siteVersion}</p>
        <ul className="flex flex-col gap-0.5">
          {EDITIONS.map((e) => (
            <li key={e.region}>
              <a
                href={nextHref(path, e)}
                aria-current={e.region === edition.region ? "page" : undefined}
                onClick={() => {
                  if (e.region !== edition.region)
                    track("edition_switch", { from: edition.region, to: e.region });
                }}
                className={cn(
                  "flex justify-between rounded-lg px-2 py-1 transition-colors hover:bg-light hover:text-primary motion-reduce:transition-none",
                  e.region === edition.region && "bg-light text-primary"
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
            onChange={(e) => {
              const to = e.target.value as Region;
              track("region_switch", { page: edition.region, to });
              setRegion(to);
            }}
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
      </Sheet>
    </>
  );
};

export default NextServerMenu;
