import { useState } from "react";
import { cn } from "../../../lib/utils";
import { FaGithub } from "react-icons/fa6";
import changelogEntries from "../../../lib/data";

const Changelog = () => {
  const [selectedVersion, setSelectedVersion] = useState(
    changelogEntries[changelogEntries.length - 1].version // Set the default entry to the newest version
  );

  return (
    <div className={"flex pt-10 h-[555px]"}>
      {/* SELECTOR*/}
      <div className="flex flex-col overflow-y-auto w-2/12">
        {changelogEntries.toReversed().map((entry, index) => {
          return (
            <div
              key={index}
              className={cn(
                "hover:bg-light hover:text-accent hover:tracking-wider text-center transition-all cursor-pointer select-none py-[20.2px] w-full",
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
            <div key={index} className="flex flex-col mx-10 w-9/12">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">{entry.version}</h1>
                <div className="flex items-center space-x-5">
                  <h2 className="text-sm">{entry.date}</h2>
                  <a href={entry.link} target="_blank">
                    <FaGithub
                      size={18}
                      className="hover:fill-white hover:scale-110 hover:rotate-[360deg] transition-all duration-1000"
                    />
                  </a>
                </div>
              </div>
              <div className="bg-white/10 mt-4 w-full h-px"></div>

              {/* ADDITIONS */}
              {entry.additions && entry.additions.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold py-6">New Additions</h2>
                  <div className="space-y-3">
                    {entry.additions.map((addition, index) => (
                      <p key={index} className="text-sm">
                        • {addition}
                      </p>
                    ))}
                  </div>
                </>
              )}

              {/* FIXES */}
              {entry.fixes && entry.fixes.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold py-6">
                    Bug Fixes / Optimizations
                  </h2>
                  <div className="space-y-3">
                    {entry.fixes.map((fix, index) => (
                      <p key={index} className="text-sm">
                        • {fix}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        }
      })}
    </div>
  );
};

export default Changelog;
