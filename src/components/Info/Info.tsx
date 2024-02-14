import { useState } from "react";
import "./Info.css";
import changelogEntries from "../../lib/data";
import { cn } from "../../lib/utils";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Tools component is the section under the Calculator which contains the Selectors and Catalyst.
// * You can preview the functionality of both items by clicking their respective buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Info = () => {
  const [selectedInfo, setSelectedInfo] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState(
    changelogEntries[changelogEntries.length - 1].version // Set the default entry to the newest one
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <section className="info">
      <div className="bg-gradient-to-t from-card-tool to-card-grad rounded-lg mt-12 w-[800px] h-[700px]">
        <nav className="flex text-center my-10 bg-dark shadow-input transition-all ">
          <div
            className={cn(
              "group flex flex-col justify-center hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative",
              selectedInfo === 1 && "bg-light text-white"
            )}
            onClick={() => setSelectedInfo(1)}
          >
            <h1>Meso Cost Table</h1>
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 mx-auto h-px w-0 bg-accent transition-all",
                selectedInfo === 1 ? "w-full" : "group-hover:w-1/4"
              )}
            ></div>
          </div>
          <div
            className={cn(
              "group flex flex-col justify-center hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative",
              selectedInfo === 2 && "bg-light text-white"
            )}
            onClick={() => setSelectedInfo(2)}
          >
            <h1>Experience Table</h1>
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 mx-auto h-px w-0 bg-accent transition-all",
                selectedInfo === 2 ? "w-full" : "group-hover:w-1/4"
              )}
            ></div>
          </div>
          <div
            className={cn(
              "group flex flex-col justify-center hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative",
              selectedInfo === 3 && "bg-light text-white"
            )}
            onClick={() => setSelectedInfo(3)}
          >
            <h1>Changelog</h1>
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 mx-auto h-px w-0 bg-accent transition-all",
                selectedInfo === 3 ? "w-full" : "group-hover:w-1/4"
              )}
            ></div>
          </div>
          <div
            className={cn(
              "group flex flex-col justify-center hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative",
              selectedInfo === 4 && "bg-light text-white"
            )}
            onClick={() => setSelectedInfo(4)}
          >
            <h1>Credits</h1>
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 mx-auto h-px w-0 bg-accent transition-all",
                selectedInfo === 4 ? "w-full" : "group-hover:w-1/4"
              )}
            ></div>
          </div>
        </nav>
        <div className={cn("hidden", selectedInfo === 1 && "flex")}>1</div>
        <div className={cn("hidden", selectedInfo === 2 && "flex")}>
          <div
            className={cn(
              "text-center tracking-wider",
              dropdownOpen && "shadow-input"
            )}
          >
            <div
              className="bg-light hover:bg-hover transition-all select-none rounded-lg px-4 py-3 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              v1.0
            </div>
            <div
              className={cn(
                "hidden [&>*]:px-4 [&>*]:py-2",
                dropdownOpen && "flex flex-col"
              )}
            >
              <div className="px-4 py-2 cursor-pointer hover:bg-light transition-all">
                Vanishing Journey
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn("hidden max-h-[500px]", selectedInfo === 3 && "flex")}
        >
          <div className="flex flex-col items-center overflow-auto w-2/12">
            {changelogEntries.toReversed().map((entry, index) => {
              return (
                <div
                  key={index}
                  className={cn(
                    "hover:bg-light hover:text-accent hover:tracking-wider text-center transition-all cursor-pointer select-none py-5 w-full",
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
          {changelogEntries.map((entry, index) => {
            if (entry.version === selectedVersion) {
              return (
                <div
                  key={index}
                  className="flex flex-col overflow-auto mx-12 w-9/12 "
                >
                  <h1 className="text-2xl font-semibold">{entry.version}</h1>
                  <div className="bg-white/10 mt-4 w-[500px] h-px"></div>
                  {entry.additions && entry.additions.length > 0 && (
                    <>
                      <h2 className="text-lg font-semibold py-6">
                        New Additions
                      </h2>
                      <div className="[&>*]:text-sm space-y-3">
                        {entry.additions.map((addition, index) => (
                          <p key={index}>• {addition}</p>
                        ))}
                      </div>
                    </>
                  )}
                  {entry.fixes && entry.fixes.length > 0 && (
                    <>
                      <h2 className="text-lg font-semibold py-6">
                        Bug Fixes / Optimizations
                      </h2>
                      <div className="[&>*]:text-sm space-y-3">
                        {entry.fixes.map((fix, index) => (
                          <p key={index}>• {fix}</p>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            }
          })}
        </div>
        <div className={cn("hidden", selectedInfo === 4 && "flex")}>
          <div>
            <h1>Special Thanks</h1>
          </div>
          <div>
            <h1>Resources Used</h1>
          </div>
          <div>
            <h1>Contact</h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Info;
