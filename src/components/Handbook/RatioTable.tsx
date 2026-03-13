import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { MdOutlineInfo } from "react-icons/md";
import { cn } from "../../lib/utils";
import { arcaneRatioData, sacredRatioData } from "../../lib/ratioData";
import { useAppStore } from "../../state/store";
import { useBreakpoint } from "../../hooks/useBreakpoint";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The RatioTable component displays Damage Dealt and Damage Taken values, based on current power.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const RatioTable = () => {
  const swapped = useAppStore((s) => s.swapped);

  const { isMobile } = useBreakpoint();

  return (
    <div className="flex h-[535px] pt-10 md:h-[555px]">
      <div className="mx-8 flex w-full flex-col md:mx-10">
        {/* HEADER */}
        <div className="flex justify-between">
          <div className="flex items-center gap-5 md:gap-6">
            <img
              src={`/symbols/empty-${!swapped ? "arcane" : "sacred"}.webp`}
              width={!isMobile ? 32.5 : 30}
              className="scale-110"
            />
            <div className="h-full w-px bg-white/10"></div>
            <h1 className="text-lg font-semibold md:text-2xl">
              {!swapped ? "Arcane River" : "Grandis"}
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
              Displays <span>damage ratios</span> for {!swapped ? "Arcane River" : "Grandis"}{" "}
              <br></br>maps, <span>depending</span> on your{" "}
              {!swapped ? "Arcane Power" : "Sacred Power"}.
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
                <th className="flex items-center justify-center px-3 pb-5 md:gap-2 md:px-0">
                  <h2 className="text-sm font-semibold md:text-base">
                    {!swapped ? "Arcane Power" : "Sacred Power"}
                  </h2>
                  {!isMobile && (
                    <Tooltip>
                      <TooltipTrigger asChild={true}>
                        {" "}
                        <MdOutlineInfo
                          size={20}
                          className="cursor-default transition-all hover:fill-white"
                        />
                      </TooltipTrigger>
                      <TooltipContent className="tooltip">
                        {!swapped ? (
                          <>
                            The current <span>Arcane Power range</span> you meet, <br></br> compared
                            to the <span>map requirement</span>
                          </>
                        ) : (
                          <>
                            The difference between <span>your Sacred Power</span>
                            <br></br>and the <span>map requirement</span>
                          </>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </th>
                <th className="pb-5 text-sm font-semibold md:text-base">Damage Dealt</th>
                <th className="pb-5 text-sm font-semibold md:text-base">Damage Taken</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {!swapped
                ? arcaneRatioData.map((requirement, index) => (
                    <tr key={index} className="hover:bg-dark">
                      <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
                        {requirement.arcanePower}
                      </td>
                      <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
                        {requirement.damageDealt}%
                      </td>
                      <td className="border border-white/5 py-[5px]">
                        <div className="flex items-center justify-center md:gap-2">
                          {!swapped && index === 8 && (
                            <MdOutlineInfo size={18} className="collapse hidden md:block" />
                          )}
                          <p className="text-center text-xs md:text-sm">
                            {requirement.damageTaken}%
                          </p>
                          {!swapped && index === 8 && !isMobile && (
                            <Tooltip>
                              <TooltipTrigger asChild={true}>
                                {" "}
                                <MdOutlineInfo
                                  size={18}
                                  className="cursor-default transition-all hover:fill-white"
                                />
                              </TooltipTrigger>
                              <TooltipContent className="tooltip">
                                Monsters will deal <span>1 damage</span> <br></br>
                                to your character
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                : sacredRatioData.map((requirement, index) => (
                    <tr key={index} className="hover:bg-dark">
                      <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
                        {requirement.sacredPower}
                      </td>
                      <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
                        {requirement.damageDealt}%
                      </td>
                      <td className="border border-white/5 py-[5px] text-center text-xs md:text-sm">
                        {requirement.damageTaken}%
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* CONDITIONAL SIDEBAR */}
          <div className={cn("w-[11px] bg-dark", swapped && "hidden", isMobile && "hidden")}></div>
        </div>
      </div>
    </div>
  );
};

export default RatioTable;
