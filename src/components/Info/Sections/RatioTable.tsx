import { useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { arcaneRatioData, sacredRatioData } from "../../../lib/data";
import { cn } from "../../../lib/utils";

interface RatioTableProps {
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

const RatioTable = ({ symbols, swapped }: RatioTableProps) => {
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
              {!swapped ? "Arcane River" : "Grandis"}
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
                  <th className="font-semibold pb-5">{!swapped? "Arcane" : "Sacred"} Power Range</th>
                  <th className="font-semibold pb-5">Damage Dealt</th>
                  <th className="font-semibold pb-5">Damage Taken</th>
                </tr>
              </thead>
              <tbody>
                {!swapped
                  ? arcaneRatioData.map((requirement, index) => (
                      <tr key={index}>
                        <td className="w-[100px] text-center text-sm border border-white/5 py-[5px]">
                          {requirement.arcanePower}
                        </td>
                        <td className="w-[100px] text-center text-sm border border-white/5 py-[5px]">
                          {requirement.damageDealt}%
                        </td>
                        <td className="w-[100px] text-center text-sm border border-white/5 py-[5px]">
                          {requirement.damageTaken}%
                        </td>
                      </tr>
                    ))
                  : sacredRatioData.map((requirement, index) => (
                      <tr key={index}>
                        <td className="w-[100px] text-center text-sm border border-white/5 py-[5px]">
                          {requirement.sacredPower}
                        </td>
                        <td className="w-[100px] text-center text-sm border border-white/5 py-[5px]">
                          {requirement.damageDealt}%
                        </td>
                        <td className="w-[100px] text-center text-sm border border-white/5 py-[5px]">
                          {requirement.damageTaken}%
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* CONDITIONAL SIDEBAR */}
          <div
            className={cn("bg-dark ml-auto w-[10px]", swapped && "hidden")}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default RatioTable;
