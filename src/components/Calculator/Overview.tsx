import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { IoMdArrowDropdown } from "react-icons/io";
import { gameToday } from "../../lib/regions";
import { calculateDaysRemaining, cn, getDailySymbols } from "../../lib/utils";
import { collapsedRowLabels, targetPanelLabels } from "../../lib/overview";
import { clampNumberInput } from "../../lib/inputs";
import { maxLevelFor } from "../../lib/game";
import { useAppStore } from "../../state/store";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { targetBucket, trackOnce } from "../../lib/analytics";
import { useLocale, useNameSet, useMessages } from "../../i18n";
import { symbolNames } from "../../i18n/gameNames";
import Message from "../../i18n/Message";

const Overview = () => {
  const m = useMessages().overview;
  const locale = useLocale();
  const nameSet = useNameSet();

  const symbols = useAppStore((s) => s.symbols);
  const mode = useAppStore((s) => s.mode);
  const region = useAppStore((s) => s.region);

  const { isMobile, isTablet } = useBreakpoint();
  const [targetId, setTargetId] = useState(1); // Vanishing Journey
  const [targetLevel, setTargetLevel] = useState(NaN);
  const [selectedNone, setSelectedNone] = useState(true);
  const [levelSet, setLevelSet] = useState(false);

  const currentSymbol = symbols.find((symbol) => symbol.id === targetId) ?? symbols[0];

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
      return calculateDaysRemaining(
        targetSymbols,
        dailySymbols,
        !!currentSymbol.weekly,
        gameToday(region),
        region
      );
    } catch {
      return NaN;
    }
  }, [targetSymbols, dailySymbols, currentSymbol.weekly, region]);

  const targetDate = gameToday(region).add(targetDays, "day").format("YYYY-MM-DD");
  const maxLevel = maxLevelFor(mode);

  // Row strings (collapsed line and target panel) are pure functions of state; see lib/overview.
  const today = gameToday(region);
  const rowLabels = symbols.map((symbol) =>
    collapsedRowLabels(symbol, maxLevel, m, today, region, locale)
  );
  const panelLabels = symbols.map((symbol) =>
    targetPanelLabels({
      rowLevel: symbol.level,
      current: currentSymbol,
      targetLevel,
      targetSymbols,
      targetDays,
      targetDate,
      isTablet,
      m,
      locale,
    })
  );

  useEffect(() => {
    setSelectedNone(true);
  }, [mode]);

  useEffect(() => {
    setLevelSet(false);
  }, [targetId, selectedNone]);

  useEffect(() => {
    if (isNaN(currentSymbol.level) || currentSymbol.level === maxLevel) setSelectedNone(true);
  }, [currentSymbol.level, mode]);

  return (
    <section className="flex justify-center">
      <div className="mx-4 mt-16 flex w-[360px] max-w-[1050px] items-center justify-center rounded-lg bg-linear-to-t from-card to-card-grad px-8 py-8 md:mx-8 md:mt-28 md:w-full md:px-10 md:py-10">
        <div className="flex w-full flex-col justify-center gap-4 md:gap-0">
          <div className="hidden items-center text-center text-tertiary md:flex">
            <div className="flex w-1/5 justify-center">
              <Tooltip>
                <TooltipTrigger>
                  <HiOutlineQuestionMarkCircle
                    size={30}
                    className="cursor-default transition-all hover:stroke-white"
                  />
                </TooltipTrigger>
                <TooltipContent className="tooltip">
                  <Message text={m.headerTooltip} />
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="w-1/5 tracking-wider">{m.symbol}</p>
            <p className="w-1/5 tracking-wider">{m.targetLevel}</p>
            <p className="w-1/5 tracking-wider">{m.completionDate}</p>
            <p className="w-1/5 tracking-wider">{m.symbolsRemaining}</p>
          </div>
          <div className="flex items-center justify-center text-center text-tertiary md:hidden">
            <h1 className="tracking-wider">{m.mobileTitle}</h1>
          </div>
          <hr className="h-px w-full opacity-10 md:my-8" />
          {symbols.map(
            (symbol, index) =>
              symbol.type === mode && (
                <div
                  key={symbol.id}
                  className={`${
                    targetId === symbol.id &&
                    selectedNone === false &&
                    symbol.level < maxLevel &&
                    "z-10 rounded-3xl shadow-level shadow-accent"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTargetId(symbol.id);
                      setTargetLevel(NaN);
                      targetId === symbol.id
                        ? setSelectedNone(!selectedNone)
                        : setSelectedNone(false);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-center hover:bg-dark md:justify-normal md:px-0 md:py-[17px]",
                      isMobile && "bg-dark",
                      isNaN(symbol.level) && "pointer-events-none opacity-25",
                      symbol.level === maxLevel && "pointer-events-none",
                      targetId === symbol.id && !selectedNone && symbol.level < maxLevel
                        ? "rounded-t-3xl bg-dark hover:bg-linear-to-b hover:from-light"
                        : "rounded-3xl"
                    )}
                  >
                    <div className="hidden w-1/4 scale-[103.5%] justify-center md:flex">
                      <img
                        src={symbol.img}
                        alt={symbolNames(symbol, nameSet).name}
                        width={40}
                        className={`${isNaN(symbol.level) && "grayscale"}`}
                      ></img>
                    </div>
                    <div className="flex justify-center md:hidden">
                      <img
                        src={symbol.img}
                        alt={symbolNames(symbol, nameSet).name}
                        width={!isMobile ? 37.5 : 35}
                        className={`${isNaN(symbol.level) && "grayscale"}`}
                      ></img>
                    </div>
                    <p className="text-center text-sm tracking-wider md:w-1/4 md:text-base">
                      {symbolNames(symbol, nameSet).name}
                    </p>
                    <IoMdArrowDropdown
                      size={22.5}
                      className={cn(
                        "block w-[37.5px] md:hidden",
                        targetId === symbol.id && !selectedNone && "rotate-180",
                        symbol.level === maxLevel && "hidden"
                      )}
                    ></IoMdArrowDropdown>
                    <p
                      className={`w-[37.5px] text-sm text-accent md:text-base ${
                        symbol.level === maxLevel && isMobile ? "block" : "hidden"
                      }`}
                    >
                      {m.max}
                    </p>
                    <p
                      className={`hidden md:block md:w-1/4 ${
                        isNaN(symbol.level) ? "grayscale filter" : "text-accent"
                      }`}
                    >
                      {rowLabels[index].target}
                    </p>
                    <div className="hidden md:block md:w-1/4">
                      <p>{rowLabels[index].completion}</p>
                      <div className="flex items-center justify-center space-x-1">
                        <p className="text-tertiary">{rowLabels[index].days}</p>
                      </div>
                    </div>
                    <p className="hidden md:block md:w-1/4">{rowLabels[index].remaining}</p>
                  </button>
                  <div
                    className={`flex flex-col items-center rounded-b-3xl bg-dark px-4 pb-4 text-center md:flex-row md:px-0 ${
                      isNaN(symbol.level) && "pointer-events-none opacity-25"
                    } ${symbol.level === maxLevel && "pointer-events-none"} ${
                      targetId === symbol.id && selectedNone === false && symbol.level < maxLevel
                        ? "block border-secondary"
                        : "hidden"
                    }`}
                  >
                    <div className="relative hidden w-1/4 md:block">
                      <div className="absolute right-0 left-0 mx-auto h-[35px] w-px translate-y-[-35px] bg-white/10" />
                      <div className="absolute left-[50%] mx-auto h-px w-full bg-white/10" />
                    </div>
                    <div className="relative hidden md:block md:w-1/4">
                      <div className="absolute left-[50%] mx-auto h-px w-[55%] bg-white/10" />
                    </div>
                    <div className="mb-4 flex w-full items-center justify-between md:mb-0 md:block md:w-1/4 md:justify-normal md:space-x-0">
                      <p className="block text-sm text-accent md:hidden md:text-base">
                        {m.targetLevel}
                      </p>
                      <Tooltip placement="left">
                        <TooltipTrigger asChild={true}>
                          <input
                            type="number"
                            placeholder={m.levelPlaceholder}
                            value={
                              Number.isNaN(targetLevel)
                                ? levelSet === false && isMobile
                                  ? maxLevel
                                  : ""
                                : targetLevel
                            }
                            className="h-[25px] w-[60px] bg-secondary p-1.5 text-center text-sm outline-hidden transition-colors hover:bg-hover focus:bg-hover focus:outline-hidden md:h-[35px] md:w-[75px] md:text-base"
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => {
                              const level = clampNumberInput(e.target.value, maxLevel);
                              const bucket = targetBucket(level);
                              // Once per bucket per session: typing "16" passes through "1" (AN-5).
                              if (bucket) {
                                trackOnce(`overview_target:${bucket}`, "overview_target", {
                                  target_level: bucket,
                                });
                              }
                              setTargetLevel(level);
                              setLevelSet(true);
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="tooltip z-10">
                          <Message text={isMobile ? m.targetTooltipShort : m.targetTooltip} />
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="mb-4 block h-px w-full bg-white/10 md:hidden" />

                    <div className="flex w-full flex-col justify-between md:flex md:w-1/4">
                      <div className="mb-5 flex w-full items-center justify-between md:mb-0 md:block md:justify-normal md:space-x-0">
                        <p className="block text-sm md:hidden">{m.completionDate}</p>
                        <div>
                          <p className="text-sm text-tertiary md:text-base md:text-secondary">
                            {panelLabels[index].completion}
                          </p>
                        </div>
                      </div>
                      <div className="mb-5 flex w-full items-center justify-between md:mb-0 md:block md:justify-normal md:space-x-0">
                        <p className="block text-sm md:hidden">{m.daysRemaining}</p>

                        <div className="flex flex-row-reverse items-center justify-center md:flex-row md:space-x-1">
                          <p className="ml-1 text-sm text-tertiary md:ml-0 md:text-base">
                            {panelLabels[index].days}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between md:block md:w-1/4 md:justify-normal md:space-x-0">
                      <p className="block text-sm md:hidden">{m.symbolsRemaining}</p>
                      <p className="text-sm text-tertiary md:text-base md:text-secondary">
                        {panelLabels[index].remaining}
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
