import { useEffect, useMemo } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { TbSlash } from "react-icons/tb";
import { MdOutlineInfo } from "react-icons/md";
import { dayjs } from "../../lib/dayjs";
import { FiUnlock, FiLock, FiCheck } from "react-icons/fi";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import {
  calculateDaysRemaining,
  cn,
  getDailySymbols,
  isMaxLevel,
  isValid,
  updateSymbol,
} from "../../lib/utils";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useAppStore } from "../../state/store";

const Calculator = () => {
  /* ――――――――――――――――――――― Declarations ――――――――――――――――――― */

  const symbols = useAppStore((s) => s.symbols);
  const setSymbols = useAppStore((s) => s.setSymbols);
  const selectedSymbol = useAppStore((s) => s.selectedSymbol);
  const swapped = useAppStore((s) => s.swapped);

  const { isMobile } = useBreakpoint();

  const currentSymbol = symbols[selectedSymbol];

  const nextExperience = currentSymbol?.symbolsRequired[currentSymbol.level];

  const readyForUpgrade = currentSymbol.experience >= nextExperience;

  /* ―――――――――――――――――――― Calculations ――――――――――――――――――― */

  const dailySymbols = getDailySymbols(currentSymbol);

  // Derived: days remaining until the next level upgrade.
  const daysToNextLevel = useMemo(() => {
    try {
      return calculateDaysRemaining(
        nextExperience - currentSymbol.experience,
        dailySymbols,
        !!currentSymbol.weekly
      );
    } catch {
      return NaN;
    }
  }, [nextExperience, currentSymbol.experience, dailySymbols, currentSymbol.weekly]);

  /*
   | Calculate Total Symbols Remaining
   ――――――――――――――――――――――――――――――――
  */

  // Single effect: compute and persist symbolsRemaining, daysRemaining, and
  // completion date in one atomic store update — replacing three previous effects
  // and a useMemo that caused cascading re-renders via intermediate store writes.
  useEffect(() => {
    try {
      const remaining =
        currentSymbol.symbolsRequired
          .slice(currentSymbol.level, !swapped ? 20 : 11)
          .reduce((acc, exp) => acc + exp, 0) - currentSymbol.experience;

      const daysTotal = calculateDaysRemaining(remaining, dailySymbols, !!currentSymbol.weekly);
      const completionDate = dayjs().add(daysTotal, "day").format("YYYY-MM-DD");

      // Object.is is NaN-safe (Object.is(NaN, NaN) === true), preventing the
      // infinite re-render loop caused by `NaN !== NaN` always being true.
      // Functional updater removes `symbols` from the dep array, which was the
      // feedback path that made the loop possible.
      if (
        !Object.is(remaining, currentSymbol.symbolsRemaining) ||
        !Object.is(daysTotal, currentSymbol.daysRemaining) ||
        completionDate !== currentSymbol.completion
      ) {
        setSymbols(
          updateSymbol(useAppStore.getState().symbols, selectedSymbol, {
            symbolsRemaining: remaining,
            daysRemaining: daysTotal,
            completion: completionDate,
          })
        );
      }
    } catch {
      // Invalid input (e.g. NaN level/exp) — silently skip.
    }
  }, [
    currentSymbol.daily,
    currentSymbol.extra,
    currentSymbol.weekly,
    currentSymbol.level,
    currentSymbol.experience,
    swapped,
    selectedSymbol,
  ]);

  // Derived overflow state: if the stored experience exceeds the next-level
  // requirement, compute how many levels would be gained and the leftover exp.
  // Using useMemo avoids the extra render cycle from a useState+useEffect pair.
  const { overflowLevel, overflowExperience } = useMemo(() => {
    let totalLevels = 0;
    let totalExp = 0;
    let oLevel = currentSymbol.level;
    currentSymbol.symbolsRequired.forEach((_, indexLevel) => {
      if (
        indexLevel >= currentSymbol.level &&
        currentSymbol.experience >= currentSymbol.symbolsRequired[indexLevel] + totalExp
      ) {
        totalLevels++;
        totalExp += currentSymbol.symbolsRequired[indexLevel];
        oLevel = currentSymbol.level + totalLevels;
      }
    });
    return { overflowLevel: oLevel, overflowExperience: currentSymbol.experience - totalExp };
  }, [currentSymbol.level, currentSymbol.experience, currentSymbol.symbolsRequired]);

  useEffect(() => {
    if (readyForUpgrade && currentSymbol.locked) {
      setSymbols(
        updateSymbol(useAppStore.getState().symbols, selectedSymbol, { experience: nextExperience })
      );
    }
  }, [currentSymbol.locked, readyForUpgrade, nextExperience, selectedSymbol]);

  useEffect(() => {
    if (
      currentSymbol.experience === 0 &&
      isMaxLevel(currentSymbol.level, swapped) &&
      !currentSymbol.locked
    ) {
      setSymbols(updateSymbol(useAppStore.getState().symbols, selectedSymbol, { locked: true }));
    }
  }, [
    currentSymbol.experience,
    currentSymbol.level,
    currentSymbol.locked,
    swapped,
    selectedSymbol,
  ]);

  /* ―――――――――――――――――――― Render Logic ――――――――――――――――――― */

  return (
    <section className="flex justify-center">
      <div className="mx-4 flex w-[360px] flex-col justify-between gap-8 rounded-t-lg bg-gradient-to-t from-card-tool to-card-grad py-8 md:w-full md:max-w-[700px] md:flex-row md:gap-0 md:py-16">
        {/* SYMBOL INPUTS */}
        <div className="flex w-full max-w-[360px] flex-col justify-between px-10 md:h-[250px]">
          <div className="flex items-center justify-center gap-4 pb-5 md:pb-6">
            {/* SYMBOL TITLE */}
            <img src={currentSymbol.img} alt={currentSymbol.name} width={33} />
            <p className="text-lg font-semibold uppercase tracking-wider text-primary md:text-xl">
              {currentSymbol.name}
            </p>
          </div>

          <Tooltip placement="bottom">
            <TooltipTrigger className="cursor-default">
              <div className="relative flex items-center justify-center gap-2 pb-6 pt-4">
                {/* LEVEL INPUT */}
                <input
                  type="number"
                  placeholder="Level"
                  value={isNaN(currentSymbol.level) ? "" : currentSymbol.level}
                  className="w-1/2 bg-secondary p-2 text-center text-sm tracking-wider text-secondary outline-none transition-colors hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary focus:outline-none md:p-2.5"
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    if (Number(e.target.value) < 0) {
                      setSymbols(updateSymbol(symbols, selectedSymbol, { level: NaN }));
                    } else if (e.target.value === "0") {
                      setSymbols(updateSymbol(symbols, selectedSymbol, { level: 1 }));
                    } else if (Number(e.target.value) >= (!swapped ? 20 : 11)) {
                      setSymbols(
                        updateSymbol(symbols, selectedSymbol, {
                          level: !swapped ? 20 : 11,
                          experience: 0,
                        })
                      );
                    } else {
                      setSymbols(
                        updateSymbol(symbols, selectedSymbol, { level: parseInt(e.target.value) })
                      );
                    }
                  }}
                ></input>

                <TbSlash size={30} color="#B2B2B2" className="mx-2 md:mx-0" />

                {/* LOCK FUNCTIONALITY */}
                <div className="absolute right-0">
                  <div
                    className={`h-[40px] w-[40px] ${
                      (!readyForUpgrade ||
                        isNaN(currentSymbol.experience) ||
                        currentSymbol.experience === 0 ||
                        !currentSymbol.level) &&
                      currentSymbol.locked &&
                      "hidden"
                    }`}
                  >
                    <Tooltip placement="bottom">
                      <TooltipTrigger className="translate-y-[11px]">
                        <FiUnlock
                          size={18}
                          color="#718571"
                          aria-label="Unlock experience cap"
                          onClick={() =>
                            setSymbols(
                              updateSymbol(symbols, selectedSymbol, {
                                locked: !currentSymbol.locked,
                              })
                            )
                          }
                          className={`cursor-pointer ${
                            (!currentSymbol.locked ||
                              !readyForUpgrade ||
                              isNaN(currentSymbol.experience) ||
                              currentSymbol.experience === 0) &&
                            "hidden"
                          }`}
                        />
                        <FiLock
                          size={18}
                          color="#857871"
                          aria-label="Lock experience cap"
                          onClick={() =>
                            setSymbols(
                              updateSymbol(symbols, selectedSymbol, {
                                locked: !currentSymbol.locked,
                              })
                            )
                          }
                          className={`cursor-pointer ${currentSymbol.locked && "hidden"}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="tooltip">
                        <span>{currentSymbol.locked ? "Unlock" : "Lock"}</span> experience cap
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div
                    className={`absolute translate-x-[47.5px] ${
                      currentSymbol.experience <= nextExperience && "pointer-events-none"
                    }`}
                  >
                    <FiCheck
                      size={20}
                      color={currentSymbol.experience > nextExperience ? "#718571" : "#857871"}
                      onClick={() =>
                        setSymbols(
                          updateSymbol(symbols, selectedSymbol, {
                            level: overflowLevel,
                            experience:
                              overflowLevel > currentSymbol.level ? overflowExperience : 0,
                            locked: true,
                          })
                        )
                      }
                      className={`translate-y-[-29.5px] cursor-pointer ${
                        currentSymbol.locked && "hidden"
                      }`}
                    />
                  </div>
                </div>

                {/* EXP INPUT */}
                <input
                  type="number"
                  placeholder={currentSymbol.locked ? "Experience" : "Exp"}
                  value={isNaN(currentSymbol.experience) ? "" : currentSymbol.experience}
                  className="w-1/2 bg-secondary p-2 text-center text-sm tracking-wider text-secondary outline-none transition-colors hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary focus:outline-none md:p-2.5"
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    const expCap = currentSymbol.locked
                      ? nextExperience
                      : currentSymbol.symbolsRequired.reduce((a, b) => a + b, 0);
                    if (!isValid(currentSymbol.level)) {
                      setSymbols(updateSymbol(symbols, selectedSymbol, { experience: NaN }));
                    } else if (Number(e.target.value) >= expCap) {
                      setSymbols(updateSymbol(symbols, selectedSymbol, { experience: expCap }));
                    } else if (Number(e.target.value) < 0) {
                      setSymbols(updateSymbol(symbols, selectedSymbol, { experience: NaN }));
                    } else if (e.target.value === "0" && currentSymbol.level === 1) {
                      setSymbols(updateSymbol(symbols, selectedSymbol, { experience: 1 }));
                    } else if (e.target.value === "00" || e.target.value === "000") {
                      currentSymbol.level === 1
                        ? setSymbols(updateSymbol(symbols, selectedSymbol, { experience: 1 }))
                        : (e.target.value = "0");
                    } else {
                      setSymbols(
                        updateSymbol(symbols, selectedSymbol, {
                          experience: parseInt(e.target.value),
                        })
                      );
                    }
                    if (e.target.value.startsWith("0")) {
                      e.target.value = e.target.value.substring(1);
                    }
                  }}
                ></input>
              </div>
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              <span>Symbol</span> Level / Exp
            </TooltipContent>
          </Tooltip>

          {/* DAILY / WEEKLY BUTTONS */}
          <div className="flex gap-3 pb-4 md:gap-2.5">
            <Tooltip placement="bottom">
              <TooltipTrigger asChild={true}>
                <button
                  className={cn(
                    "w-full select-none border-b-[2px] border-unchecked/80 bg-secondary py-1.5 text-sm tracking-wider text-secondary transition-[background-color] hover:bg-hover hover:text-primary focus:outline-accent md:border-unchecked md:text-base",
                    currentSymbol.daily && "border-checked/80 md:border-checked"
                  )}
                  onClick={() =>
                    setSymbols(
                      updateSymbol(symbols, selectedSymbol, { daily: !currentSymbol.daily })
                    )
                  }
                >
                  Daily
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <span>[Daily Quest]</span>
                <br></br> {currentSymbol.dailyName}
              </TooltipContent>
            </Tooltip>

            <Tooltip placement="bottom">
              <TooltipTrigger asChild={true}>
                <button
                  className={cn(
                    "block w-full select-none border-b-[2px] border-unchecked/80 bg-secondary py-1.5 text-sm tracking-wider text-secondary transition-[background-color] hover:bg-hover hover:text-primary focus:outline-accent md:border-unchecked md:text-base",
                    currentSymbol.weekly && "border-checked/80 md:border-checked",
                    typeof currentSymbol.weekly === "undefined" && "hidden"
                  )}
                  onClick={() =>
                    setSymbols(
                      updateSymbol(symbols, selectedSymbol, { weekly: !currentSymbol.weekly })
                    )
                  }
                >
                  Weekly
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <span>[Weekly Quest]</span>
                <br></br> {currentSymbol.weeklyName}
              </TooltipContent>
            </Tooltip>

            <Tooltip placement="bottom">
              <TooltipTrigger asChild={true}>
                <button
                  className={cn(
                    "block w-full select-none border-b-[2px] border-unchecked/80 bg-secondary py-1.5 text-sm tracking-wider text-secondary transition-[background-color] hover:bg-hover hover:text-primary focus:outline-accent md:border-unchecked md:text-base",
                    currentSymbol.extra && "border-checked/80 md:border-checked",
                    typeof currentSymbol.extra === "undefined" && "hidden"
                  )}
                  onClick={() =>
                    setSymbols(
                      updateSymbol(symbols, selectedSymbol, { extra: !currentSymbol.extra })
                    )
                  }
                >
                  Extra
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <span>[Unlocked]</span>
                <br></br> {currentSymbol.extraName}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* DAILY / WEEKLY COUNT */}
          <div
            className={cn(
              "flex flex-row justify-between pt-5 text-center text-xs text-tertiary md:pt-6 md:text-sm",
              currentSymbol.type === "sacred" && "justify-center"
            )}
          >
            <p>{dailySymbols} symbols / day</p>
            {currentSymbol.type === "arcane" && (
              <p>{currentSymbol.weekly ? 120 + " symbols / week" : 0 + " symbols / week"}</p>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="mx-auto h-px w-full bg-white/10 md:h-full md:w-px" />

        {/* LEVEL DETAILS */}
        <div
          className={cn(
            "flex w-full max-w-[360px] flex-col items-center justify-between px-8 text-center md:px-10",
            !isValid(currentSymbol.level) && "justify-center",
            isMaxLevel(currentSymbol.level, swapped) && "justify-center",
            currentSymbol.symbolsRequired.length <= 10 && "hidden"
          )}
        >
          {/* BEFORE > AFTER LEVEL */}
          {isValid(currentSymbol.level) &&
            !isMaxLevel(currentSymbol.level, swapped) &&
            currentSymbol.symbolsRequired.length === (!swapped ? 20 : 11) && (
              <div className="flex items-center gap-3 pt-0.5">
                <h1 className="text-base font-semibold tracking-wider text-primary md:text-xl">
                  Level <span>{currentSymbol.level}</span>
                </h1>
                <FaArrowRight size={!isMobile ? 20 : 15} />
                <h1 className="text-base font-semibold tracking-wider text-primary md:text-xl">
                  Level <span>{currentSymbol.level + 1}</span>
                </h1>
              </div>
            )}

          {/* NEXT LEVEL STATS */}
          {isValid(currentSymbol.level) &&
            !isMaxLevel(currentSymbol.level, swapped) &&
            currentSymbol.symbolsRequired.length === (!swapped ? 20 : 11) && (
              <div className="flex h-full flex-col justify-between gap-2 pt-5 md:gap-0 md:pt-10 [&_*]:text-sm [&_*]:md:text-base">
                {!readyForUpgrade &&
                  (currentSymbol.daily || currentSymbol.weekly) &&
                  isValid(currentSymbol.experience) && (
                    <div className="flex justify-center gap-1.5">
                      <p>
                        <span>{daysToNextLevel}</span>{" "}
                        {daysToNextLevel > 1 ? "days to go" : "day to go"}
                      </p>
                      <Tooltip placement={"top"}>
                        <TooltipTrigger asChild={true}>
                          {" "}
                          <MdOutlineInfo
                            size={20}
                            className="cursor-default fill-accent transition-colors hover:fill-white md:mt-0.5"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="tooltip">
                          The completion date assumes that <br></br> you have <span>completed</span>{" "}
                          both your <br></br> <span>daily</span> and <span>weekly</span> quests
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                {readyForUpgrade && (
                  <p>
                    <span>Ready</span> for upgrade
                  </p>
                )}

                {!isValid(currentSymbol.experience) ? (
                  <p>
                    <span>Experience</span> is not set
                  </p>
                ) : (
                  !currentSymbol.daily &&
                  !currentSymbol.weekly &&
                  !readyForUpgrade && (
                    <p>
                      <span>Quests</span> are not set
                    </p>
                  )
                )}

                {readyForUpgrade ? (
                  <p>
                    <span>Sufficient</span> symbols reached
                  </p>
                ) : isValid(currentSymbol.experience) ? (
                  <p>
                    <span>{nextExperience - currentSymbol.experience}</span>{" "}
                    {nextExperience - currentSymbol.experience > 1
                      ? "symbols remaining"
                      : "symbol remaining"}
                  </p>
                ) : (
                  <p>
                    <span>Unknown</span> symbols remaining
                  </p>
                )}

                <p className="pt-2.5 md:pt-8">
                  <span>{currentSymbol.mesosRequired[currentSymbol.level]?.toLocaleString()}</span>{" "}
                  mesos required
                </p>

                <div className="flex justify-center gap-1.5 pt-2.5 md:pt-8">
                  <p>
                    <span>{!swapped ? "+100" : "+200"}</span> main stat
                  </p>
                  <Tooltip placement={"right"}>
                    <TooltipTrigger asChild={true}>
                      {" "}
                      <MdOutlineInfo
                        size={20}
                        className="cursor-default fill-accent transition-colors hover:fill-white md:mt-0.5"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="tooltip">
                      <span>{!swapped ? "+2,100" : "+4,200"} </span> HP (Demon Avenger)<br></br>
                      <span>{!swapped ? "+48" : "+96"}</span> All Stat (Xenon)
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

          {/* MAX LEVEL / DISABLED LEVEL */}
          <div className="flex justify-center text-center">
            {isMaxLevel(currentSymbol.level, swapped) && (
              <p className="text-lg font-semibold tracking-widest text-accent md:text-2xl">
                MAX LEVEL
              </p>
            )}
            {!isValid(currentSymbol.level) && (
              <div className="space-y-1.5 md:space-y-3">
                <p className="text-lg font-semibold tracking-widest text-secondary md:text-2xl">
                  DISABLED
                </p>
                <p className="text-xs font-light tracking-widest text-secondary">
                  enter a level to enable this symbol
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
