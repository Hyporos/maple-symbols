import { useState } from "react";
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
  swapped: boolean;
}

const ExpTable = ({ symbols, swapped }: ExpTableProps) => {
  let totalExp = 0;

  return (
    <div className={"flex pt-10 h-[555px]"}>
      <div className="flex flex-col mx-10 w-full">
        {/* HEADER */}
        <div className="flex justify-between">
          <div className="flex space-x-6">
            <img
              src={`/symbols/empty-${!swapped ? "arcane" : "sacred"}.webp`}
              width={32.5}
              className="scale-110"
            />
            <div className="w-px bg-white/10">{"\u200e"}</div>
            <h1 className="text-2xl font-semibold">
              {!swapped ? "Arcane Symbols" : "Sacred Symbols"}
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
              Displays <span>symbols required</span> to level up <br></br>to the{" "}
              <span>specified level</span>.
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="bg-white/10 mt-4 mb-6 h-px">{"\u200e"}</div>

        {/* TABLE */}
        <div className="flex overflow-y-auto">
          <div>
            <table className="w-[670px] mr-10">
              <thead>
                <tr>
                  <th className="font-semibold pb-5">Level</th>
                  <th className="font-semibold pb-5">Symbols Required</th>
                  <th className="font-semibold pb-5">Total Experience</th>
                </tr>
              </thead>
              <tbody>
                {symbols[!swapped ? 0 : 6].symbolsRequired.map(
                  (symbols, index) => {
                    const isFirstRow = index === 0;
                    totalExp += symbols;
                    return (
                      <tr key={index}>
                        <td className="w-[100px] text-center text-sm border border-white/5 py-[5px]">
                          {index + 1}
                        </td>
                        <td className="w-[200px] text-center text-sm border border-white/5 py-[5px]">
                          {isFirstRow ? "-" : symbols.toLocaleString()}
                        </td>
                        <td className="w-[200px] text-center text-sm border border-white/5 py-[5px]">
                          {isFirstRow ? "-" : totalExp.toLocaleString()}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* CONDITIONAL SIDEBAR */}
          <div
            className={cn("bg-dark ml-auto w-[10px]", !swapped && "hidden")}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ExpTable;
