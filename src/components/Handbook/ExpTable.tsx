import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { cn } from "../../lib/utils";
import { formatNumber } from "../../lib/format";
import { useAppStore, useSelectedSymbol } from "../../state/store";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import symbolsJson from "../../lib/symbols.json";
import { interpolate, useNameSet, useMessages } from "../../i18n";
import { symbolNames } from "../../i18n/gameNames";
import Message from "../../i18n/Message";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The ExpTable component displays both individual and cumulative symbol exp requirements/cost.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ExpTable = () => {
  const m = useMessages().handbook;
  const nameSet = useNameSet();
  const mode = useAppStore((s) => s.mode);

  const { isMobile } = useBreakpoint();
  let totalExp = 0;

  const symbol = useSelectedSymbol();
  const isMatchingType = mode === "sacred" ? symbol?.type === "sacred" : symbol?.type === "arcane";
  const currentLevel = isMatchingType && !isNaN(symbol?.level) ? symbol.level : null;

  const expData = mode === "arcane" ? symbolsJson.arcaneExpRequired : symbolsJson.sacredExpRequired;

  return (
    <div className="flex h-[535px] pt-10 md:h-[555px]">
      <div className="mx-8 flex w-full flex-col md:mx-10">
        {/* HEADER */}
        <div className="flex justify-between">
          <div className="flex items-center gap-5 md:gap-6">
            <img
              src={`/symbols/empty-${mode}.webp`}
              alt=""
              width={!isMobile ? 32.5 : 30}
              className="scale-110"
            />
            <div className="h-full w-px bg-white/10"></div>
            <h1 className="text-lg font-semibold md:text-2xl">{m.symbolsHeading[mode]}</h1>
          </div>

          <Tooltip placement="left">
            <TooltipTrigger>
              <HiOutlineQuestionMarkCircle
                size={!isMobile ? 30 : 27.5}
                className="cursor-default transition-all hover:stroke-white"
              />
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              <Message text={m.expTooltip} />
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-4 mb-6 h-px bg-white/10" aria-hidden="true" />

        {/* TABLE */}
        <div className="flex overflow-y-auto">
          <table className="mb-1 w-full md:mr-10">
            {/* TABLE HEADER */}
            <thead>
              <tr>
                <th className="pb-5 text-sm font-semibold md:text-base">{m.level}</th>
                <th className="pb-5 text-sm font-semibold md:text-base">
                  {!isMobile ? m.symbolsRequired : m.expRequired}
                </th>
                <th className="pb-5 text-sm font-semibold md:text-base">
                  {!isMobile ? m.totalExperience : m.totalSymbols}
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {expData.map((exp, index) => {
                const isFirstRow = index === 0;
                totalExp += exp;

                return (
                  <tr
                    key={index}
                    className={cn(
                      "hover:bg-dark",
                      currentLevel === index + 1 && "bg-dark text-accent"
                    )}
                  >
                    <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
                      <div className="flex items-center justify-center gap-2">
                        {currentLevel === index + 1 && (
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
                      {isFirstRow ? "-" : formatNumber(exp)}
                    </td>
                    <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
                      {isFirstRow ? "-" : formatNumber(totalExp)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* CONDITIONAL SIDEBAR */}
          <div
            className={cn("w-[11px] bg-dark", mode === "arcane" && "hidden", isMobile && "hidden")}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ExpTable;
