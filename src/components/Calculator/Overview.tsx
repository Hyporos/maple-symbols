import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { useMediaQuery } from "react-responsive";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdOutlineInfo } from "react-icons/md";
import dayjs from "dayjs";
import { cn } from "../../lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";

interface Props {
  symbols: [
    {
      name: string;
      img: string;
      alt: string;
      type: string;
      level: number;
      extra: boolean;
      daily: boolean;
      dailySymbols: number;
      weekly: boolean;
      experience: number;
      symbolsRemaining: number;
      daysRemaining: number;
      completion: string;
      symbolsRequired: Array<number>;
    }
  ];
}

const Overview = ({ symbols }: Props) => {
  const swapped = useSelector((state: RootState) => state.selector.swapped);

  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });
  const isTablet = useMediaQuery({ query: `(max-width: 1149px)` });
  const [targetSymbol, setTargetSymbol] = useState(0);
  const [targetLevel, setTargetLevel] = useState(NaN);
  const [targetDays, setTargetDays] = useState(NaN);
  const [selectedNone, setSelectedNone] = useState(true);
  const [levelSet, setLevelSet] = useState(false);

  const currentSymbol = symbols[targetSymbol];

  const dailySymbols = currentSymbol.daily
    ? currentSymbol.dailySymbols *
      (currentSymbol.extra ? (currentSymbol.type === "arcane" ? 2 : 1.5) : 1)
    : 0;

  const targetSymbols =
    currentSymbol?.symbolsRequired
      .slice(currentSymbol.level, targetLevel)
      .reduce((accumulator, experience) => accumulator + experience, 0) -
    currentSymbol.experience;

  useMemo(() => {
    try {
      let days = 0;
      let count = 0;
      let resets = 0;
      let mondayReached = false;
      for (let i = 0; i < 1000; i++) {
        if (
          days * dailySymbols + (currentSymbol.weekly ? resets * 120 : 0) <
          targetSymbols
        ) {
          if (
            // ? Should this be a while loop? while monday false
            mondayReached === false &&
            dayjs().add(count, "day").isBefore(dayjs().day(8))
          ) {
            count++;
            if (dayjs().add(count, "day").isSame(dayjs().day(8))) {
              //resets++; // ? Should the 'Weekly Done' toggle be included?
              mondayReached = true;
            }
          } else if ((days - count) % 7 === 0) {
            resets++;
          }
          days++;
        }
      }
      setTargetDays(days);
    } catch (e) {
      ////console.log(e as Error);
    }
  }, [
    targetLevel,
    currentSymbol.level,
    currentSymbol.experience,
    currentSymbol.weekly,
    currentSymbol.daily,
    currentSymbol.extra,
  ]);

  const targetDate = dayjs()
    .add(targetDays, "day")
    .format("YYYY-MM-DD")
    .toString();

  useEffect(() => {
    setSelectedNone(true);
  }, [swapped]);

  useMemo(() => {
    setLevelSet(false);
  }, [targetSymbol, selectedNone]);

  useEffect(() => {
    if (
      isNaN(currentSymbol.level) ||
      currentSymbol.level === (!swapped ? 20 : 11)
    )
      setSelectedNone(true);
  }, [currentSymbol.level]);

  const newAgeCheck = (
    completionDate: string,
    name: string,
    level: number,
    daily: boolean,
    weekly: boolean
  ) => {
    if (
      name != "Hotel Arcus" &&
      level !== (!swapped ? 20 : 11) &&
      !isNaN(level) &&
      (daily || weekly)
    )
      return dayjs(completionDate).isAfter(dayjs("2053-11-14")); // DISABLED TEMPORARILY
  };

  return (
    <section className="flex justify-center">
      <div className="flex justify-center items-center bg-gradient-to-t from-card to-card-grad rounded-lg px-8 md:px-10 py-8 md:py-10 mt-16 md:mt-28 mx-4 md:mx-8 w-[360px] md:w-full max-w-[1050px]">
        <div className="flex flex-col justify-center gap-4 md:gap-0 w-full">
          <div className="hidden items-center text-center text-tertiary md:flex">
            <div className="w-1/5 flex justify-center">
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
          <div className="flex justify-center items-center text-center text-tertiary md:hidden">
            <h1 className="tracking-wider">Symbol Overview</h1>
          </div>
          <hr className="opacity-10 md:my-8 h-px w-full" />
          {symbols.map(
            (symbol, index) =>
              symbol.type === (!swapped ? "arcane" : "sacred") && (
                <div
                  key={index}
                  className={`${
                    targetSymbol === index &&
                    selectedNone === false &&
                    symbol.level < (!swapped ? 20 : 11) &&
                    "rounded-3xl shadow-level shadow-accent z-10"
                  }`}
                >
                  <div
                    onClick={() => {
                      setTargetSymbol(index);
                      setTargetLevel(NaN);
                      targetSymbol === index
                        ? setSelectedNone(!selectedNone)
                        : setSelectedNone(false);
                    }}
                    className={cn("flex justify-between px-4 md:px-0 md:justify-normal items-center text-center hover:bg-dark cursor-pointer py-3.5 md:py-[17px]",
                    isMobile && "bg-dark",
                    (isNaN(symbol.level) || symbol.level === null) && "opacity-25 pointer-events-none",
                    symbol.level === (!swapped ? 20 : 11) && "pointer-events-none",
                    targetSymbol === index && !selectedNone && symbol.level < (!swapped ? 20 : 11) ? "bg-dark hover:bg-gradient-to-b hover:from-light rounded-t-3xl" : "rounded-3xl")}
                  >
                    <div className="hidden md:flex w-1/4 justify-center scale-[103.5%]">
                      <img
                        src={symbol.img}
                        alt={symbol.alt}
                        width={40}
                        className={`${
                          (isNaN(symbol.level) || symbol.level === null) &&
                          "grayscale"
                        }`}
                      ></img>
                    </div>
                    <div className="flex md:hidden justify-center">
                      <img
                        src={symbol.img}
                        alt={symbol.alt}
                        width={!isMobile ? 37.5 : 35}
                        className={`${
                          (isNaN(symbol.level) || symbol.level === null) &&
                          "grayscale"
                        }`}
                      ></img>
                    </div>
                    <p className="text-sm md:text-base md:w-1/4 tracking-wider text-center">
                      {symbol.name}
                    </p>
                    <IoMdArrowDropdown
                      size={22.5}
                      className={cn(
                        "block md:hidden w-[37.5px]",
                        targetSymbol === index && !selectedNone && "rotate-180",
                        symbol.level === (!swapped ? 20 : 11) && "hidden"
                      )}
                    ></IoMdArrowDropdown>
                    <p
                      className={`text-sm md:text-base w-[37.5px] text-accent ${
                        symbol.level === (!swapped ? 20 : 11) && isMobile
                          ? "block"
                          : "hidden"
                      }`}
                    >
                      MAX
                    </p>
                    <p
                      className={`md:w-1/4 hidden md:block ${
                        isNaN(symbol.level) || symbol.level === null
                          ? "filter grayscale"
                          : "text-accent"
                      }`}
                    >
                      {symbol.level === (!swapped ? 20 : 11)
                        ? "MAX"
                        : isNaN(symbol.level) || symbol.level === null
                        ? "0"
                        : !swapped
                        ? 20
                        : 11}
                    </p>
                    <div className="md:w-1/4 hidden md:block">
                      <p>
                        {symbol.level === (!swapped ? 20 : 11) ||
                        isNaN(symbol.level) ||
                        symbol.level === null
                          ? "‎"
                          : symbol.completion === "Invalid Date" ||
                            (!symbol.daily && !symbol.weekly) ||
                            isNaN(symbol.experience) ||
                            symbol.experience === null
                          ? "Indefinite"
                          : symbol.daysRemaining === 0
                          ? "Complete"
                          : symbol.completion}
                      </p>
                      <div className="flex justify-center items-center space-x-1">
                        <p className="text-tertiary">
                          {symbol.level === (!swapped ? 20 : 11) ||
                          isNaN(symbol.level) ||
                          symbol.level === null
                            ? "‎"
                            : String(symbol.daysRemaining) === "Infinity" ||
                              isNaN(symbol.daysRemaining) ||
                              (!symbol.daily && !symbol.weekly) ||
                              isNaN(symbol.experience) ||
                              symbol.experience === null
                            ? "? days"
                            : symbol.daysRemaining === 0
                            ? "Ready for upgrade"
                            : symbol.daysRemaining > 1
                            ? symbol.daysRemaining + " days"
                            : symbol.daysRemaining + " day"}
                        </p>
                        <Tooltip placement="top">
                          <TooltipTrigger
                            className={`${
                              !newAgeCheck(
                                symbol.completion,
                                symbol.name,
                                symbol.level,
                                symbol.daily,
                                symbol.weekly
                              ) && "hidden"
                            }`}
                          >
                            <MdOutlineInfo
                              size={20}
                              className={`fill-accent hover:fill-white cursor-default transition-all mt-0.5`}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="tooltip z-10">
                            Around <span>November 15th</span>, an update will{" "}
                            <span>increase</span> <br></br> the daily symbol
                            count for {symbol.name}. <br></br> The completion
                            date will be <span>sooner</span> than it shows.{" "}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <p className="md:w-1/4 hidden md:block">
                      {symbol.level === (!swapped ? 20 : 11) ||
                      isNaN(symbol.level) ||
                      symbol.level === null
                        ? "‎"
                        : isNaN(symbol.symbolsRemaining) ||
                          symbol.symbolsRemaining === null ||
                          symbol.experience === null
                        ? "?"
                        : symbol.symbolsRemaining <= 0
                        ? "0"
                        : symbol.symbolsRemaining}
                    </p>
                  </div>
                  <div
                    className={`flex items-center flex-col md:flex-row px-4 md:px-0 text-center rounded-b-3xl bg-dark pb-4 ${
                      (isNaN(symbol.level) || symbol.level === null) &&
                      "opacity-25 pointer-events-none"
                    } ${
                      symbol.level === (!swapped ? 20 : 11) &&
                      "pointer-events-none"
                    } ${
                      targetSymbol === index &&
                      selectedNone === false &&
                      symbol.level < (!swapped ? 20 : 11)
                        ? "block border-secondary"
                        : "hidden"
                    }`}
                  >
                    <div className="hidden md:block relative w-1/4">
                      <div className="absolute bg-white/10 left-0 right-0 mx-auto translate-y-[-35px] w-px h-[35px]" />
                      <div className="absolute bg-white/10 left-[50%] mx-auto w-full w-full h-px" />
                    </div>
                    <div className="hidden md:block relative md:w-1/4">
                      <div className="absolute bg-white/10 left-[50%] mx-auto w-[55%] h-px" />
                    </div>
                    <div className="flex md:block md:w-1/4 items-center justify-between md:justify-normal w-full md:space-x-0 mb-4 md:mb-0">
                      <p className="block text-sm md:text-base md:hidden text-accent">
                        Target Level
                      </p>
                      <Tooltip placement="left">
                        <TooltipTrigger>
                          <input
                            type="number"
                            placeholder="Level"
                            value={
                              String(targetLevel) === "NaN" &&
                              levelSet === false &&
                              isMobile
                                ? setTargetLevel(!swapped ? 20 : 11)
                                : targetLevel
                            }
                            className="h-[25px] md:h-[35px] w-[60px] md:w-[75px] p-1.5 text-sm md:text-base text-center bg-secondary hover:bg-hover focus:bg-hover outline-none focus:outline-none transition-colors"
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => {
                              if (
                                Number(e.target.value) <= (!swapped ? 20 : 11)
                              ) {
                                setTargetLevel(parseInt(e.target.value));
                                setLevelSet(true);
                              }
                              if (
                                Number(e.target.value) >= (!swapped ? 20 : 11)
                              ) {
                                setTargetLevel(!swapped ? 20 : 11);
                                setLevelSet(true);
                              }
                              if (Number(e.target.value) < 0) {
                                setTargetLevel(NaN);
                                setLevelSet(true);
                              }
                              if (e.target.value === "0") {
                                setTargetLevel(1);
                                setLevelSet(true);
                              }
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="tooltip z-10">
                          Preview the remaining{" "}
                          {isMobile ? "stats" : "days and"} <br></br>{" "}
                          {!isMobile && "symbols"} for the{" "}
                          <span>specified level</span>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="block md:hidden bg-white/10 mb-4 h-px w-full" />

                    <div className="md:w-1/4 flex justify-between w-full flex-col md:flex">
                      <div className="flex md:block justify-between md:justify-normal w-full items-center md:space-x-0 mb-5 md:mb-0">
                        <p className="block md:hidden text-sm">
                          Completion Date
                        </p>
                        <div>
                          <p className="text-tertiary md:text-secondary text-sm md:text-base">
                            {targetSymbols === 0 &&
                            currentSymbol.experience !== null &&
                            currentSymbol.experience !== 0
                              ? "Complete"
                              : targetLevel <= symbol.level ||
                                isNaN(currentSymbol.experience) ||
                                currentSymbol.experience === null ||
                                isNaN(targetLevel) ||
                                (!currentSymbol.daily &&
                                  !currentSymbol.weekly) ||
                                targetDate === "Invalid Date"
                              ? "Indefinite"
                              : targetDays <= 0
                              ? "Complete"
                              : targetDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex md:block justify-between md:justify-normal w-full items-center md:space-x-0 mb-5 md:mb-0">
                        <p className="block md:hidden text-sm">
                          Days Remaining
                        </p>

                        <div className="flex md:space-x-1 justify-center items-center flex-row-reverse md:flex-row">
                          <p className="text-tertiary ml-1 md:ml-0 text-sm md:text-base">
                            {targetSymbols === 0 &&
                            currentSymbol.experience !== null &&
                            currentSymbol.experience !== 0
                              ? "Ready for upgrade"
                              : targetLevel <= symbol.level
                              ? isTablet
                                ? "Level too low"
                                : "Level must be over " + symbol.level
                              : isNaN(targetLevel)
                              ? isTablet
                                ? "Enter a level"
                                : "Enter a target level"
                              : String(targetDays) ===
                                  ("Infinity" || "-Infiinity") ||
                                isNaN(targetDays) ||
                                (!currentSymbol.daily &&
                                  !currentSymbol.weekly) ||
                                isNaN(currentSymbol.experience) ||
                                currentSymbol.experience === null
                              ? "? days"
                              : targetDays > 1
                              ? targetDays + " days"
                              : targetDays <= 0
                              ? "Ready for upgrade"
                              : targetDays + " day"}
                          </p>
                          <Tooltip placement="top">
                            <TooltipTrigger
                              className={`${
                                !newAgeCheck(
                                  targetDate,
                                  symbol.name,
                                  symbol.level,
                                  symbol.daily,
                                  symbol.weekly
                                ) && "hidden"
                              }`}
                            >
                              <MdOutlineInfo
                                size={20}
                                className={`fill-accent hover:fill-white cursor-default transition-all mt-0.5`}
                              />
                            </TooltipTrigger>
                            <TooltipContent className="tooltip z-10">
                              Around <span>November 15th</span>, an update will{" "}
                              <span>increase</span> <br></br> the daily symbol
                              count for {symbol.name}. <br></br> The completion
                              date will be <span>sooner</span> than it shows.{" "}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-1/4 flex md:block justify-between md:justify-normal items-center w-full md:space-x-0">
                      <p className="block md:hidden text-sm">
                        Symbols Remaining
                      </p>
                      <p className="text-tertiary md:text-secondary text-sm md:text-base">
                        {isNaN(targetSymbols) ||
                        targetSymbols < 0 ||
                        currentSymbol.experience === null ||
                        (currentSymbol.experience === 0 &&
                          (targetLevel <= currentSymbol.level ||
                            isNaN(targetLevel)))
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
