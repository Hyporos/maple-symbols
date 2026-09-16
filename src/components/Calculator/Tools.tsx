import { useMemo, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { FaArrowRight } from "react-icons/fa6";
import { cn, isValid, updateSymbol } from "../../lib/utils";
import { catalystPreview, formatPreview, selectorPreview } from "../../lib/tools";
import { getRemainingToMax } from "../../lib/calculator";
import { clampNumberInput } from "../../lib/inputs";
import { CATALYST_RETENTION, maxLevelFor } from "../../lib/game";
import { useAppStore, useSelectedSymbol } from "../../state/store";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { track } from "../../lib/analytics";
import { useLocale, useMessages } from "../../i18n";
import { symbolNames } from "../../i18n/gameNames";
import Message from "../../i18n/Message";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Tools component is the section under the Calculator which contains the Selectors and Catalyst.
// * You can preview the functionality of both items by clicking their respective buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Tools = () => {
  const m = useMessages().tools;
  const locale = useLocale();

  const symbols = useAppStore((s) => s.symbols);
  const setSymbols = useAppStore((s) => s.setSymbols);
  const selectedId = useAppStore((s) => s.selectedId);
  const mode = useAppStore((s) => s.mode);

  const { isMobile } = useBreakpoint();
  const [selectedTool, setSelectedTool] = useState<"selector" | "catalyst">("selector");
  const openTool = (tool: "selector" | "catalyst") => {
    if (tool !== selectedTool) track("tool_used", { tool, action: "preview" });
    setSelectedTool(tool);
  };
  const [selectorCount, setSelectorCount] = useState(NaN);
  const currentSymbol = useSelectedSymbol();
  const nextExperience = currentSymbol?.symbolsRequired[currentSymbol.level];

  const disabled = isNaN(currentSymbol.level);
  // Symbols still needed to max: the selector count's ceiling (derived, never stored).
  const remainingToMax = getRemainingToMax(currentSymbol, maxLevelFor(currentSymbol.type));

  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  // Derive the preview level/exp after applying Symbol Selectors
  const { level: selectorLevel, experience: selectorExp } = useMemo(
    () => selectorPreview(currentSymbol, selectorCount),
    [currentSymbol, selectorCount]
  );

  // Derive the preview level/exp after using a Catalyst (retention keyed on the mode)
  const { level: catalystLevel, experience: catalystExp } = useMemo(
    () => catalystPreview(currentSymbol, CATALYST_RETENTION[mode]),
    [currentSymbol, mode]
  );

  const displayPreview = (levelType: number, expType: number) =>
    formatPreview(levelType, expType, {
      symbol: currentSymbol,
      maxLevel: maxLevelFor(currentSymbol.type),
      isCatalyst: selectedTool === "catalyst",
      catalystExperience: catalystExp,
    });

  return (
    <section className="flex justify-center">
      <div
        className={`mx-4 flex w-[360px] flex-col rounded-b-lg bg-linear-to-t from-card to-card-tool md:h-[225px] md:w-full md:max-w-[700px] ${
          disabled && "select-none *:pointer-events-none *:opacity-25"
        }`}
      >
        <div className={cn("h-px w-full bg-white/10", disabled && "bg-white/40")} />

        <div className="my-8 flex h-full flex-col justify-between gap-6 md:my-10">
          <div className="mx-10 flex justify-between gap-4 text-secondary md:mx-20">
            <button
              className={`flex max-w-[200px] items-center justify-center rounded-2xl bg-dark px-3 py-2 tracking-wide text-secondary select-none hover:bg-secondary hover:text-primary focus:outline-accent md:w-full md:max-w-[215px] md:gap-4 md:rounded-3xl md:px-4 md:transition-colors ${
                selectedTool === "selector"
                  ? "gap-2 bg-secondary text-primary md:gap-4"
                  : isMobile
                    ? `${!isValid(currentSymbol.level) ? "" : "shadow-accent"} shadow-level`
                    : ""
              }`}
              onClick={() => openTool("selector")}
              tabIndex={disabled ? -1 : 0}
            >
              <img
                src={`${
                  mode === "arcane"
                    ? "/symbols/arcane-selector.webp"
                    : "/symbols/sacred-selector.webp"
                }`}
                alt={mode === "arcane" ? m.arcaneSelectorAlt : m.sacredSelectorAlt}
                width={!isMobile ? 33 : 30}
              />
              <p className="text-sm md:text-base">
                {(selectedTool === "selector" || !isMobile) && m.symbolSelector}
              </p>
            </button>
            <Tooltip>
              <TooltipTrigger asChild={true}>
                <button
                  className={`flex max-w-[200px] items-center justify-center rounded-2xl bg-dark px-3 py-2 tracking-wide text-secondary select-none hover:bg-secondary hover:text-primary focus:outline-accent md:w-full md:max-w-[215px] md:gap-4 md:rounded-3xl md:px-4 md:transition-colors ${
                    selectedTool === "catalyst"
                      ? "gap-2 bg-secondary text-primary md:gap-4"
                      : isMobile
                        ? `${!isValid(currentSymbol.level) ? "" : "shadow-accent"} shadow-level`
                        : ""
                  }`}
                  onClick={() => openTool("catalyst")}
                  tabIndex={disabled ? -1 : 0}
                >
                  <img
                    src={`${
                      mode === "arcane"
                        ? "/symbols/arcane-catalyst.webp"
                        : "/symbols/sacred-catalyst.webp"
                    }`}
                    alt={mode === "arcane" ? m.arcaneCatalyst : m.sacredCatalyst}
                    width={!isMobile ? 33 : 30}
                  />
                  <p className="text-sm md:text-base">
                    {(selectedTool === "catalyst" || !isMobile) &&
                      (mode === "arcane" ? m.arcaneCatalyst : m.sacredCatalyst)}
                  </p>
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <Message
                  text={mode === "arcane" ? m.arcaneCatalystTooltip : m.sacredCatalystTooltip}
                />
              </TooltipContent>
            </Tooltip>
          </div>
          <Tooltip placement={isMobile ? "bottom" : "top"}>
            <TooltipTrigger
              asChild={true}
              className={`cursor-default ${selectedTool === "catalyst" && "hidden"}`}
              tabIndex={
                disabled ||
                (currentSymbol.level < maxLevelFor(currentSymbol.type) &&
                  currentSymbol.experience < nextExperience) ||
                currentSymbol.level === maxLevelFor(currentSymbol.type)
                  ? -1
                  : 0
              }
            >
              <div
                className={`focus mx-10 flex flex-col items-center justify-center space-y-5 rounded-3xl bg-dark py-6 md:flex-row md:space-y-0 md:space-x-10 md:py-3 ${
                  selectedTool === "selector" ? "block" : "hidden"
                } ${
                  currentSymbol.level < maxLevelFor(currentSymbol.type) &&
                  currentSymbol.experience > nextExperience &&
                  "opacity-50 *:pointer-events-none *:select-none"
                }`}
              >
                <div className="flex items-center space-x-10 md:w-1/4 md:space-x-4">
                  <img
                    src={currentSymbol.img}
                    alt={symbolNames(currentSymbol, locale).name}
                    width={!isMobile ? 33 : 30}
                  ></img>
                  <input
                    type="number"
                    placeholder={m.countPlaceholder}
                    value={isNaN(selectorCount) ? "" : selectorCount}
                    className="w-1/2 w-[80px] bg-secondary py-1 text-center text-sm tracking-wider text-secondary outline-hidden transition-colors hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary focus:outline-hidden md:w-[100px] md:p-2.5"
                    tabIndex={
                      disabled ||
                      (currentSymbol.level < maxLevelFor(currentSymbol.type) &&
                        currentSymbol.experience > nextExperience)
                        ? -1
                        : 0
                    }
                    onChange={(e) =>
                      setSelectorCount(
                        isNaN(currentSymbol.experience)
                          ? NaN
                          : clampNumberInput(e.target.value, remainingToMax)
                      )
                    }
                  ></input>
                </div>
                <div className="flex items-center justify-around md:w-1/3">
                  <Tooltip>
                    <TooltipTrigger
                      as="div"
                      className="flex cursor-default items-center space-x-4 md:space-x-5"
                      tabIndex={
                        disabled ||
                        (currentSymbol.level < maxLevelFor(currentSymbol.type) &&
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
                        <p className="text-sm">[{m.before}</p>{" "}
                        <FaArrowRight size={13} className="fill-accent" />{" "}
                        <p className="text-sm">{m.after}]</p>
                      </div>{" "}
                      {m.selectorPreviewTooltip}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <button
                  tabIndex={
                    disabled ||
                    isNaN(selectorExp) ||
                    !isValid(selectorCount) ||
                    currentSymbol.level === maxLevelFor(currentSymbol.type) ||
                    (currentSymbol.level < maxLevelFor(currentSymbol.type) &&
                      currentSymbol.experience > nextExperience)
                      ? -1
                      : 0
                  }
                  className={`flex w-[175px] items-center justify-center rounded-2xl bg-secondary px-2 py-1.5 tracking-wide text-secondary select-none hover:bg-hover hover:text-primary focus:outline-accent md:w-[100px] md:rounded-3xl md:px-4 md:py-2 md:transition-colors ${
                    (!isValid(selectorCount) ||
                      currentSymbol.level === maxLevelFor(currentSymbol.type)) &&
                    "pointer-events-none opacity-25"
                  }`}
                  onClick={() => {
                    track("tool_used", { tool: "selector", action: "apply" });
                    setSymbols(
                      updateSymbol(symbols, selectedId, {
                        level: selectorLevel,
                        experience: selectorCount < remainingToMax ? selectorExp : 0,
                      })
                    );
                    setSelectorCount(NaN);
                  }}
                >
                  <p className="text-sm md:text-base">{m.apply}</p>
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent
              className={`tooltip ${
                currentSymbol.level < maxLevelFor(currentSymbol.type) &&
                currentSymbol.experience > nextExperience
                  ? "block"
                  : "hidden"
              }`}
            >
              <Message text={m.disabledWhileUnlocked} />
            </TooltipContent>
          </Tooltip>
          <div
            className={`focus mx-10 flex flex-col items-center justify-center space-y-5 rounded-3xl bg-dark py-6 md:flex-row md:space-y-0 md:space-x-8 md:py-3 ${
              selectedTool === "catalyst" ? "block" : "hidden"
            }`}
          >
            <div className="flex items-center space-x-4 md:w-[70px]">
              <img
                src={currentSymbol.img}
                alt={symbolNames(currentSymbol, locale).name}
                width={!isMobile ? 33 : 30}
                className="md:p-0"
              ></img>
              <p className="text-sm md:text-base">
                {isMobile && symbolNames(currentSymbol, locale).name}
              </p>
            </div>
            <div className="flex items-center justify-around md:w-1/3">
              <Tooltip>
                <TooltipTrigger
                  as="div"
                  className="flex cursor-default items-center space-x-4 md:space-x-5"
                  tabIndex={
                    disabled ||
                    (currentSymbol.level < maxLevelFor(currentSymbol.type) &&
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
                    <p className="text-sm">[{m.before}</p>{" "}
                    <FaArrowRight size={13} className="fill-accent" />{" "}
                    <p className="text-sm">{m.after}]</p>
                  </div>{" "}
                  {m.catalystPreviewTooltip}
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="w-[200px] py-[6px] text-center text-sm text-tertiary md:py-[8px] md:text-right md:text-base">
              {currentSymbol.level === 1 || isNaN(currentSymbol.level)
                ? m.catalystLevelTooLow
                : mode === "arcane"
                  ? m.arcaneExpLoss
                  : m.sacredExpLoss}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tools;
