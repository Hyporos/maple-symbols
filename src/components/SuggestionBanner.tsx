import { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { editionOf, hrefFor, routeFor, servedLocale } from "../lib/routes";
import type { Region } from "../lib/regions";
import { readAnswered, rememberAnswered, suggestedEdition } from "../lib/suggestion";
import { track, trackOnce } from "../lib/analytics";
import { useEdition } from "../hooks/useEdition";
import { editionMessages, interpolate } from "../i18n";
import Message from "../i18n/Message";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * A thin bar under the header that suggests the visitor's own server's edition (REGIONS D-9),
// * from the browser's languages and time zone (src/lib/suggestion.ts). It links, never redirects.
// * Rendered by Header, absolutely positioned in the header's bottom margin, so appearing after
// * load moves nothing. Browser APIs are read in an effect: the prebuilt HTML and the hydrating
// * render both show no banner. Dismissing it or taking the link is remembered in this browser.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/** The browser's time zone, or undefined where Intl cannot say. */
const browserTimeZone = (): string | undefined => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

const SuggestionBanner = () => {
  const { edition, path } = useEdition();

  const [suggestion, setSuggestion] = useState<Region | null>(null);

  useEffect(() => {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    const found = suggestedEdition(languages, browserTimeZone(), edition.region);
    const show = found !== null && readAnswered() !== found;
    setSuggestion(show ? found : null);
    if (show)
      trackOnce(`edition_suggest:${found}`, "edition_suggest", { action: "shown", to: found });
  }, [edition.region]);

  if (suggestion === null) return null;

  const target = editionOf(suggestion);
  // Written in the suggested edition's language, for the visitor this page may not suit
  // (Brian, 2026-09-23); English until that edition's catalogue is served.
  const m = editionMessages(target).shell;
  const lang = servedLocale(target);
  const answer = (action: "clicked" | "dismissed") => {
    rememberAnswered(suggestion);
    track("edition_suggest", { action, to: suggestion });
  };

  return (
    <aside
      lang={lang}
      className="absolute inset-x-0 top-full z-10 flex justify-center bg-light shadow-input"
    >
      <div className="flex w-full max-w-[1125px] items-center justify-between gap-3 px-4 py-2 text-xs md:justify-center md:gap-6 md:px-8 md:text-sm">
        <p>
          <Message text={m.suggestion} values={{ server: target.name }} />{" "}
          <a
            href={hrefFor(routeFor(path).path, target)}
            onClick={() => answer("clicked")}
            className="whitespace-nowrap text-primary underline underline-offset-4 transition-colors hover:text-accent"
          >
            {interpolate(m.suggestionLink, { server: target.name })}
          </a>
        </p>
        <button
          type="button"
          aria-label={m.suggestionDismiss}
          onClick={() => {
            answer("dismissed");
            setSuggestion(null);
          }}
          className="shrink-0 p-1"
        >
          <HiXMark size={18} className="transition-colors hover:stroke-white" />
        </button>
      </div>
    </aside>
  );
};

export default SuggestionBanner;
