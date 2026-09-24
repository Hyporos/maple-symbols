import { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { editionOf, servedLocale } from "../../lib/routes";
import type { Region } from "../../lib/regions";
import { readAnswered, rememberAnswered, suggestedEdition } from "../../lib/suggestion";
import { track, trackOnce } from "../../lib/analytics";
import { editionMessages, interpolate } from "../../i18n";
import Message from "../../i18n/Message";
import { nextHref, useNextRoute } from "../routing";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * NextSuggestionBanner is /next's copy of src/components/SuggestionBanner.tsx (REGIONS D-9): the
// * same suggestion, copy, dismissal and analytics, but its link stays on the same /next page in
// * the suggested edition (`nextHref`), and it sits in the page's flow under the header rather
// * than over the first card. Browser APIs are read in an effect, so the first render shows none.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

/** The browser's time zone, or undefined where Intl cannot say. */
const browserTimeZone = (): string | undefined => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

const NextSuggestionBanner = () => {
  const { edition, path } = useNextRoute();

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
  // Written in the suggested edition's language, like the shared banner.
  const m = editionMessages(target).shell;
  const answer = (action: "clicked" | "dismissed") => {
    rememberAnswered(suggestion);
    track("edition_suggest", { action, to: suggestion });
  };

  return (
    <aside lang={servedLocale(target)} className="flex justify-center bg-light">
      <div className="flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-2 text-xs md:justify-center md:gap-6 md:px-8 md:text-sm">
        <p>
          <Message text={m.suggestion} values={{ server: target.name }} />{" "}
          <a
            href={nextHref(path, target)}
            onClick={() => answer("clicked")}
            className="whitespace-nowrap text-primary underline underline-offset-4 transition-colors hover:text-accent motion-reduce:transition-none"
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

export default NextSuggestionBanner;
