import { Tooltip, TooltipTrigger, TooltipContent } from "../../Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { MdOutlineInfo } from "react-icons/md";
import { arcaneRatioData, sacredRatioData } from "../../../lib/data";
import { cn } from "../../../lib/utils";

interface RatioTableProps {
  swapped: boolean;
}

const RatioTable = ({ swapped }: RatioTableProps) => {
  return (
    <div className={"flex pt-10 h-[555px]"}>
      <div className="flex flex-col mx-10 w-full">
        {/* HEADER */}
        <div className="flex justify-between">
          <div className="flex gap-6">
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
          <div className="flex gap-6">
            <Tooltip placement="left">
              <TooltipTrigger asChild={true}>
                {" "}
                <HiOutlineQuestionMarkCircle
                  size={30}
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
        </div>

        <div className="bg-white/10 mt-4 mb-6 h-px">{"\u200e"}</div>

        {/* TABLE */}
        <div className="flex overflow-y-auto">
          <table className="w-full mr-10 mb-1">
            <thead>
              <tr>
                <th className="flex justify-center items-center gap-2 font-semibold pb-5">
                  <h2>{!swapped ? "Arcane Power Range" : "Sacred Power"}</h2>
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
                          The current <span>Arcane Power range</span> you meet,{" "}
                          <br></br> compared to the <span>map requirement</span>
                        </>
                      ) : (
                        <>
                          The difference between <span>your Sacred Power</span>
                          <br></br>and the <span>map requirement</span>
                        </>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="font-semibold pb-5">Damage Dealt</th>
                <th className="font-semibold pb-5">Damage Taken</th>
              </tr>
            </thead>
            <tbody>
              {!swapped
                ? arcaneRatioData.map((requirement, index) => (
                    <tr key={index} className="hover:bg-dark">
                      <td className="text-center text-sm border border-white/5 py-[5px]">
                        {requirement.arcanePower}
                      </td>
                      <td className="text-center text-sm border border-white/5 py-[5px]">
                        {requirement.damageDealt}%
                      </td>
                      <td className="border border-white/5 py-[5px]">
                        <div className="flex justify-center items-center gap-2">
                          {!swapped && index === 8 && (
                            <MdOutlineInfo size={18} className="collapse" />
                          )}
                          <p className="text-sm text-center">
                            {requirement.damageTaken}%
                          </p>
                          {!swapped && index === 8 && (
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
                      <td className="text-center text-sm border border-white/5 py-[5px]">
                        {requirement.sacredPower}
                      </td>
                      <td className="text-center text-sm border border-white/5 py-[5px]">
                        {requirement.damageDealt}%
                      </td>
                      <td className="text-center text-sm border border-white/5 py-[5px]">
                        {requirement.damageTaken}%
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* CONDITIONAL SIDEBAR */}
          <div className={cn("bg-dark w-[10px]", swapped && "hidden")}></div>
        </div>
      </div>
    </div>
  );
};

export default RatioTable;
