import { useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip/Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import changelogEntries from "../../lib/data";
import { cn } from "../../lib/utils";
import "./Info.css";

import CostTable from "./Sections/CostTable";
import Changelog from "./Sections/Changelog";

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
  const [selectedType, setSelectedType] = useState("arcane");
  const [selectedSymbol, setSelectedSymbol] = useState(1);
  let totalExp = 0;
  return (
    <section className="info">
      <div className="bg-gradient-to-t from-card-tool to-card-grad rounded-lg py-10 w-full max-w-[800px] h-[700px] mx-12">
        {/* NAV BAR SECTION */}
        <nav className="flex text-center bg-dark shadow-input transition-all">
          <div
            className={cn(
              "group flex flex-col justify-center hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative px-2",
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
              "group flex flex-col justify-center hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative px-2",
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
              "group flex flex-col justify-center hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative px-2",
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
              "group flex flex-col justify-center hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative px-2",
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
          className={cn("hidden pt-10 h-[555px]", selectedInfo === 1 && "flex")}
        >
          <div className="flex flex-col mx-10 w-full">
            <div className="flex justify-between items-center">
              <div className="flex space-x-[21.5px]">
                <div
                  className={cn(
                    "flex justify-center hover:bg-light [&>*]:hover:scale-110 transition-all cursor-pointer",
                    selectedType === "arcane"
                      ? "bg-light [&>*]:scale-110"
                      : "grayscale hover:grayscale-[50%]"
                  )}
                  onClick={() => setSelectedType("arcane")}
                >
                  <img
                    src="/symbols/arcane-selector.webp"
                    alt="Arcane Symbols"
                    width={32.5}
                    className="transition-all"
                  />
                </div>
                <div
                  className={cn(
                    "flex justify-center hover:bg-light [&>*]:hover:scale-110 transition-all cursor-pointer",
                    selectedType === "sacred"
                      ? "bg-light [&>*]:scale-110"
                      : "grayscale hover:grayscale-[50%]"
                  )}
                  onClick={() => setSelectedType("sacred")}
                >
                  <img
                    src="/symbols/sacred-selector.webp"
                    alt="Arcane Symbols"
                    width={32.5}
                    className="transition-all"
                  />
                </div>
                <div className="w-px bg-white/10">{"\u200e"}</div>
                <h1 className="text-2xl font-semibold">
                  {selectedType === "arcane"
                    ? "Arcane Symbols"
                    : "Sacred Symbols"}
                </h1>
              </div>
              <Tooltip placement="left">
                <TooltipTrigger asChild={true}>
                  {" "}
                  <HiOutlineQuestionMarkCircle
                    size={30}
                    className="hover:stroke-white cursor-default transition-all"
                  />
                </TooltipTrigger>
                <TooltipContent className="tooltip">
                  Displays cost to level up to the <span>specified level</span>.{" "}
                  <br></br>Your <span>current level</span> will be highlighted
                  in purple
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="bg-white/10 mt-4 mb-6 w-full h-px"></div>
            <div className="flex overflow-y-auto">
              <table>
                <thead>
                  <tr className="[&>*]:font-semibold [&>*]:pb-5 [&>*]:px-[58.7px]">
                    <th>Level</th>
                    <th>Symbols Required</th>
                    <th>Total Experience</th>
                  </tr>
                </thead>
                <tbody>
                  {symbols[
                    selectedType === "arcane" ? 0 : 6
                  ].symbolsRequired.map((symbols, index) => {
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
                  })}
                </tbody>
              </table>
              <div
                className={cn(
                  "h-full w-[10px] bg-dark ml-[42px]",
                  selectedType === "arcane" && "hidden"
                )}
              ></div>
            </div>
          </div>
        </div>

        {selectedInfo === 2 && (
          <CostTable
            symbols={symbols}
            selectedInfo={selectedInfo}
            selectedSymbol={selectedSymbol}
            setSelectedSymbol={setSelectedSymbol}
          />
        )}

        {selectedInfo === 3 && <Changelog />}

        {/* CREDITS SECTION */}
        <div
          className={cn(
            "hidden flex-col items-center mx-12",
            selectedInfo === 4 && "flex"
          )}
        >
          <div>
            <h1 className="text-xl font-semibold">Resources Used</h1>
          </div>
          <div>
            <h1 className="text-xl font-semibold">Special Thanks</h1>
          </div>
          <div>
            <h1 className="text-xl font-semibold">Contact</h1>
            <p></p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Info;
