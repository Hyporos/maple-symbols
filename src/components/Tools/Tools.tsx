import {
  Dispatch,
  SetStateAction,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip/Tooltip";
import { HiArrowSmRight } from "react-icons/hi";
import { useMediaQuery } from "react-responsive";
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

const Tools = ({ symbols, setSymbols, selectedSymbol, swapped }: Props) => {
  const isMobile = useMediaQuery({ query: `(max-width: 799px)` });
  const [selectedTool, setSelectedTool] = useState(1);
  const [selectorCount, setSelectorCount] = useState(NaN);
  const [selectorExperience, setSelectorExperience] = useState(NaN);
  const [catalystExperience, setCatalystExperience] = useState(NaN);

  const currentSymbol = symbols[selectedSymbol];

  const nextExperience = currentSymbol.symbolsRequired[currentSymbol.level];

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
    setSelectorLevel(currentSymbol.level); // If the amount of Symbol Selectors is not enough to level up, default to the current level
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
      setSelectorExperience(
        selectorCount - totalExp + currentSymbol.experience
      );
    });
  }, [currentSymbol.level, currentSymbol.experience, selectorCount]);

  // Preview the updated symbol level / experience when using a Catalyst
  useMemo(() => {
    let accumulated = 0;
    currentSymbol.symbolsRequired.forEach((symbol, index) => {
      if (index < currentSymbol.level) {
        accumulated = accumulated + currentSymbol.symbolsRequired[index];
      }
    });
    let tempCatalystExp =
      accumulated +
      ((currentSymbol.experience < nextExperience
        ? currentSymbol.experience
        : nextExperience) -
        (currentSymbol.experience < nextExperience
          ? currentSymbol.experience
          : nextExperience) *
          (!swapped ? 0.2 : 0.4)) -
      Math.ceil(accumulated - accumulated * (!swapped ? 0.8 : 0.6));
    setCatalystExperience(tempCatalystExp);

    currentSymbol.symbolsRequired.forEach((symbol, index) => {
      if (tempCatalystExp > currentSymbol.symbolsRequired[index]) {
        tempCatalystExp =
          tempCatalystExp - currentSymbol.symbolsRequired[index];
        setCatalystLevel(index + 1);
        setCatalystExperience(tempCatalystExp);
      }
    });
  }, [currentSymbol.level, currentSymbol.experience]);



  return (
    <section className="tools">
      <div
        className={`flex flex-col justify-between bg-gradient-to-t from-card to-card-tool rounded-b-lg pt-10 tablet:pt-0 tablet:h-[250px] w-[350px] tablet:w-[700px]  ${
          disabled && "[&>*]:opacity-25 [&>*]:pointer-events-none select-none"
        }`}
      >
        <hr className="horizontal-divider mb-9" />

        <div className="flex justify-center tablet:justify-between tablet:mx-20 text-secondary space-x-4 mb-7">
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
                  ? "/symbols/selector.webp"
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
              within the same world <br></br>{" "}
              <span className="text-red-500">
                {swapped && "[New Age - Nov 15 Update]"}
              </span>
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
              className={`flex justify-center items-center bg-dark flex-col focus tablet:flex-row rounded-3xl mx-10 py-8 tablet:py-3 mb-9 tablet:space-x-10 space-y-5 tablet:space-y-0 ${
                selectedTool === 1 ? "block" : "hidden"
              } ${
                currentSymbol.level < (!swapped ? 20 : 11) &&
                currentSymbol.experience > nextExperience &&
                "opacity-50 [&>*]:pointer-events-none [&>*]:select-none"
              }`}
            >
              <div className="flex items-center space-x-10 tablet:space-x-4 tablet:w-1/4">
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
              <div className="flex items-center justify-around tablet:w-1/3">
                <Tooltip>
                  <TooltipTrigger
                    className="flex items-center space-x-4 cursor-default"
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
                        {isNaN(currentSymbol.level) ||
                        currentSymbol.level === null
                          ? "?"
                          : currentSymbol.level}{" "}
                        /{" "}
                        {isNaN(currentSymbol.experience) ||
                        currentSymbol.experience === null ||
                        isNaN(currentSymbol.level) ||
                        currentSymbol.level === null
                          ? "?"
                          : currentSymbol.level < (!swapped ? 20 : 11) &&
                            currentSymbol.experience < nextExperience
                          ? currentSymbol.experience
                          : currentSymbol.level < (!swapped ? 20 : 11)
                          ? nextExperience
                          : 0}
                      </p>
                    </div>
                    <div>
                      <HiArrowSmRight size={25} className="fill-basic" />
                    </div>
                    <div>
                      <p className="text-secondary">
                        <span>
                          {isValid(currentSymbol.level) ? selectorLevel : "?"} /{" "}
                          {(isNaN(selectorExperience) &&
                            (isNaN(currentSymbol.experience) ||
                              currentSymbol.experience === null)) ||
                          isNaN(currentSymbol.level) ||
                          currentSymbol.level === null
                            ? "?"
                            : selectorLevel === 20
                            ? "0"
                            : (isNaN(selectorExperience) &&
                                currentSymbol.experience > 0) ||
                              isNaN(selectorExperience)
                            ? currentSymbol.experience
                            : selectorExperience}
                        </span>
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="tooltip">
                    <div className="flex justify-center items-center text-accent space-x-1">
                      <p className="text-sm">[Before</p>{" "}
                      <HiArrowSmRight size={19} className="fill-accent" />{" "}
                      <p className="text-sm">After]</p>
                    </div>{" "}
                    Level / Experience
                  </TooltipContent>
                </Tooltip>
              </div>
              <button
                tabIndex={
                  disabled ||
                  isNaN(selectorExperience) ||
                  currentSymbol.level === (!swapped ? 20 : 11) ||
                  (currentSymbol.level < (!swapped ? 20 : 11) &&
                    currentSymbol.experience > nextExperience)
                    ? -1
                    : 0
                }
                className={`tool-select text-secondary hover:text-primary bg-secondary hover:bg-hover w-[175px] tablet:w-[100px] ${
                  (isNaN(selectorExperience) ||
                    currentSymbol.level === (!swapped ? 20 : 11)) &&
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
                                ? selectorExperience
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
        <Tooltip placement={isMobile ? "bottom" : "top"}>
          <TooltipTrigger
            asChild={true}
            className={`cursor-default ${selectedTool === 1 && "hidden"}`}
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
              className={`flex justify-center items-center focus bg-dark flex-col tablet:flex-row rounded-3xl mx-10 py-[31.5px] tablet:py-3 mb-9 tablet:space-x-8 space-y-6 tablet:space-y-0 ${
                selectedTool === 2 ? "block" : "hidden"
              } ${
                currentSymbol.level < (!swapped ? 20 : 11) &&
                currentSymbol.experience > nextExperience &&
                "opacity-50 [&>*]:pointer-events-none [&>*]:select-none"
              }`}
            >
              <div className="flex items-center space-x-4 tablet:w-[70px]">
                <img
                  src={currentSymbol.img}
                  width={33}
                  className="tablet:p-0"
                ></img>
                <p>{isMobile && currentSymbol.name}</p>
              </div>
              <div className="flex items-center justify-around tablet:w-1/3">
                <Tooltip>
                  <TooltipTrigger
                    className="flex items-center space-x-4 cursor-default"
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
                        {currentSymbol.level === 1 ||
                        isNaN(currentSymbol.level) ||
                        currentSymbol.level === null
                          ? "?"
                          : currentSymbol.level}{" "}
                        /{" "}
                        {currentSymbol.level === 1 ||
                        isNaN(currentSymbol.level) ||
                        currentSymbol.level === null ||
                        isNaN(currentSymbol.experience) ||
                        currentSymbol.experience === null
                          ? "?"
                          : currentSymbol.experience <
                            (currentSymbol.level < (!swapped ? 20 : 11) &&
                              nextExperience)
                          ? currentSymbol.experience
                          : currentSymbol.level < (!swapped ? 20 : 11)
                          ? nextExperience
                          : 0}
                      </p>
                    </div>
                    <div>
                      <HiArrowSmRight size={25} className="fill-basic" />
                    </div>
                    <div>
                      <p className="text-secondary">
                        <span>
                          {currentSymbol.level === 1 ||
                          isNaN(currentSymbol.level) ||
                          currentSymbol.level === null
                            ? "?"
                            : currentSymbol.level === 2 // Bugged. Bandaid fix
                            ? "1"
                            : catalystLevel}{" "}
                          /{" "}
                          {currentSymbol.level === 1 ||
                          isNaN(currentSymbol.level) ||
                          currentSymbol.level === null ||
                          isNaN(currentSymbol.experience) ||
                          currentSymbol.experience === null
                            ? "?"
                            : Math.ceil(catalystExperience)}
                        </span>
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="tooltip">
                    <div className="flex justify-center items-center text-accent space-x-1">
                      <p className="text-sm">[Before</p>{" "}
                      <HiArrowSmRight size={19} className="fill-accent" />{" "}
                      <p className="text-sm">After]</p>
                    </div>{" "}
                    Symbol Level / Exp
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="w-[200px] text-center tablet:text-right text-tertiary py-2">
                {currentSymbol.level === 1 ||
                isNaN(currentSymbol.level) ||
                currentSymbol.level === null
                  ? "Must be level 2 or higher"
                  : !swapped
                  ? "-20% EXP upon use"
                  : "-40% EXP upon use"}
              </p>
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
      </div>
    </section>
  );
};

export default Tools;
