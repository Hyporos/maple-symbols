import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { cn } from "../../lib/utils";
import { useAppStore } from "../../state/store";
import { useBreakpoint } from "../../hooks/useBreakpoint";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The CostTable component displays both individual and cumulative symbol level up costs.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const CostTable = () => {
  const symbols = useAppStore((s) => s.symbols);
  const selectedSymbol = useAppStore((s) => s.selectedSymbol);

  const { isMobile } = useBreakpoint();
  const symbol = symbols[selectedSymbol];
  let totalCost = 0;

  return (
    <div className="flex h-[535px] pt-10 md:h-[555px]">
      {symbol && (
        <div className="mx-8 flex w-full flex-col md:mx-10">
          {/* HEADER */}
          <div className="flex justify-between">
            <div className="flex items-center gap-5 md:gap-6">
              <img
                src={symbols[selectedSymbol].img}
                width={!isMobile ? 32.5 : 30}
                className="scale-110"
              />
              <div className="h-full w-px bg-white/10" aria-hidden="true" />
              <h1
                className={cn(
                  "text-lg font-semibold md:text-2xl",
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
                  className="cursor-default transition-all hover:stroke-white"
                />
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                Displays <span>cost</span> to level up<br></br> to the <span>specified level</span>.
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mb-6 mt-4 h-px bg-white/10" aria-hidden="true" />

          {/* TABLE */}
          <div className="flex overflow-y-auto">
            <table className="mb-1 w-full md:mr-10">
              {/* TABLE HEADER */}
              <thead>
                <tr>
                  <th className="pb-5 text-sm font-semibold md:text-base">Level</th>
                  <th className="pb-5 text-sm font-semibold md:text-base">Mesos Required</th>
                  <th className="pb-5 text-sm font-semibold md:text-base">Total Cost</th>
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
                      className={cn("hover:bg-dark", currentLevel && "bg-dark text-accent")}
                    >
                      <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
                        <div className="flex items-center justify-center gap-2">
                          {currentLevel && (
                            <img src={symbol.img} className="h-3 w-3 md:h-4 md:w-4" />
                          )}
                          {index + 1}
                        </div>
                      </td>
                      <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
                        {isFirstRow ? "-" : cost.toLocaleString()}
                      </td>
                      <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
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
                "w-[11px] bg-dark",
                selectedSymbol < 6 && "hidden",
                isMobile && "hidden"
              )}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostTable;
