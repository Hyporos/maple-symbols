import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { useMediaQuery } from "react-responsive";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { cn } from "../../lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";

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
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The ExpTable component displays both individual and cumulative symbol exp requirements/cost.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ExpTable = ({ symbols }: ExpTableProps) => {
  const swapped = useSelector((state: RootState) => state.selector.swapped);

  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });
  let totalExp = 0;

  return (
    <div className="flex pt-10 h-[535px] md:h-[555px]">
      <div className="flex flex-col mx-8 md:mx-10 w-full">
        {/* HEADER */}
        <div className="flex justify-between">
          <div className="flex items-center gap-5 md:gap-6">
            <img
              src={`/symbols/empty-${!swapped ? "arcane" : "sacred"}.webp`}
              width={!isMobile ? 32.5 : 30}
              className="scale-110"
            />
            <div className="bg-white/10 w-px h-full"></div>
            <h1 className="text-lg md:text-2xl font-semibold">
              {!swapped ? "Arcane Symbols" : "Sacred Symbols"}
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
              Displays <span>symbols required</span> to level up <br></br>to the{" "}
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
                  {!isMobile ? "Symbols Required" : "Exp Required"}
                </th>
                <th className="text-sm md:text-base font-semibold pb-5">
                  {!isMobile ? "Total Experience" : "Total Symbols"}
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {symbols[!swapped ? 0 : (6 | 0)]?.symbolsRequired.map(
                (symbols, index) => {
                  const isFirstRow = index === 0;
                  totalExp += symbols;

                  return (
                    <tr key={index} className="hover:bg-dark">
                      <td className="text-center text-xs md:text-sm border border-white/5 py-[5px]">
                        {index + 1}
                      </td>
                      <td className="text-center text-xs md:text-sm border border-white/5 py-[5px]">
                        {isFirstRow ? "-" : symbols.toLocaleString()}
                      </td>
                      <td className="text-center text-xs md:text-sm border border-white/5 py-[5px]">
                        {isFirstRow ? "-" : totalExp.toLocaleString()}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>

          {/* CONDITIONAL SIDEBAR */}
          <div
            className={cn(
              "bg-dark w-[11px]",
              !swapped && "hidden",
              isMobile && "hidden"
            )}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ExpTable;
