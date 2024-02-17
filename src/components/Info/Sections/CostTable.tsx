import { Dispatch, SetStateAction, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../Tooltip/Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { cn } from "../../../lib/utils";

interface CostTableProps {
  symbols: [
    {
      id: number;
      name: string;
      img: string;
      level: number;
      type: string;
      mesosRequired: Array<number>;
    }
  ];
  selectedSymbol: number;
  setSelectedSymbol: Dispatch<SetStateAction<number>>;
}

const CostTable = ({
  symbols,
  selectedSymbol,
  setSelectedSymbol,
}: CostTableProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <div className={"flex pt-10 h-[555px]"}>
      {symbols.map((symbol, index) => {
        let totalCost = 0;
        return (
          <>
            {symbol.id === selectedSymbol && (
              <div key={index} className="flex flex-col mx-10 w-full">
                {/* HEADER */}
                <div className="flex justify-between">
                  <div className="flex space-x-6">
                    <img
                      src={symbols[selectedSymbol - 1].img}
                      width={32.5}
                      className="transition-all scale-110"
                    />
                    <div className="w-px bg-white/10">{"\u200e"}</div>
                    <h1 className="text-2xl font-semibold">
                      {symbols[selectedSymbol - 1].name}
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
                      Displays cost to level up to the{" "}
                      <span>specified level</span>. <br></br>Your{" "}
                      <span>current level</span> will be highlighted in purple
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="bg-white/10 mt-4 mb-6 h-px">{"\u200e"}</div>

                {/* TABLE */}
                <div className="overflow-y-auto">
                  <table className="w-[670px] mr-10">
                    <thead>
                      <tr>
                        <th className="font-semibold pb-5">Level</th>
                        <th className="font-semibold pb-5">Mesos Required</th>
                        <th className="font-semibold pb-5">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {symbol.mesosRequired.map((cost, index) => {
                        const currentLevel = symbol.level === index + 1;
                        const isFirstRow = index === 0;
                        totalCost += cost;
                        return (
                          <tr
                            key={index}
                            className={cn(currentLevel && "text-accent")}
                          >
                            <td className="w-[100px] text-center text-sm border border-white/5 py-[5px]">
                              {index + 1}
                            </td>
                            <td className="w-[200px] text-center text-sm border border-white/5 py-[5px]">
                              {isFirstRow ? "-" : cost.toLocaleString()}
                            </td>
                            <td className="w-[200px] text-center text-sm border border-white/5 py-[5px]">
                              {isFirstRow ? "-" : totalCost.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* CONDITIONAL SIDEBAR */}
                <div
                  className={cn(
                    "bg-dark ml-auto w-[10px]",
                    selectedSymbol > 7 && "hidden"
                  )}
                ></div>
              </div>
            )}
          </>
        );
      })}
    </div>
  );
};

export default CostTable;
