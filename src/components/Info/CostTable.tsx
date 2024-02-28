import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { useMediaQuery } from "react-responsive";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { cn } from "../../lib/utils";

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
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The CostTable component displays both individual and cumulative symbol level up costs.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const CostTable = ({ symbols, selectedSymbol }: CostTableProps) => {
  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });
  let totalCost = 0;

  return (
    <div className="flex pt-10 h-[535px] md:h-[555px]">
      {symbols.map((symbol, index) => {
        return (
          <>
            {symbol.id === selectedSymbol + 1 && (
              <div key={index} className="flex flex-col mx-8 md:mx-10 w-full">
                {/* HEADER */}
                <div className="flex justify-between">
                  <div className="flex items-center gap-5 md:gap-6">
                    <img
                      src={symbols[selectedSymbol].img}
                      width={!isMobile ? 32.5 : 30}
                      className="scale-110"
                    />
                    <div className="bg-white/10 w-px h-full">{"\u200e"}</div>
                    <h1
                      className={cn(
                        "text-lg md:text-2xl font-semibold",
                        symbol.name === "Vanishing Journey" && "text-base"
                      )}
                    >
                      {symbols[selectedSymbol].name}
                    </h1>
                  </div>

                  <Tooltip placement="left">
                    <TooltipTrigger asChild={true}>
                      {" "}
                      <HiOutlineQuestionMarkCircle
                        size={!isMobile ? 30 : 27.5}
                        className="hover:stroke-white cursor-default transition-all"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="tooltip">
                      Displays <span>cost</span> to level up<br></br> to the{" "}
                      <span>specified level</span>.
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="bg-white/10 mt-4 mb-6 h-px">{"\u200e"}</div>

                {/* TABLE */}
                <div className="flex overflow-y-auto">
                  <table className="w-full mb-1 md:mr-10">
                    {/* TABLE HEADER */}
                    <thead>
                      <tr>
                        <th className="text-sm md:text-base font-semibold pb-5">
                          Level
                        </th>
                        <th className="text-sm md:text-base font-semibold pb-5">
                          Mesos Required
                        </th>
                        <th className="text-sm md:text-base font-semibold pb-5">
                          Total Cost
                        </th>
                      </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody>
                      {symbol.mesosRequired.map((cost, index) => {
                        const currentLevel = symbol.level === index + 1;
                        const isFirstRow = index === 0;
                        totalCost += cost;

                        return (
                          <tr
                            key={index}
                            className={cn(
                              "hover:bg-dark",
                              currentLevel && "text-accent"
                            )}
                          >
                            <td className="text-center text-xs md:text-sm border border-white/5 py-[5px]">
                              {index + 1}
                            </td>
                            <td className="text-center text-xs md:text-sm border border-white/5 py-[5px]">
                              {isFirstRow ? "-" : cost.toLocaleString()}
                            </td>
                            <td className="text-center text-xs md:text-sm border border-white/5 py-[5px]">
                              {isFirstRow ? "-" : totalCost.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* CONDITIONAL SIDEBAR */}
                  <div
                    className={cn(
                      "bg-dark w-[11px]",
                      selectedSymbol < 6 && "hidden",
                      isMobile && "hidden"
                    )}
                  ></div>
                </div>
              </div>
            )}
          </>
        );
      })}
    </div>
  );
};

export default CostTable;
