import { useState } from "react";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { cn } from "../../lib/utils";
import { FaGithub, FaChevronRight } from "react-icons/fa6";
import { changelogEntries, type ChangelogEntry } from "../../lib/changelog";
import { formatDate } from "../../lib/format";
import { interpolate, useLocale, useMessages } from "../../i18n";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Changelog component allows the user to view all previous Maple Symbols update details.
// * Navigate through each version using the selector and view the entirety of the notes.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Changelog = () => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */
  const messages = useMessages();
  const locale = useLocale();
  const m = messages.extras;
  const { isMobile } = useBreakpoint();

  const [open, setOpen] = useState(false);

  const [selectedVersion, setSelectedVersion] = useState(
    changelogEntries[changelogEntries.length - 1].version // Set the default entry to the newest version
  );

  /* ―――――――――――――――――――― Output ―――――――――――――――――――――――――― */
  return (
    <div className={"flex h-[535px] pt-10 md:h-[555px]"}>
      {/* SELECTOR */}
      <div
        className={cn(
          "flex w-full max-w-[125px] flex-col overflow-y-auto",
          !open && isMobile && "hidden",
          open && isMobile && "max-w-[65px]"
        )}
      >
        {[...changelogEntries].reverse().map((entry: ChangelogEntry, index: number) => {
          return (
            <button
              key={index}
              className={cn(
                "w-full cursor-pointer py-[20.2px] text-center text-xs transition-all select-none hover:bg-light hover:tracking-wider hover:text-accent md:text-base",
                entry.version === selectedVersion &&
                  "bg-light font-semibold tracking-wider text-accent"
              )}
              onClick={() => setSelectedVersion(entry.version)}
            >
              {entry.version}
            </button>
          );
        })}
      </div>

      {/* PATCH NOTES */}
      {changelogEntries.map((entry, index) => {
        if (entry.version === selectedVersion) {
          const {
            additions = [],
            fixes = [],
          }: { additions?: readonly string[]; fixes?: readonly string[] } =
            messages.changelog[entry.version];
          return (
            <div key={index} className="mx-8 flex w-full flex-col md:mx-10">
              <div className="flex justify-between">
                <div
                  className={cn("flex items-center gap-3", isMobile && "group cursor-pointer")}
                  onClick={() => setOpen(!open)}
                >
                  <div className="flex-col">
                    <h1 className="text-xl font-semibold transition-all group-hover:text-white md:text-2xl">
                      {entry.version}
                    </h1>
                  </div>
                  {isMobile && (
                    <FaChevronRight
                      size={16}
                      className={cn(
                        "transition-colors group-hover:fill-white",
                        open && "rotate-180"
                      )}
                    />
                  )}
                </div>
                <div className="flex items-center space-x-5">
                  <time
                    dateTime={entry.date}
                    className={cn("text-xs md:text-sm", open && "hidden")}
                  >
                    {formatDate(entry.date, locale)}
                  </time>
                  <a
                    href={entry.link}
                    target="_blank"
                    rel="noopener"
                    aria-label={interpolate(m.pullRequestLink, { version: entry.version })}
                  >
                    <FaGithub
                      size={!isMobile ? 18 : 16}
                      className="transition-all duration-1000 hover:scale-110 hover:rotate-360 hover:fill-white"
                    />
                  </a>
                </div>
              </div>

              <div className="mt-4 h-px bg-white/10" />

              {/* NOTE DETAILS */}
              <div className={cn("mt-6 overflow-y-auto", !isMobile && "pr-10")}>
                {additions.length > 0 && (
                  <>
                    <h2 className="pb-6 font-semibold md:text-lg">{m.newAdditions}</h2>
                    <div className="space-y-4">
                      {additions.map((addition, index) => (
                        <p key={index} className="text-xs md:text-sm">
                          • {addition}
                        </p>
                      ))}
                    </div>
                  </>
                )}

                {fixes.length > 0 && (
                  <>
                    {additions.length > 0 && <div className="mt-6 h-px bg-white/10" />}
                    <h2
                      className={cn(
                        "pb-6 font-semibold md:text-lg",
                        additions.length > 0 && "py-6"
                      )}
                    >
                      {m.bugFixes}
                    </h2>
                    <div className="space-y-4">
                      {fixes.map((fix, index) => (
                        <p key={index} className="text-xs md:text-sm">
                          • {fix}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};

export default Changelog;
