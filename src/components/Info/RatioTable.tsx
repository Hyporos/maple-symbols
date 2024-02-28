import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { useMediaQuery } from "react-responsive";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { MdOutlineInfo } from "react-icons/md";
import { cn } from "../../lib/utils";
import { arcaneRatioData, sacredRatioData } from "../../lib/data";

interface RatioTableProps {
  swapped: boolean;
}

const RatioTable = ({ swapped }: RatioTableProps) => {
  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });

  return (
    <div className="flex pt-10 h-[535px] md:h-[555px]">
      <div className="flex flex-col mx-8 md:mx-10 w-full">
        {/* HEADER */}
        <div className="flex justify-between">
          <div className="flex items-center gap-6">
            <img
              src={`/symbols/empty-${!swapped ? "arcane" : "sacred"}.webp`}
              width={!isMobile ? 32.5 : 30}
              className="scale-110"
            />
            <div className="bg-white/10 w-px h-full"></div>
            <h1 className="text-lg md:text-2xl font-semibold">
              {!swapped ? "Arcane River" : "Grandis"}
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
              Displays <span>damage ratios</span> for{" "}
              {!swapped ? "Arcane River" : "Grandis"} <br></br>maps,{" "}
              <span>depending</span> on your{" "}
              {!swapped ? "Arcane Power" : "Sacred Power"}.
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
                <th className="flex justify-center items-center md:gap-2 px-3 md:px-0 pb-5">
                  <h2 className="text-sm md:text-base font-semibold">
                    {!swapped ? "Arcane Power" : "Sacred Power"}
                  </h2>
                  {!isMobile && (
                    <Tooltip>
                      <TooltipTrigger asChild={true}>
                        {" "}
                        <MdOutlineInfo
                          size={20}
                          className="hover:fill-white cursor-default transition-all"
                        />
                      </TooltipTrigger>
                      <TooltipContent className="tooltip">
                        {!swapped ? (
                          <>
                            The current <span>Arcane Power range</span> you
                            meet, <br></br> compared to the{" "}
                            <span>map requirement</span>
                          </>
                        ) : (
                          <>
                            The difference between{" "}
                            <span>your Sacred Power</span>
                            <br></br>and the <span>map requirement</span>
                          </>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </th>
                <th className="text-sm md:text-base font-semibold pb-5">
                  Damage Dealt
                </th>
                <th className="text-sm md:text-base font-semibold pb-5">
                  Damage Taken
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {!swapped
                ? arcaneRatioData.map((requirement, index) => (
                    <tr key={index} className="hover:bg-dark">
                      <td className="text-center text-xs md:text-sm border border-white/5 py-[5px]">
                        {requirement.arcanePower}
                      </td>
                      <td className="text-center text-xs md:text-sm border border-white/5 py-[5px]">
                        {requirement.damageDealt}%
                      </td>
                      <td className="border border-white/5 py-[5px]">
                        <div className="flex justify-center items-center md:gap-2">
                          {!swapped && index === 8 && (
                            <MdOutlineInfo
                              size={18}
                              className="collapse hidden md:block"
                            />
                          )}
                          <p className="text-xs md:text-sm text-center">
                            {requirement.damageTaken}%
                          </p>
                          {!swapped && index === 8 && !isMobile && (
                            <Tooltip>
                              <TooltipTrigger asChild={true}>
                                {" "}
                                <MdOutlineInfo
                                  size={18}
                                  className="hover:fill-white cursor-default transition-all"
                                />
                              </TooltipTrigger>
                              <TooltipContent className="tooltip">
                                Monsters will deal <span>1 damage</span>{" "}
                                <br></br>
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
                      <td className="text-center text-xs md:text-sm border border-white/5 py-[5px]">
                        {requirement.sacredPower}
                      </td>
                      <td className="text-center text-xs md:text-sm border border-white/5 py-[5px]">
                        {requirement.damageDealt}%
                      </td>
                      <td className="text-center text-xs md:text-sm border border-white/5 py-[5px]">
                        {requirement.damageTaken}%
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* CONDITIONAL SIDEBAR */}
          <div
            className={cn(
              "bg-dark w-[11px]",
              swapped && "hidden",
              isMobile && "hidden"
            )}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default RatioTable;
