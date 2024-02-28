import {
  Dispatch,
  SetStateAction,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useMediaQuery } from "react-responsive";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { FaArrowRight } from "react-icons/fa6";

import "./Tools.css";

interface Props {
  symbols: [
    {
      id: number;
      img: string;
      name: string;
      level: number;
      experience: number;
      symbolsRemaining: number;
      symbolsRequired: Array<number>;
    }
  ];
  setSymbols: Dispatch<SetStateAction<object>>;
  selectedSymbol: number;
  swapped: boolean;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Tools component is the section under the Calculator which contains the Selectors and Catalyst.
// * You can preview the functionality of both items by clicking their respective buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Tools = ({ symbols, setSymbols, selectedSymbol, swapped }: Props) => {
  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });
  const [selectedTool, setSelectedTool] = useState(1);
  const [selectorCount, setSelectorCount] = useState(NaN);
  const [selectorExp, setSelectorExp] = useState(NaN);
  const [catalystExp, setcatalystExp] = useState(NaN);

  const currentSymbol = symbols[selectedSymbol];
  const nextExperience = currentSymbol?.symbolsRequired[currentSymbol.level];

  const [selectorLevel, setSelectorLevel] = useState(currentSymbol.level);
  const [catalystLevel, setCatalystLevel] = useState(NaN);

  const disabled = isNaN(currentSymbol.level) || currentSymbol.level === null;

  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  // Check if the specified value is valid (not empty)
  const isValid = (value: number) => {
    return !isNaN(value) && value !== null;
  };

  // Preview the updated symbol level / experience when applying Symbol Selectors
  useLayoutEffect(() => {
    setSelectorLevel(currentSymbol.level); // If the selector count is not enough to level up, default to the current level
    let totalLevels = 0;
    let totalExp = 0;
    currentSymbol.symbolsRequired.forEach((symbol, indexLevel) => {
      if (
        indexLevel >= currentSymbol.level &&
        selectorCount >=
          currentSymbol.symbolsRequired[indexLevel] -
            currentSymbol.experience +
            totalExp
      ) {
        totalLevels++;
        totalExp += currentSymbol.symbolsRequired[indexLevel];
        setSelectorLevel(currentSymbol.level + totalLevels);
      }
      setSelectorExp(
        selectorCount
          ? selectorCount - totalExp + currentSymbol.experience
          : currentSymbol.experience
      );
    });
  }, [currentSymbol.level, currentSymbol.experience, selectorCount]);

  // Preview the updated symbol level / experience when using a Catalyst
  useMemo(() => {
    let totalExp = 0;
    currentSymbol.symbolsRequired.forEach((symbol, indexLevel) => {
      if (indexLevel < currentSymbol.level) {
        totalExp = totalExp + currentSymbol.symbolsRequired[indexLevel];
      }
    });

    let tempCatalystExp =
      (totalExp +
        (currentSymbol.experience > nextExperience
          ? nextExperience
          : currentSymbol.experience)) *
      (!swapped ? 0.8 : 0.6);
    setcatalystExp(tempCatalystExp); // ? Maybe this can be removed?

    currentSymbol.symbolsRequired.forEach((symbol, indexLevel) => {
      if (tempCatalystExp > currentSymbol.symbolsRequired[indexLevel - 1]) {
        tempCatalystExp =
          tempCatalystExp - currentSymbol.symbolsRequired[indexLevel - 1];
        setCatalystLevel(indexLevel);
        setcatalystExp(tempCatalystExp);
      }
    });
  }, [currentSymbol.level, currentSymbol.experience]);

  // Display the current or resulted selector and catalyst level / experience
  const displayPreview = (levelType: number, expType: number) => {
    if (
      levelType === currentSymbol.level &&
      levelType <= 1 &&
      selectedTool === 2
    ) {
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
    if (isValid(currentSymbol.level) && isValid(currentSymbol.experience)) {
      return levelType + " / " + Math.ceil(expType);
    }
  };

  return (
    <section className="tools">
      <div
        className={`flex flex-col justify-between bg-gradient-to-t from-card to-card-tool rounded-b-lg pt-10 md:pt-0 md:h-[250px] w-[360px] md:w-[700px]  ${
          disabled && "[&>*]:opacity-25 [&>*]:pointer-events-none select-none"
        }`}
      >
        <hr className="horizontal-divider mb-9" />

        <div className="flex justify-center md:justify-between md:mx-20 text-secondary space-x-4 mb-7">
          <button
            className={`tool-select ${
              selectedTool === 1
                ? "bg-secondary text-primary space-x-2"
                : isMobile
                ? `${
                    isNaN(currentSymbol.level) || currentSymbol.level === null
                      ? ""
                      : "shadow-accent"
                  } shadow-level w-[50px]`
                : "space-x-2"
            }`}
            onClick={() => setSelectedTool(1)}
            tabIndex={disabled ? -1 : 0}
          >
            <img
              src={`${
                !swapped
                  ? "/symbols/arcane-selector.webp"
                  : "/symbols/sacred-selector.webp"
              }`}
            ></img>
            <p>{(selectedTool === 1 || !isMobile) && "Symbol Selector"}</p>
          </button>
          <Tooltip>
            <TooltipTrigger asChild={true}>
              <button
                className={`tool-select ${
                  selectedTool === 2
                    ? "bg-secondary text-primary space-x-2"
                    : isMobile
                    ? `${
                        isNaN(currentSymbol.level) ||
                        currentSymbol.level === null
                          ? ""
                          : "shadow-accent"
                      } shadow-level w-[50px]`
                    : "space-x-2"
                }`}
                onClick={() => setSelectedTool(2)}
                tabIndex={disabled ? -1 : 0}
              >
                <img
                  src={`${
                    !swapped
                      ? "/symbols/arcane-catalyst.webp"
                      : "/symbols/sacred-catalyst.webp"
                  }`}
                ></img>
                <p>
                  {(selectedTool === 2 || !isMobile) &&
                    (!swapped ? "Arcane Catalyst" : "Sacred Catalyst")}
                </p>
              </button>
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              <span>[Regular Server Only]</span> <br></br> Transfer{" "}
              {!swapped ? "an Arcane Symbol" : "a Sacred Symbol"} once <br></br>{" "}
              within the same world
            </TooltipContent>
          </Tooltip>
        </div>
        <Tooltip placement={isMobile ? "bottom" : "top"}>
          <TooltipTrigger
            asChild={true}
            className={`cursor-default ${selectedTool === 2 && "hidden"}`}
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
              className={`flex justify-center items-center bg-dark flex-col focus md:flex-row rounded-3xl mx-10 py-8 md:py-3 mb-9 md:space-x-10 space-y-5 md:space-y-0 ${
                selectedTool === 1 ? "block" : "hidden"
              } ${
                currentSymbol.level < (!swapped ? 20 : 11) &&
                currentSymbol.experience > nextExperience &&
                "opacity-50 [&>*]:pointer-events-none [&>*]:select-none"
              }`}
            >
              <div className="flex items-center space-x-10 md:space-x-4 md:w-1/4">
                <img src={currentSymbol.img} width={33}></img>
                <input
                  type="number"
                  placeholder="Count"
                  value={selectorCount}
                  className="tool-input w-[100px]"
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
                    }
                    if (
                      Number(e.target.value) <=
                        currentSymbol.symbolsRemaining &&
                      currentSymbol.experience !== null
                    ) {
                      setSelectorCount(parseInt(e.target.value));
                    }
                    if (
                      Number(e.target.value) >= currentSymbol.symbolsRemaining
                    ) {
                      setSelectorCount(currentSymbol.symbolsRemaining);
                    }
                    if (Number(e.target.value) < 0) {
                      setSelectorCount(NaN);
                    }
                    if (e.target.value === "0") {
                      setSelectorCount(1);
                    }
                  }}
                ></input>
              </div>
              <div className="flex items-center justify-around md:w-1/3">
                <Tooltip>
                  <TooltipTrigger
                    className="flex items-center space-x-5 cursor-default"
                    tabIndex={
                      disabled ||
                      (currentSymbol.level < (!swapped ? 20 : 11) &&
                        currentSymbol.experience > nextExperience)
                        ? -1
                        : 0
                    }
                  >
                    <div>
                      <p className="text-secondary">
                        {displayPreview(
                          currentSymbol.level,
                          currentSymbol.experience
                        )}
                      </p>
                    </div>
                    <div>
                      <FaArrowRight size={16} className="fill-basic" />
                    </div>
                    <div>
                      <p className="text-secondary">
                        <span>
                          {displayPreview(selectorLevel, selectorExp)}
                        </span>
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="tooltip">
                    <div className="flex justify-center items-center text-accent space-x-2">
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
                  isNaN(selectorExp) || !isValid(selectorCount) ||
                  currentSymbol.level === (!swapped ? 20 : 11) ||
                  (currentSymbol.level < (!swapped ? 20 : 11) &&
                    currentSymbol.experience > nextExperience)
                    ? -1
                    : 0
                }
                className={`tool-select text-secondary hover:text-primary bg-secondary hover:bg-hover w-[175px] md:w-[100px] ${
                  (!isValid(selectorCount) ||
                    currentSymbol.level === (!swapped ? 20 : 11)) && // remove this. change logic in intpu
                  "pointer-events-none opacity-25"
                }`}
                onClick={() => {
                  setSymbols(
                    symbols.map((symbol) =>
                      symbol.id === selectedSymbol + 1
                        ? {
                            ...symbol,
                            level: selectorLevel,
                            experience:
                              selectorCount < currentSymbol.symbolsRemaining
                                ? selectorExp
                                : 0,
                          }
                        : symbol
                    )
                  );
                  setSelectorCount(NaN);
                }}
              >
                <p>Apply</p>
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
            This feature is <span>disabled</span> while <br></br> experience is
            unlocked
          </TooltipContent>
        </Tooltip>
        <div
          className={`flex justify-center items-center focus bg-dark flex-col md:flex-row rounded-3xl mx-10 py-[31.5px] md:py-3 mb-9 md:space-x-8 space-y-6 md:space-y-0 ${
            selectedTool === 2 ? "block" : "hidden"
          }`}
        >
          <div className="flex items-center space-x-4 md:w-[70px]">
            <img
              src={currentSymbol.img}
              width={33}
              className="md:p-0"
            ></img>
            <p>{isMobile && currentSymbol.name}</p>
          </div>
          <div className="flex items-center justify-around md:w-1/3">
            <Tooltip>
              <TooltipTrigger
                className="flex items-center space-x-5 cursor-default"
                tabIndex={
                  disabled ||
                  (currentSymbol.level < (!swapped ? 20 : 11) &&
                    currentSymbol.experience > nextExperience)
                    ? -1
                    : 0
                }
              >
                <div>
                  <p className="text-secondary">
                    {displayPreview(
                      currentSymbol.level,
                      currentSymbol.experience
                    )}
                  </p>
                </div>
                <div>
                  <FaArrowRight size={16} className="fill-basic" />
                </div>
                <div>
                  <p className="text-secondary">
                    <span>{displayPreview(catalystLevel, catalystExp)}</span>
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <div className="flex justify-center items-center text-accent space-x-2">
                  <p className="text-sm">[Before</p>{" "}
                  <FaArrowRight size={13} className="fill-accent" />{" "}
                  <p className="text-sm">After]</p>
                </div>{" "}
                Symbol Level / Exp
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="w-[200px] text-center md:text-right text-tertiary py-2">
            {currentSymbol.level === 1 ||
            isNaN(currentSymbol.level) ||
            currentSymbol.level === null
              ? "Must be level 2 or higher"
              : !swapped
              ? "-20% EXP upon use"
              : "-40% EXP upon use"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Tools;
