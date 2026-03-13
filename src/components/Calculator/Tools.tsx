import { useMemo, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { FaArrowRight } from "react-icons/fa6";
import { cn, isValid, updateSymbol } from "../../lib/utils";
import { useAppStore } from "../../state/store";
import { useBreakpoint } from "../../hooks/useBreakpoint";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Tools component is the section under the Calculator which contains the Selectors and Catalyst.
// * You can preview the functionality of both items by clicking their respective buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Tools = () => {
  const symbols = useAppStore((s) => s.symbols);
  const setSymbols = useAppStore((s) => s.setSymbols);
  const selectedSymbol = useAppStore((s) => s.selectedSymbol);
  const swapped = useAppStore((s) => s.swapped);

  const { isMobile } = useBreakpoint();
  const [selectedTool, setSelectedTool] = useState<"selector" | "catalyst">("selector");
  const [selectorCount, setSelectorCount] = useState(NaN);
  const currentSymbol = symbols[selectedSymbol];
  const nextExperience = currentSymbol?.symbolsRequired[currentSymbol.level];

  const disabled = isNaN(currentSymbol.level);

  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  // Derive the preview level/exp after applying Symbol Selectors
  const { selectorLevel, selectorExp } = useMemo(() => {
    let totalLevels = 0;
    let totalExp = 0;
    currentSymbol.symbolsRequired.forEach((_, indexLevel) => {
      if (
        indexLevel >= currentSymbol.level &&
        selectorCount >=
          currentSymbol.symbolsRequired[indexLevel] - currentSymbol.experience + totalExp
      ) {
        totalLevels++;
        totalExp += currentSymbol.symbolsRequired[indexLevel];
      }
    });
    return {
      selectorLevel: currentSymbol.level + totalLevels,
      selectorExp: selectorCount
        ? selectorCount - totalExp + currentSymbol.experience
        : currentSymbol.experience,
    };
  }, [currentSymbol.level, currentSymbol.experience, currentSymbol.symbolsRequired, selectorCount]);

  // Derive the preview level/exp after using a Catalyst
  const { catalystLevel, catalystExp } = useMemo(() => {
    let totalExp = 0;
    currentSymbol.symbolsRequired.forEach((_, indexLevel) => {
      if (indexLevel < currentSymbol.level) {
        totalExp = totalExp + currentSymbol.symbolsRequired[indexLevel];
      }
    });

    let tempCatalystExp =
      (totalExp +
        (currentSymbol.experience > nextExperience ? nextExperience : currentSymbol.experience)) *
      (!swapped ? 0.8 : 0.6);

    let tempLevel = NaN;
    currentSymbol.symbolsRequired.forEach((_, indexLevel) => {
      if (tempCatalystExp > currentSymbol.symbolsRequired[indexLevel - 1]) {
        tempCatalystExp = tempCatalystExp - currentSymbol.symbolsRequired[indexLevel - 1];
        tempLevel = indexLevel;
      }
    });
    return { catalystLevel: tempLevel, catalystExp: tempCatalystExp };
  }, [
    currentSymbol.level,
    currentSymbol.experience,
    currentSymbol.symbolsRequired,
    nextExperience,
    swapped,
  ]);
  const displayPreview = (levelType: number, expType: number) => {
    if (!isValid(levelType)) return "? / ?";
    if (levelType === currentSymbol.level && levelType <= 1 && selectedTool === "catalyst") {
      return "? / ?";
    }
    if (currentSymbol.experience > nextExperience && expType !== catalystExp) {
      return currentSymbol.level + " / " + nextExperience; // Prevent modification from unlocked exp field overflow on Symbol Selectors
    }
    if (levelType === (!swapped ? 20 : 11)) {
      return levelType + " / 0";
    }
    if (!isValid(currentSymbol.level)) {
      return "? / ?";
    }
    if (!isValid(currentSymbol.experience)) {
      return levelType + " / ?";
    }
    return levelType + " / " + Math.ceil(expType);
  };

  return (
    <section className="flex justify-center">
      <div
        className={`mx-4 flex w-[360px] flex-col rounded-b-lg bg-gradient-to-t from-card to-card-tool md:h-[225px] md:w-full md:max-w-[700px]  ${
          disabled && "select-none [&>*]:pointer-events-none [&>*]:opacity-25"
        }`}
      >
        <div className={cn("h-px w-full bg-white/10", disabled && "bg-white/40")} />

        <div className="my-8 flex h-full flex-col justify-between gap-6 md:my-10">
          <div className="mx-10 flex justify-between gap-4 text-secondary md:mx-20">
            <button
              className={`flex max-w-[200px] select-none items-center justify-center rounded-2xl bg-dark px-3 py-2 tracking-wide text-secondary hover:bg-secondary hover:text-primary focus:outline-accent md:w-full md:max-w-[215px] md:gap-4 md:rounded-3xl md:px-4 md:transition-colors ${
                selectedTool === "selector"
                  ? "gap-2 bg-secondary text-primary md:gap-4"
                  : isMobile
                    ? `${!isValid(currentSymbol.level) ? "" : "shadow-accent"} shadow-level`
                    : ""
              }`}
              onClick={() => setSelectedTool("selector")}
              tabIndex={disabled ? -1 : 0}
            >
              <img
                src={`${
                  !swapped ? "/symbols/arcane-selector.webp" : "/symbols/sacred-selector.webp"
                }`}
                width={!isMobile ? 33 : 30}
              />
              <p className="text-sm md:text-base">
                {(selectedTool === "selector" || !isMobile) && "Symbol Selector"}
              </p>
            </button>
            <Tooltip>
              <TooltipTrigger asChild={true}>
                <button
                  className={`flex max-w-[200px] select-none items-center justify-center rounded-2xl bg-dark px-3 py-2 tracking-wide text-secondary hover:bg-secondary hover:text-primary focus:outline-accent md:w-full md:max-w-[215px] md:gap-4 md:rounded-3xl md:px-4 md:transition-colors ${
                    selectedTool === "catalyst"
                      ? "gap-2 bg-secondary text-primary md:gap-4"
                      : isMobile
                        ? `${!isValid(currentSymbol.level) ? "" : "shadow-accent"} shadow-level `
                        : ""
                  }`}
                  onClick={() => setSelectedTool("catalyst")}
                  tabIndex={disabled ? -1 : 0}
                >
                  <img
                    src={`${
                      !swapped ? "/symbols/arcane-catalyst.webp" : "/symbols/sacred-catalyst.webp"
                    }`}
                    width={!isMobile ? 33 : 30}
                  />
                  <p className="text-sm md:text-base">
                    {(selectedTool === "catalyst" || !isMobile) &&
                      (!swapped ? "Arcane Catalyst" : "Sacred Catalyst")}
                  </p>
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <span>[Regular Server Only]</span> <br></br> Transfer{" "}
                {!swapped ? "an Arcane Symbol" : "a Sacred Symbol"} once <br></br> within the same
                world
              </TooltipContent>
            </Tooltip>
          </div>
          <Tooltip placement={isMobile ? "bottom" : "top"}>
            <TooltipTrigger
              asChild={true}
              className={`cursor-default ${selectedTool === "catalyst" && "hidden"}`}
              tabIndex={
                disabled ||
                (currentSymbol.level < (!swapped ? 20 : 11) &&
                  currentSymbol.experience < nextExperience) ||
                currentSymbol.level === 20
                  ? -1
                  : 0
              }
            >
              <div
                className={`focus mx-10 flex flex-col items-center justify-center space-y-5 rounded-3xl bg-dark py-6 md:flex-row md:space-x-10 md:space-y-0 md:py-3 ${
                  selectedTool === "selector" ? "block" : "hidden"
                } ${
                  currentSymbol.level < (!swapped ? 20 : 11) &&
                  currentSymbol.experience > nextExperience &&
                  "opacity-50 [&>*]:pointer-events-none [&>*]:select-none"
                }`}
              >
                <div className="flex items-center space-x-10 md:w-1/4 md:space-x-4">
                  <img src={currentSymbol.img} width={!isMobile ? 33 : 30}></img>
                  <input
                    type="number"
                    placeholder="Count"
                    value={isNaN(selectorCount) ? "" : selectorCount}
                    className="w-1/2 w-[80px] bg-secondary py-1 text-center text-sm tracking-wider text-secondary outline-none transition-colors hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary focus:outline-none md:w-[100px] md:p-2.5"
                    tabIndex={
                      disabled ||
                      (currentSymbol.level < (!swapped ? 20 : 11) &&
                        currentSymbol.experience > nextExperience)
                        ? -1
                        : 0
                    }
                    onChange={(e) => {
                      if (isNaN(currentSymbol.experience)) {
                        setSelectorCount(NaN);
                      } else if (Number(e.target.value) < 0) {
                        setSelectorCount(NaN);
                      } else if (e.target.value === "0") {
                        setSelectorCount(1);
                      } else if (Number(e.target.value) >= currentSymbol.symbolsRemaining) {
                        setSelectorCount(currentSymbol.symbolsRemaining);
                      } else {
                        setSelectorCount(parseInt(e.target.value));
                      }
                    }}
                  ></input>
                </div>
                <div className="flex items-center justify-around md:w-1/3">
                  <Tooltip>
                    <TooltipTrigger
                      className="flex cursor-default items-center space-x-4 md:space-x-5"
                      tabIndex={
                        disabled ||
                        (currentSymbol.level < (!swapped ? 20 : 11) &&
                          currentSymbol.experience > nextExperience)
                          ? -1
                          : 0
                      }
                    >
                      <div>
                        <p className="text-sm text-secondary md:text-base">
                          {displayPreview(currentSymbol.level, currentSymbol.experience)}
                        </p>
                      </div>
                      <div>
                        <FaArrowRight size={!isMobile ? 16 : 14} />
                      </div>
                      <div>
                        <p className="text-sm text-secondary md:text-base">
                          <span>
                            {isNaN(selectorCount)
                              ? "? / ?"
                              : displayPreview(selectorLevel, selectorExp)}
                          </span>
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="tooltip">
                      <div className="flex items-center justify-center space-x-2 text-accent">
                        <p className="text-sm">[Before</p>{" "}
                        <FaArrowRight size={13} className="fill-accent" />{" "}
                        <p className="text-sm">After]</p>
                      </div>{" "}
                      Level / Experience
                    </TooltipContent>
                  </Tooltip>
                </div>
                <button
                  tabIndex={
                    disabled ||
                    isNaN(selectorExp) ||
                    !isValid(selectorCount) ||
                    currentSymbol.level === (!swapped ? 20 : 11) ||
                    (currentSymbol.level < (!swapped ? 20 : 11) &&
                      currentSymbol.experience > nextExperience)
                      ? -1
                      : 0
                  }
                  className={`flex w-[175px] select-none items-center justify-center rounded-2xl bg-secondary px-2 py-1.5 tracking-wide text-secondary hover:bg-hover hover:text-primary focus:outline-accent md:w-[100px] md:rounded-3xl md:px-4 md:py-2 md:transition-colors ${
                    (!isValid(selectorCount) || currentSymbol.level === (!swapped ? 20 : 11)) &&
                    "pointer-events-none opacity-25"
                  }`}
                  onClick={() => {
                    setSymbols(
                      updateSymbol(symbols, selectedSymbol, {
                        level: selectorLevel,
                        experience:
                          selectorCount < currentSymbol.symbolsRemaining ? selectorExp : 0,
                      })
                    );
                    setSelectorCount(NaN);
                  }}
                >
                  <p className="text-sm md:text-base">Apply</p>
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent
              className={`tooltip ${
                currentSymbol.level < (!swapped ? 20 : 11) &&
                currentSymbol.experience > nextExperience
                  ? "block"
                  : "hidden"
              }`}
            >
              This feature is <span>disabled</span> while <br></br> experience is unlocked
            </TooltipContent>
          </Tooltip>
          <div
            className={`focus mx-10 flex flex-col items-center justify-center space-y-5 rounded-3xl bg-dark py-6 md:flex-row md:space-x-8 md:space-y-0 md:py-3 ${
              selectedTool === "catalyst" ? "block" : "hidden"
            }`}
          >
            <div className="flex items-center space-x-4 md:w-[70px]">
              <img src={currentSymbol.img} width={!isMobile ? 33 : 30} className="md:p-0"></img>
              <p className="text-sm md:text-base">{isMobile && currentSymbol.name}</p>
            </div>
            <div className="flex items-center justify-around md:w-1/3">
              <Tooltip>
                <TooltipTrigger
                  className="flex cursor-default items-center space-x-4 md:space-x-5"
                  tabIndex={
                    disabled ||
                    (currentSymbol.level < (!swapped ? 20 : 11) &&
                      currentSymbol.experience > nextExperience)
                      ? -1
                      : 0
                  }
                >
                  <div>
                    <p className="text-sm text-secondary md:text-base">
                      {displayPreview(currentSymbol.level, currentSymbol.experience)}
                    </p>
                  </div>
                  <div>
                    <FaArrowRight size={!isMobile ? 16 : 14} />
                  </div>
                  <div>
                    <p className="text-sm text-accent md:text-base">
                      {displayPreview(catalystLevel, catalystExp)}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="tooltip">
                  <div className="flex items-center justify-center space-x-2 text-accent">
                    <p className="text-sm">[Before</p>{" "}
                    <FaArrowRight size={13} className="fill-accent" />{" "}
                    <p className="text-sm">After]</p>
                  </div>{" "}
                  Symbol Level / Exp
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="w-[200px] py-[6px] text-center text-sm text-tertiary md:py-[8px] md:text-right md:text-base">
              {currentSymbol.level === 1 || isNaN(currentSymbol.level)
                ? "Must be level 2 or higher"
                : !swapped
                  ? "-20% EXP upon use"
                  : "-40% EXP upon use"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tools;
