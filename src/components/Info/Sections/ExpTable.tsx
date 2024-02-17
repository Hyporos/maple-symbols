import { Dispatch, SetStateAction, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../Tooltip/Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { cn } from "../../../lib/utils";

interface ExpTableProps {
  symbols: [
    {
      id: number;
      name: string;
      img: string;
      level: number;
      type: string;
      symbolsRequired: Array<number>;
    }
  ];
}

const ExpTable = ({ symbols }: ExpTableProps) => {
  const [selectedType, setSelectedType] = useState("arcane");
  let totalExp = 0;
  return (
    <div className={"flex pt-10 h-[555px]"}>
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
              {selectedType === "arcane" ? "Arcane Symbols" : "Sacred Symbols"}
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
              <br></br>Your <span>current level</span> will be highlighted in
              purple
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
              {symbols[selectedType === "arcane" ? 0 : 6].symbolsRequired.map(
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
          <div
            className={cn(
              "h-full w-[10px] bg-dark ml-[42px]",
              selectedType === "arcane" && "hidden"
            )}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ExpTable;
