import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { IoMdArrowDropdown } from "react-icons/io";
import { dayjs } from "../../lib/dayjs";
import { calculateDaysRemaining, cn, getDailySymbols } from "../../lib/utils";
import { useAppStore } from "../../state/store";
import { useBreakpoint } from "../../hooks/useBreakpoint";

const Overview = () => {
  const symbols = useAppStore((s) => s.symbols);
  const swapped = useAppStore((s) => s.swapped);

  const { isMobile, isTablet } = useBreakpoint();
  const [targetSymbol, setTargetSymbol] = useState(0);
  const [targetLevel, setTargetLevel] = useState(NaN);
  const [selectedNone, setSelectedNone] = useState(true);
  const [levelSet, setLevelSet] = useState(false);

  const currentSymbol = symbols[targetSymbol];

  const dailySymbols = getDailySymbols(currentSymbol);

  const targetSymbols = useMemo(
    () =>
      currentSymbol?.symbolsRequired
        .slice(currentSymbol.level, targetLevel)
        .reduce((accumulator, experience) => accumulator + experience, 0) -
      currentSymbol.experience,
    [currentSymbol, targetLevel]
  );

  const targetDays = useMemo(() => {
    try {
      return calculateDaysRemaining(targetSymbols, dailySymbols, !!currentSymbol.weekly);
    } catch {
      return NaN;
    }
  }, [targetSymbols, dailySymbols, currentSymbol.weekly]);

  const targetDate = dayjs().add(targetDays, "day").format("YYYY-MM-DD");

  useEffect(() => {
    setSelectedNone(true);
  }, [swapped]);

  useEffect(() => {
    setLevelSet(false);
  }, [targetSymbol, selectedNone]);

  useEffect(() => {
    if (isNaN(currentSymbol.level) || currentSymbol.level === (!swapped ? 20 : 11))
      setSelectedNone(true);
  }, [currentSymbol.level, swapped]);

  return (
    <section className="flex justify-center">
      <div className="mx-4 mt-16 flex w-[360px] max-w-[1050px] items-center justify-center rounded-lg bg-gradient-to-t from-card to-card-grad px-8 py-8 md:mx-8 md:mt-28 md:w-full md:px-10 md:py-10">
        <div className="flex w-full flex-col justify-center gap-4 md:gap-0">
          <div className="hidden items-center text-center text-tertiary md:flex">
            <div className="flex w-1/5 justify-center">
              <Tooltip>
                <TooltipTrigger asChild={true}>
                  {" "}
                  <HiOutlineQuestionMarkCircle
                    size={30}
                    className="cursor-default transition-all hover:stroke-white"
                  />
                </TooltipTrigger>
                <TooltipContent className="tooltip">
                  View the <span>individual level</span> requirements <br></br>
                  and dates for each symbol
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="w-1/5 tracking-wider">Symbol</p>
            <p className="w-1/5 tracking-wider">Target Level</p>
            <p className="w-1/5 tracking-wider">Completion Date</p>
            <p className="w-1/5 tracking-wider">Symbols Remaining</p>
          </div>
          <div className="flex items-center justify-center text-center text-tertiary md:hidden">
            <h1 className="tracking-wider">Symbol Overview</h1>
          </div>
          <hr className="h-px w-full opacity-10 md:my-8" />
          {symbols.map(
            (symbol, index) =>
              symbol.type === (!swapped ? "arcane" : "sacred") && (
                <div
                  key={index}
                  className={`${
                    targetSymbol === index &&
                    selectedNone === false &&
                    symbol.level < (!swapped ? 20 : 11) &&
                    "z-10 rounded-3xl shadow-level shadow-accent"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTargetSymbol(index);
                      setTargetLevel(NaN);
                      targetSymbol === index
                        ? setSelectedNone(!selectedNone)
                        : setSelectedNone(false);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-center hover:bg-dark md:justify-normal md:px-0 md:py-[17px]",
                      isMobile && "bg-dark",
                      isNaN(symbol.level) && "pointer-events-none opacity-25",
                      symbol.level === (!swapped ? 20 : 11) && "pointer-events-none",
                      targetSymbol === index && !selectedNone && symbol.level < (!swapped ? 20 : 11)
                        ? "rounded-t-3xl bg-dark hover:bg-gradient-to-b hover:from-light"
                        : "rounded-3xl"
                    )}
                  >
                    <div className="hidden w-1/4 scale-[103.5%] justify-center md:flex">
                      <img
                        src={symbol.img}
                        alt={symbol.name}
                        width={40}
                        className={`${isNaN(symbol.level) && "grayscale"}`}
                      ></img>
                    </div>
                    <div className="flex justify-center md:hidden">
                      <img
                        src={symbol.img}
                        alt={symbol.name}
                        width={!isMobile ? 37.5 : 35}
                        className={`${isNaN(symbol.level) && "grayscale"}`}
                      ></img>
                    </div>
                    <p className="text-center text-sm tracking-wider md:w-1/4 md:text-base">
                      {symbol.name}
                    </p>
                    <IoMdArrowDropdown
                      size={22.5}
                      className={cn(
                        "block w-[37.5px] md:hidden",
                        targetSymbol === index && !selectedNone && "rotate-180",
                        symbol.level === (!swapped ? 20 : 11) && "hidden"
                      )}
                    ></IoMdArrowDropdown>
                    <p
                      className={`w-[37.5px] text-sm text-accent md:text-base ${
                        symbol.level === (!swapped ? 20 : 11) && isMobile ? "block" : "hidden"
                      }`}
                    >
                      MAX
                    </p>
                    <p
                      className={`hidden md:block md:w-1/4 ${
                        isNaN(symbol.level) ? "grayscale filter" : "text-accent"
                      }`}
                    >
                      {symbol.level === (!swapped ? 20 : 11)
                        ? "MAX"
                        : isNaN(symbol.level)
                          ? "0"
                          : !swapped
                            ? 20
                            : 11}
                    </p>
                    <div className="hidden md:block md:w-1/4">
                      <p>
                        {symbol.level === (!swapped ? 20 : 11) || isNaN(symbol.level)
                          ? "‎"
                          : symbol.completion === "Invalid Date" ||
                              (!symbol.daily && !symbol.weekly) ||
                              isNaN(symbol.experience)
                            ? "Indefinite"
                            : symbol.daysRemaining === 0
                              ? "Complete"
                              : symbol.completion}
                      </p>
                      <div className="flex items-center justify-center space-x-1">
                        <p className="text-tertiary">
                          {symbol.level === (!swapped ? 20 : 11) || isNaN(symbol.level)
                            ? "‎"
                            : String(symbol.daysRemaining) === "Infinity" ||
                                isNaN(symbol.daysRemaining) ||
                                (!symbol.daily && !symbol.weekly) ||
                                isNaN(symbol.experience)
                              ? "? days"
                              : symbol.daysRemaining === 0
                                ? "Ready for upgrade"
                                : symbol.daysRemaining > 1
                                  ? symbol.daysRemaining + " days"
                                  : symbol.daysRemaining + " day"}
                        </p>
                      </div>
                    </div>
                    <p className="hidden md:block md:w-1/4">
                      {symbol.level === (!swapped ? 20 : 11) || isNaN(symbol.level)
                        ? "‎"
                        : isNaN(symbol.symbolsRemaining)
                          ? "?"
                          : symbol.symbolsRemaining <= 0
                            ? "0"
                            : symbol.symbolsRemaining}
                    </p>
                  </button>
                  <div
                    className={`flex flex-col items-center rounded-b-3xl bg-dark px-4 pb-4 text-center md:flex-row md:px-0 ${
                      isNaN(symbol.level) && "pointer-events-none opacity-25"
                    } ${symbol.level === (!swapped ? 20 : 11) && "pointer-events-none"} ${
                      targetSymbol === index &&
                      selectedNone === false &&
                      symbol.level < (!swapped ? 20 : 11)
                        ? "block border-secondary"
                        : "hidden"
                    }`}
                  >
                    <div className="relative hidden w-1/4 md:block">
                      <div className="absolute left-0 right-0 mx-auto h-[35px] w-px translate-y-[-35px] bg-white/10" />
                      <div className="absolute left-[50%] mx-auto h-px w-full w-full bg-white/10" />
                    </div>
                    <div className="relative hidden md:block md:w-1/4">
                      <div className="absolute left-[50%] mx-auto h-px w-[55%] bg-white/10" />
                    </div>
                    <div className="mb-4 flex w-full items-center justify-between md:mb-0 md:block md:w-1/4 md:justify-normal md:space-x-0">
                      <p className="block text-sm text-accent md:hidden md:text-base">
                        Target Level
                      </p>
                      <Tooltip placement="left">
                        <TooltipTrigger>
                          <input
                            type="number"
                            placeholder="Level"
                            value={
                              String(targetLevel) === "NaN" && levelSet === false && isMobile
                                ? !swapped
                                  ? 20
                                  : 11
                                : targetLevel
                            }
                            className="h-[25px] w-[60px] bg-secondary p-1.5 text-center text-sm outline-none transition-colors hover:bg-hover focus:bg-hover focus:outline-none md:h-[35px] md:w-[75px] md:text-base"
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => {
                              if (Number(e.target.value) < 0) {
                                setTargetLevel(NaN);
                                setLevelSet(true);
                              } else if (e.target.value === "0") {
                                setTargetLevel(1);
                                setLevelSet(true);
                              } else if (Number(e.target.value) >= (!swapped ? 20 : 11)) {
                                setTargetLevel(!swapped ? 20 : 11);
                                setLevelSet(true);
                              } else {
                                setTargetLevel(parseInt(e.target.value));
                                setLevelSet(true);
                              }
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="tooltip z-10">
                          Preview the remaining {isMobile ? "stats" : "days and"} <br></br>{" "}
                          {!isMobile && "symbols"} for the <span>specified level</span>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="mb-4 block h-px w-full bg-white/10 md:hidden" />

                    <div className="flex w-full flex-col justify-between md:flex md:w-1/4">
                      <div className="mb-5 flex w-full items-center justify-between md:mb-0 md:block md:justify-normal md:space-x-0">
                        <p className="block text-sm md:hidden">Completion Date</p>
                        <div>
                          <p className="text-sm text-tertiary md:text-base md:text-secondary">
                            {targetSymbols === 0 && currentSymbol.experience !== 0
                              ? "Complete"
                              : targetLevel <= symbol.level ||
                                  isNaN(currentSymbol.experience) ||
                                  isNaN(targetLevel) ||
                                  (!currentSymbol.daily && !currentSymbol.weekly) ||
                                  targetDate === "Invalid Date"
                                ? "Indefinite"
                                : targetDays <= 0
                                  ? "Complete"
                                  : targetDate}
                          </p>
                        </div>
                      </div>
                      <div className="mb-5 flex w-full items-center justify-between md:mb-0 md:block md:justify-normal md:space-x-0">
                        <p className="block text-sm md:hidden">Days Remaining</p>

                        <div className="flex flex-row-reverse items-center justify-center md:flex-row md:space-x-1">
                          <p className="ml-1 text-sm text-tertiary md:ml-0 md:text-base">
                            {targetSymbols === 0 && currentSymbol.experience !== 0
                              ? "Ready for upgrade"
                              : targetLevel <= symbol.level
                                ? isTablet
                                  ? "Level too low"
                                  : "Level must be over " + symbol.level
                                : isNaN(targetLevel)
                                  ? isTablet
                                    ? "Enter a level"
                                    : "Enter a target level"
                                  : String(targetDays) === "Infinity" ||
                                      String(targetDays) === "-Infinity" ||
                                      isNaN(targetDays) ||
                                      (!currentSymbol.daily && !currentSymbol.weekly) ||
                                      isNaN(currentSymbol.experience)
                                    ? "? days"
                                    : targetDays > 1
                                      ? targetDays + " days"
                                      : targetDays <= 0
                                        ? "Ready for upgrade"
                                        : targetDays + " day"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between md:block md:w-1/4 md:justify-normal md:space-x-0">
                      <p className="block text-sm md:hidden">Symbols Remaining</p>
                      <p className="text-sm text-tertiary md:text-base md:text-secondary">
                        {isNaN(targetSymbols) ||
                        targetSymbols < 0 ||
                        (currentSymbol.experience === 0 &&
                          (targetLevel <= currentSymbol.level || isNaN(targetLevel)))
                          ? targetSymbols <= 0
                            ? "0"
                            : "?"
                          : targetSymbols}
                      </p>
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </section>
  );
};

export default Overview;
