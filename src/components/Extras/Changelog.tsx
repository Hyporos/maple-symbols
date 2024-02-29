import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { cn } from "../../lib/utils";
import { FaGithub, FaChevronRight } from "react-icons/fa6";
import changelogEntries from "../../lib/data";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Changelog component allows the user to view all previous Maple Symbols update details.
// * Navigate through each version using the selector and view the entirety of the notes.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Changelog = () => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */
  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });

  const [open, setOpen] = useState(false);

  const [selectedVersion, setSelectedVersion] = useState(
    changelogEntries[changelogEntries.length - 1].version // Set the default entry to the newest version
  );

  /* ―――――――――――――――――――― Output ―――――――――――――――――――――――――― */
  return (
    <div className={"flex pt-10 h-[535px] md:h-[555px]"}>
      {/* SELECTOR */}
      <div
        className={cn(
          "flex flex-col overflow-y-auto w-full max-w-[125px]",
          !open && isMobile && "hidden",
          open && isMobile && "max-w-[65px]"
        )}
      >
        {changelogEntries.toReversed().map((entry, index) => {
          return (
            <div
              key={index}
              className={cn(
                "hover:bg-light text-xs md:text-base hover:text-accent hover:tracking-wider text-center transition-all cursor-pointer select-none py-[20.2px] w-full",
                entry.version === selectedVersion &&
                  "bg-light text-accent font-semibold tracking-wider"
              )}
              onClick={() => setSelectedVersion(entry.version)}
            >
              {entry.version}
            </div>
          );
        })}
      </div>

      {/* PATCH NOTES */}
      {changelogEntries.map((entry, index) => {
        if (entry.version === selectedVersion) {
          return (
            <div key={index} className="flex flex-col mx-8 md:mx-10 w-full">
              <div className="flex justify-between">
                <div
                  className={cn(
                    "flex items-center gap-3",
                    isMobile && "group cursor-pointer"
                  )}
                  onClick={() => setOpen(!open)}
                >
                  <div className="flex-col">
                    <h1 className="text-xl md:text-2xl group-hover:text-white font-semibold transition-all">
                      {entry.version}
                    </h1>
                  </div>
                  {isMobile && (
                    <FaChevronRight
                      size={16}
                      className={cn(
                        "group-hover:fill-hover transition-colors",
                        open && "rotate-180"
                      )}
                    />
                  )}
                </div>
                <div className="flex items-center space-x-5">
                  <h2 className={cn("text-xs md:text-sm", open && "hidden")}>
                    {entry.date}
                  </h2>
                  <a href={entry.link} target="_blank">
                    <FaGithub
                      size={!isMobile ? 18 : 16}
                      className="hover:fill-white hover:scale-110 hover:rotate-[360deg] transition-all duration-1000"
                    />
                  </a>
                </div>
              </div>

              <div className="bg-white/10 mt-4 h-px" />

              {/* NOTE DETAILS */}
              <div className={cn("overflow-y-auto mt-6", !isMobile && "pr-10")}>
                {entry.additions && entry.additions.length > 0 && (
                  <>
                    <h2 className="md:text-lg font-semibold pb-6">
                      New Additions
                    </h2>
                    <div className="space-y-4">
                      {entry.additions.map((addition, index) => (
                        <p key={index} className="text-xs md:text-sm">
                          • {addition}
                        </p>
                      ))}
                    </div>
                  </>
                )}

                {entry.fixes && entry.fixes.length > 0 && (
                  <>
                    {(entry.additions?.length || 0) > 0 && (
                      <div className="bg-white/10 mt-6 h-px" />
                    )}
                    <h2
                      className={cn(
                        "md:text-lg font-semibold pb-6",
                        (entry.additions?.length || 0) > 0 && "py-6"
                      )}
                    >
                      Bug Fixes / Optimizations
                    </h2>
                    <div className="space-y-4">
                      {entry.fixes.map((fix, index) => (
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
