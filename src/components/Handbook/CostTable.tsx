import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { cn } from "../../lib/utils";
import { formatNumber } from "../../lib/format";
import { useAppStore, useSelectedSymbol } from "../../state/store";
import { isPublished, mesosKind } from "../../lib/regions";
import { editionOf } from "../../lib/routes";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { interpolate, useNameSet, useMessages } from "../../i18n";
import { symbolNames } from "../../i18n/gameNames";
import Message from "../../i18n/Message";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The CostTable component displays both individual and cumulative symbol level up costs.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const CostTable = () => {
  const m = useMessages().handbook;
  const nameSet = useNameSet();
  const { isMobile } = useBreakpoint();
  const symbol = useSelectedSymbol();
  const region = useAppStore((s) => s.region);
  // An unpublished table is hidden, never guessed (REGIONS D-6).
  const published = isPublished(region, mesosKind(symbol.type));
  let totalCost = 0;

  return (
    <div className="flex h-[535px] pt-10 md:h-[555px]">
      {symbol && (
        <div className="mx-8 flex w-full flex-col md:mx-10">
          {/* HEADER */}
          <div className="flex justify-between">
            <div className="flex items-center gap-5 md:gap-6">
              <img
                src={symbol.img}
                alt={symbolNames(symbol, nameSet).name}
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
                {symbolNames(symbol, nameSet).name}
              </h1>
            </div>

            <Tooltip placement="left">
              <TooltipTrigger>
                <HiOutlineQuestionMarkCircle
                  size={!isMobile ? 30 : 27.5}
                  className="cursor-default transition-all hover:stroke-white"
                />
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <Message text={m.costTooltip} />
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-4 mb-6 h-px bg-white/10" aria-hidden="true" />

          {!published && (
            <p className="pb-4 text-center text-sm text-tertiary">
              <Message text={m.costsUnpublished} values={{ server: editionOf(region).name }} />
            </p>
          )}

          {/* TABLE */}
          <div className="flex overflow-y-auto">
            <table className="mb-1 w-full md:mr-10">
              {/* TABLE HEADER */}
              <thead>
                <tr>
                  <th className="pb-5 text-sm font-semibold md:text-base">{m.level}</th>
                  <th className="pb-5 text-sm font-semibold md:text-base">{m.mesosRequired}</th>
                  <th className="pb-5 text-sm font-semibold md:text-base">{m.totalCost}</th>
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
                            <img
                              src={symbol.img}
                              alt={interpolate(m.currentLevelAlt, {
                                symbol: symbolNames(symbol, nameSet).name,
                              })}
                              className="h-3 w-3 md:h-4 md:w-4"
                            />
                          )}
                          {index + 1}
                        </div>
                      </td>
                      <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
                        {isFirstRow || !published ? "-" : formatNumber(cost)}
                      </td>
                      <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
                        {isFirstRow || !published ? "-" : formatNumber(totalCost)}
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
                symbol.type === "arcane" && "hidden",
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
