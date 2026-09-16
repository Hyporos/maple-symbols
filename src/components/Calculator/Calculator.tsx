import { useEffect, useMemo } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { TbSlash } from "react-icons/tb";
import { MdOutlineInfo } from "react-icons/md";
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
import { useAppStore, useSelectedSymbol } from "../../state/store";
import { getOverflow } from "../../lib/calculator";
import { expCapFor, experienceInputValue, levelInputPatch } from "../../lib/inputs";
import { track, trackOnce } from "../../lib/analytics";
import { MAIN_STAT_PER_LEVEL, maxLevelFor, WEEKLY_SYMBOLS } from "../../lib/game";
import { formatNumber } from "../../lib/format";
import { useMessages } from "../../i18n";
import Message from "../../i18n/Message";

// Class-specific stat gains per symbol level, shown in the main stat tooltip.
const DEMON_AVENGER_HP = { arcane: 2100, sacred: 4200 } as const;
const XENON_ALL_STAT = { arcane: 48, sacred: 96 } as const;

const Calculator = () => {
  /* ――――――――――――――――――――― Declarations ――――――――――――――――――― */

  const m = useMessages().calculator;

  const symbols = useAppStore((s) => s.symbols);
  const setSymbols = useAppStore((s) => s.setSymbols);
  const selectedId = useAppStore((s) => s.selectedId);
  const mode = useAppStore((s) => s.mode);

  const { isMobile } = useBreakpoint();

  const currentSymbol = useSelectedSymbol();

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

  // Derived overflow state (cap unlocked): the levels the stored experience would buy and
  // the leftover. useMemo avoids the extra render cycle from a useState+useEffect pair.
  const { level: overflowLevel, experience: overflowExperience } = useMemo(
    () => getOverflow(currentSymbol),
    [currentSymbol]
  );

  useEffect(() => {
    if (readyForUpgrade && currentSymbol.locked) {
      setSymbols(
        updateSymbol(useAppStore.getState().symbols, selectedId, { experience: nextExperience })
      );
    }
  }, [currentSymbol.locked, readyForUpgrade, nextExperience, selectedId]);

  useEffect(() => {
    if (
      currentSymbol.experience === 0 &&
      isMaxLevel(currentSymbol.level, currentSymbol.type) &&
      !currentSymbol.locked
    ) {
      setSymbols(updateSymbol(useAppStore.getState().symbols, selectedId, { locked: true }));
    }
  }, [currentSymbol.experience, currentSymbol.level, currentSymbol.locked, mode, selectedId]);

  /* ―――――――――――――――――――― Render Logic ――――――――――――――――――― */

  return (
    <section className="flex justify-center">
      <div className="mx-4 flex w-[360px] flex-col justify-between gap-8 rounded-t-lg bg-linear-to-t from-card-tool to-card-grad py-8 md:w-full md:max-w-[700px] md:flex-row md:gap-0 md:py-16">
        {/* SYMBOL INPUTS */}
        <div className="flex w-full max-w-[360px] flex-col justify-between px-10 md:h-[250px]">
          <div className="flex items-center justify-center gap-4 pb-5 md:pb-6">
            {/* SYMBOL TITLE */}
            <img src={currentSymbol.img} alt={currentSymbol.name} width={33} />
            <p className="text-lg font-semibold tracking-wider text-primary uppercase md:text-xl">
              {currentSymbol.name}
            </p>
          </div>

          <Tooltip placement="bottom">
            <TooltipTrigger as="div" className="cursor-default">
              <div className="relative flex items-center justify-center gap-2 pt-4 pb-6">
                {/* LEVEL INPUT */}
                <input
                  type="number"
                  placeholder={m.levelPlaceholder}
                  value={isNaN(currentSymbol.level) ? "" : currentSymbol.level}
                  className="w-1/2 bg-secondary p-2 text-center text-sm tracking-wider text-secondary outline-hidden transition-colors hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary focus:outline-hidden md:p-2.5"
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    trackOnce("symbol_input:level", "symbol_input", {
                      field: "level",
                      mode: currentSymbol.type,
                    });
                    setSymbols(
                      updateSymbol(
                        symbols,
                        selectedId,
                        levelInputPatch(e.target.value, maxLevelFor(currentSymbol.type))
                      )
                    );
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
                          aria-label={m.unlockCap}
                          onClick={() => {
                            track("cap_unlocked");
                            setSymbols(
                              updateSymbol(symbols, selectedId, {
                                locked: !currentSymbol.locked,
                              })
                            );
                          }}
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
                          aria-label={m.lockCap}
                          onClick={() =>
                            setSymbols(
                              updateSymbol(symbols, selectedId, {
                                locked: !currentSymbol.locked,
                              })
                            )
                          }
                          className={`cursor-pointer ${currentSymbol.locked && "hidden"}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="tooltip">
                        <Message
                          text={currentSymbol.locked ? m.unlockCapTooltip : m.lockCapTooltip}
                        />
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
                      aria-label={m.applyOverflow}
                      color={currentSymbol.experience > nextExperience ? "#718571" : "#857871"}
                      onClick={() =>
                        setSymbols(
                          updateSymbol(symbols, selectedId, {
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
                  placeholder={
                    currentSymbol.locked ? m.experiencePlaceholder : m.experiencePlaceholderShort
                  }
                  value={isNaN(currentSymbol.experience) ? "" : currentSymbol.experience}
                  className="w-1/2 bg-secondary p-2 text-center text-sm tracking-wider text-secondary outline-hidden transition-colors hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary focus:outline-hidden md:p-2.5"
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    trackOnce("symbol_input:experience", "symbol_input", {
                      field: "experience",
                      mode: currentSymbol.type,
                    });
                    const experience = experienceInputValue(
                      e.target.value,
                      currentSymbol.level,
                      expCapFor(currentSymbol)
                    );
                    if (experience === null) {
                      e.target.value = "0"; // "00"/"000" above level 1: rewrite the field, store nothing
                    } else {
                      setSymbols(updateSymbol(symbols, selectedId, { experience }));
                    }
                    if (e.target.value.startsWith("0")) {
                      e.target.value = e.target.value.substring(1);
                    }
                  }}
                ></input>
              </div>
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              <Message text={m.inputsTooltip} />
            </TooltipContent>
          </Tooltip>

          {/* DAILY / WEEKLY BUTTONS */}
          <div className="flex gap-3 pb-4 md:gap-2.5">
            <Tooltip placement="bottom">
              <TooltipTrigger asChild={true}>
                <button
                  className={cn(
                    "w-full border-b-2 border-unchecked/80 bg-secondary py-1.5 text-sm tracking-wider text-secondary transition-[background-color] select-none hover:bg-hover hover:text-primary focus:outline-accent md:border-unchecked md:text-base",
                    currentSymbol.daily && "border-checked/80 md:border-checked"
                  )}
                  onClick={() => {
                    track("quest_toggle", {
                      quest: "daily",
                      state: currentSymbol.daily ? "off" : "on",
                    });
                    setSymbols(updateSymbol(symbols, selectedId, { daily: !currentSymbol.daily }));
                  }}
                >
                  {m.daily}
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <Message text={m.dailyTooltip} values={{ quest: currentSymbol.dailyName }} />
              </TooltipContent>
            </Tooltip>

            <Tooltip placement="bottom">
              <TooltipTrigger asChild={true}>
                <button
                  className={cn(
                    "block w-full border-b-2 border-unchecked/80 bg-secondary py-1.5 text-sm tracking-wider text-secondary transition-[background-color] select-none hover:bg-hover hover:text-primary focus:outline-accent md:border-unchecked md:text-base",
                    currentSymbol.weekly && "border-checked/80 md:border-checked",
                    typeof currentSymbol.weekly === "undefined" && "hidden"
                  )}
                  onClick={() => {
                    track("quest_toggle", {
                      quest: "weekly",
                      state: currentSymbol.weekly ? "off" : "on",
                    });
                    setSymbols(
                      updateSymbol(symbols, selectedId, { weekly: !currentSymbol.weekly })
                    );
                  }}
                >
                  {m.weekly}
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <Message
                  text={m.weeklyTooltip}
                  values={{ quest: currentSymbol.weeklyName ?? "" }}
                />
              </TooltipContent>
            </Tooltip>

            <Tooltip placement="bottom">
              <TooltipTrigger asChild={true}>
                <button
                  className={cn(
                    "block w-full border-b-2 border-unchecked/80 bg-secondary py-1.5 text-sm tracking-wider text-secondary transition-[background-color] select-none hover:bg-hover hover:text-primary focus:outline-accent md:border-unchecked md:text-base",
                    currentSymbol.extra && "border-checked/80 md:border-checked",
                    typeof currentSymbol.extra === "undefined" && "hidden"
                  )}
                  onClick={() => {
                    track("quest_toggle", {
                      quest: "extra",
                      state: currentSymbol.extra ? "off" : "on",
                    });
                    setSymbols(updateSymbol(symbols, selectedId, { extra: !currentSymbol.extra }));
                  }}
                >
                  {m.extra}
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <Message text={m.extraTooltip} values={{ quest: currentSymbol.extraName ?? "" }} />
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
            <p>
              <Message text={m.symbolsPerDay} values={{ count: dailySymbols }} />
            </p>
            {currentSymbol.type === "arcane" && (
              <p>
                <Message
                  text={m.symbolsPerWeek}
                  values={{ count: currentSymbol.weekly ? WEEKLY_SYMBOLS : 0 }}
                />
              </p>
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
            isMaxLevel(currentSymbol.level, currentSymbol.type) && "justify-center",
            currentSymbol.symbolsRequired.length <= 10 && "hidden"
          )}
        >
          {/* BEFORE > AFTER LEVEL */}
          {isValid(currentSymbol.level) &&
            !isMaxLevel(currentSymbol.level, currentSymbol.type) &&
            currentSymbol.symbolsRequired.length === maxLevelFor(currentSymbol.type) && (
              <div className="flex items-center gap-3 pt-0.5">
                <h1 className="text-base font-semibold tracking-wider text-primary md:text-xl">
                  <Message text={m.level} values={{ level: currentSymbol.level }} />
                </h1>
                <FaArrowRight size={!isMobile ? 20 : 15} />
                <h1 className="text-base font-semibold tracking-wider text-primary md:text-xl">
                  <Message text={m.level} values={{ level: currentSymbol.level + 1 }} />
                </h1>
              </div>
            )}

          {/* NEXT LEVEL STATS */}
          {isValid(currentSymbol.level) &&
            !isMaxLevel(currentSymbol.level, currentSymbol.type) &&
            currentSymbol.symbolsRequired.length === maxLevelFor(currentSymbol.type) && (
              <div className="flex h-full flex-col justify-between gap-2 pt-5 **:text-sm md:gap-0 md:pt-10 md:**:text-base">
                {!readyForUpgrade &&
                  (currentSymbol.daily || currentSymbol.weekly) &&
                  isValid(currentSymbol.experience) && (
                    <div className="flex justify-center gap-1.5">
                      <p>
                        <Message text={m.daysToGo} count={daysToNextLevel} />
                      </p>
                      <Tooltip placement={"top"}>
                        <TooltipTrigger>
                          <MdOutlineInfo
                            size={20}
                            className="cursor-default fill-accent transition-colors hover:fill-white md:mt-0.5"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="tooltip">
                          <Message text={m.completionAssumption} />
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                {readyForUpgrade && (
                  <p>
                    <Message text={m.readyForUpgrade} />
                  </p>
                )}

                {!isValid(currentSymbol.experience) ? (
                  <p>
                    <Message text={m.experienceNotSet} />
                  </p>
                ) : (
                  !currentSymbol.daily &&
                  !currentSymbol.weekly &&
                  !readyForUpgrade && (
                    <p>
                      <Message text={m.questsNotSet} />
                    </p>
                  )
                )}

                {readyForUpgrade ? (
                  <p>
                    <Message text={m.sufficientSymbols} />
                  </p>
                ) : isValid(currentSymbol.experience) ? (
                  <p>
                    <Message
                      text={m.symbolsRemaining}
                      count={nextExperience - currentSymbol.experience}
                    />
                  </p>
                ) : (
                  <p>
                    <Message text={m.unknownRemaining} />
                  </p>
                )}

                <p className="pt-2.5 md:pt-8">
                  <Message
                    text={m.mesosRequired}
                    values={{
                      mesos: formatNumber(currentSymbol.mesosRequired[currentSymbol.level]),
                    }}
                  />
                </p>

                <div className="flex justify-center gap-1.5 pt-2.5 md:pt-8">
                  <p>
                    <Message text={m.mainStat} values={{ stat: MAIN_STAT_PER_LEVEL[mode] }} />
                  </p>
                  <Tooltip placement={"right"}>
                    <TooltipTrigger>
                      <MdOutlineInfo
                        size={20}
                        className="cursor-default fill-accent transition-colors hover:fill-white md:mt-0.5"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="tooltip">
                      <div>
                        <Message text={m.demonAvengerHp} values={{ hp: DEMON_AVENGER_HP[mode] }} />
                      </div>
                      <div>
                        <Message text={m.xenonAllStat} values={{ stat: XENON_ALL_STAT[mode] }} />
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

          {/* MAX LEVEL / DISABLED LEVEL */}
          <div className="flex justify-center text-center">
            {isMaxLevel(currentSymbol.level, currentSymbol.type) && (
              <p className="text-lg font-semibold tracking-widest text-accent md:text-2xl">
                {m.maxLevel}
              </p>
            )}
            {!isValid(currentSymbol.level) && (
              <div className="space-y-1.5 md:space-y-3">
                <p className="text-lg font-semibold tracking-widest text-secondary md:text-2xl">
                  {m.disabled}
                </p>
                <p className="text-xs font-light tracking-widest text-secondary">
                  {m.disabledHint}
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
