import { useState } from "react";
import "./Info.css";
import changelogEntries from "../../lib/data";
import { cn } from "../../lib/utils";
import { FaArrowRight } from "react-icons/fa6";

interface InfoProps {
  symbols: [
    {
      id: number;
      name: string;
      img: string;
      alt: string;
      level: number;
      type: string;
      symbolsRequired: Array<number>;
      mesosRequired: Array<number>;
    }
  ];
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Tools component is the section under the Calculator which contains the Selectors and Catalyst.
// * You can preview the functionality of both items by clicking their respective buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Info = ({ symbols }: InfoProps) => {
  const [selectedInfo, setSelectedInfo] = useState(1);
  const [selectedType, setSelectedType] = useState(1);
  const [selectedSymbol, setSelectedSymbol] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState(
    changelogEntries[changelogEntries.length - 1].version // Set the default entry to the newest one
  );
  let totalExp = 0;
  return (
    <section className="info">
      <div className="bg-gradient-to-t from-card-tool to-card-grad rounded-lg mt-12 w-[800px] h-[700px]">
        {/* NAV BAR SECTION */}
        <nav className="flex text-center my-10 bg-dark shadow-input transition-all ">
          <div
            className={cn(
              "group flex flex-col justify-center hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative",
              selectedInfo === 1 && "bg-light text-white"
            )}
            onClick={() => setSelectedInfo(1)}
          >
            <h1>Experience Table</h1>
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
            <h1>Meso Cost Table</h1>
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

        {/* EXP TABLE SECTION */}
        <div
          className={cn("hidden max-h-[500px]", selectedInfo === 1 && "flex")}
        >
          <div className="flex flex-col mx-12 w-full">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">
                {selectedType === 1 ? "Arcane Symbols" : "Sacred Symbols"}
              </h1>
              <div className="flex space-x-6">
                <div
                  className={cn(
                    "flex justify-center hover:bg-light [&>*]:hover:scale-110 transition-all cursor-pointer",
                    selectedType === 1
                      ? "bg-light [&>*]:scale-110"
                      : "grayscale hover:grayscale-[50%]"
                  )}
                  onClick={() => setSelectedType(1)}
                >
                  <img
                    src="/symbols/arcane-selector.webp"
                    alt="Arcane Symbols"
                    width={37.5}
                    className="transition-all"
                  />
                </div>
                <div
                  className={cn(
                    "flex justify-center hover:bg-light [&>*]:hover:scale-110 transition-all cursor-pointer",
                    selectedType === 2
                      ? "bg-light [&>*]:scale-110"
                      : "grayscale hover:grayscale-[50%]"
                  )}
                  onClick={() => setSelectedType(2)}
                >
                  <img
                    src="/symbols/sacred-selector.webp"
                    alt="Arcane Symbols"
                    width={37.5}
                    className="transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white/10 mt-4 mb-6 w-full h-px">
              {`\u200e`}
              {/*! Divider will not show without invisible character*/}
            </div>
            <div className="overflow-y-auto overflow-x-hidden">
              <table>
                <thead>
                  <tr className="[&>*]:font-semibold [&>*]:pb-5 [&>*]:px-14">
                    <th>Level</th>
                    <th>Symbols Required</th>
                    <th>Total Experience</th>
                  </tr>
                </thead>
                <tbody>
                  {symbols[selectedType === 1 ? 0 : 6].symbolsRequired.map(
                    (symbols, index) => {
                      totalExp += symbols;
                      return (
                        <tr
                          key={index}
                          className={cn(
                            "text-center [&>*]:border [&>*]:border-white/5 [&>*]:py-[5px] [&>*]:text-sm"
                          )}
                        >
                          <td>{index + 1}</td>
                          <td>{symbols.toLocaleString()}</td>
                          <td>{totalExp.toLocaleString()}</td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COST TABLE SECTION */}
        <div
          className={cn("hidden max-h-[500px]", selectedInfo === 2 && "flex")}
        >
          <div className="flex flex-col overflow-auto w-2/12">
            {symbols.map((symbol, index) => {
              return (
                <div
                  key={index}
                  className={cn(
                    "flex justify-center hover:bg-light [&>*]:hover:scale-110 transition-all cursor-pointer py-5 w-full",
                    symbol.id === selectedSymbol
                      ? "bg-light [&>*]:scale-110"
                      : "grayscale hover:grayscale-[50%]"
                  )}
                  onClick={() => setSelectedSymbol(symbol.id)}
                >
                  <img
                    src={symbol.img}
                    alt={symbol.alt}
                    width={37.5}
                    className="transition-all"
                  />
                </div>
              );
            })}
          </div>
          {symbols.map((symbol, index) => {
            let totalCost = 0;
            return (
              <>
                {symbol.id === selectedSymbol && (
                  <div className="flex flex-col overflow-auto mx-12 w-9/12">
                    <h1 className="text-2xl font-semibold">{symbol.name}</h1>
                    <div className="bg-white/10 mt-4 mb-6 w-full h-px">
                      {`\u200e`}
                      {/*! Divider will not show without invisible character*/}
                    </div>
                    <div className="overflow-y-auto overflow-x-hidden">
                    <table key={index}>
                      <thead>
                        <tr className="[&>*]:font-semibold [&>*]:pb-5 [&>*]:px-11">
                          <th>Level</th>
                          <th>Mesos Required</th>
                          <th>Total Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {symbol.mesosRequired.map((cost, index) => {
                          totalCost += cost;
                          return (
                            <tr
                              key={index}
                              className={cn(
                                "text-center [&>*]:border [&>*]:border-white/5 [&>*]:py-[5px] [&>*]:text-sm",
                                symbol.level === index + 1 && "text-accent"
                              )}
                            >
                              <td>{index + 1}</td>
                              <td>{cost.toLocaleString()}</td>
                              <td>{totalCost.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  </div>
                )}
              </>
            );
          })}
        </div>

        {/* CHANGELOG SECTION */}
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
                  className="flex flex-col overflow-auto mx-12 w-9/12"
                >
                  <h1 className="text-2xl font-semibold">{entry.version}</h1>
                  <div className="bg-white/10 mt-4 w-full h-px"></div>
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

        {/* CREDITS SECTION */}
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
