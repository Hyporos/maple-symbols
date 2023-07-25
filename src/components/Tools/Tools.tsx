import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
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
      data: any[];
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

  const [selectorLevel, setSelectorLevel] = useState(currentSymbol.level);
  const [catalystLevel, setCatalystLevel] = useState(NaN);

  useMemo(() => {
    let accumulated = 0;
    symbols[selectedSymbol].data.forEach((symbol : any) => {
      try {
        if (symbol.level < currentSymbol.level) {
          accumulated =
            accumulated + currentSymbol.data[symbol.level].symbolsRequired;
        }
      } catch (e) {
        //console.log((e as Error).message);
      }
    });
    try {
      let tempCatalystExp =
        accumulated +
        (currentSymbol.experience -
          currentSymbol.experience * (!swapped ? 0.2 : 0.4)) -
        Math.ceil(accumulated - accumulated * (!swapped ? 0.8 : 0.6));
      setCatalystExperience(tempCatalystExp);

      symbols[selectedSymbol].data.forEach((symbol: any) => {
        if (
          tempCatalystExp > currentSymbol.data[symbol.level].symbolsRequired
        ) {
          tempCatalystExp =
            tempCatalystExp - currentSymbol.data[symbol.level].symbolsRequired;
          setCatalystLevel(currentSymbol.data[symbol.level].level);
          setCatalystExperience(tempCatalystExp);
        }
      });
    } catch (e) {
      //console.log((e as Error).message);
    }
  }, [currentSymbol.level, currentSymbol.experience, currentSymbol.data]);

  useMemo(() => {
    setSelectorLevel(currentSymbol.level);
    let count = 0;
    let accumulated = 0;
    symbols[selectedSymbol].data.forEach(((symbol : any) => {
      try {
        if (
          selectorCount >=
            currentSymbol.data[symbol.level - 1].symbolsRequired +
              accumulated -
              currentSymbol.experience &&
          symbol.level > currentSymbol.level
        ) {
          count++;
          accumulated =
            accumulated + currentSymbol.data[symbol.level - 1].symbolsRequired;
          setSelectorLevel(currentSymbol.level + count);
        }
        setSelectorExperience(
          selectorCount - accumulated + currentSymbol.experience
        );
      } catch (e) {
        //console.log((e as Error).message);
      }
    }));
  }, [currentSymbol.level, currentSymbol.experience, selectorCount]);

  useEffect(() => {
    setSelectorCount(NaN);
  }, [selectedSymbol]);

  return (
    <section className="tools">
      <div className="flex flex-col justify-between bg-gradient-to-t from-card to-card-tool rounded-b-lg pt-10 tablet:pt-0 tablet:h-[250px] w-[350px] tablet:w-[700px]">
        <hr className="horizontal-divider mb-9" />

        <div
          className={`flex justify-center tablet:justify-between tablet:mx-20 text-secondary space-x-4 mb-7 ${
            (isNaN(currentSymbol.level) || currentSymbol.level === null) &&
            "opacity-25 pointer-events-none"
          }`}
        >
          <button
            className={`tool-select ${
              selectedTool === 1
                ? "bg-secondary text-primary space-x-2"
                : isMobile ? `${(isNaN(currentSymbol.level) || currentSymbol.level === null) ? "" : "shadow-accent"} shadow-level w-[50px]` : "space-x-2"
            }`}
            onClick={() => setSelectedTool(1)}
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
                    ? `${(isNaN(currentSymbol.level) || currentSymbol.level === null) ? "" : "shadow-accent"} shadow-level w-[50px]`
                    : "space-x-2"
                }`}
                onClick={() => setSelectedTool(2)}
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
              <span className="text-red-500">{swapped && "[New Age - Nov 15 Update]"}</span>
            </TooltipContent>
          </Tooltip>
        </div>
        <div
          className={`flex justify-center items-center bg-dark flex-col tablet:flex-row rounded-3xl mx-10 py-8 tablet:py-3 mb-9 tablet:space-x-10 space-y-5 tablet:space-y-0 ${
            selectedTool === 1 ? "block" : "hidden"
          } ${
            (isNaN(currentSymbol.level) || currentSymbol.level === null) &&
            "opacity-25 pointer-events-none"
          }`}
        >
          <div className="flex items-center space-x-10 tablet:space-x-4 tablet:w-1/4">
            <img src={currentSymbol.img} width={33}></img>
            <input
              type="number"
              placeholder="Count"
              value={selectorCount}
              className="tool-input w-[100px]"
              onChange={(e) => {
                if (isNaN(currentSymbol.experience)) {
                  setSelectorCount(NaN);
                }
                if (
                  Number(e.target.value) <= currentSymbol.symbolsRemaining &&
                  currentSymbol.experience !== null
                ) {
                  setSelectorCount(parseInt(e.target.value));
                }
                if (Number(e.target.value) >= currentSymbol.symbolsRemaining) {
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
              <TooltipTrigger className="flex items-center space-x-4 cursor-default">
                <div>
                  <p className="text-secondary">
                    {isNaN(currentSymbol.level) || currentSymbol.level === null
                      ? "?"
                      : currentSymbol.level}{" "}
                    /{" "}
                    {isNaN(currentSymbol.experience) ||
                    currentSymbol.experience === null ||
                    isNaN(currentSymbol.level) ||
                    currentSymbol.level === null
                      ? "?"
                      : currentSymbol.experience}
                  </p>
                </div>
                <div>
                  <HiArrowSmRight size={25} className="fill-basic" />
                </div>
                <div>
                  <p className="text-secondary">
                    <span>
                      {isNaN(currentSymbol.level) ||
                      currentSymbol.level === null
                        ? "?"
                        : selectorLevel}{" "}
                      /{" "}
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
        <div
          className={`flex justify-center items-center bg-dark flex-col tablet:flex-row rounded-3xl mx-10 py-[31.5px] tablet:py-3 mb-9 tablet:space-x-8 space-y-6 tablet:space-y-0 ${
            selectedTool === 2 ? "block" : "hidden"
          } ${
            (isNaN(currentSymbol.level) || currentSymbol.level === null) &&
            "opacity-25"
          }`}
        >
          <div className="flex items-center space-x-4 tablet:w-[70px]">
            <img src={currentSymbol.img} width={33} className="tablet:p-0"></img>
            <p>{isMobile && currentSymbol.name}</p>
          </div>
          <div className="flex items-center justify-around tablet:w-1/3">
            <Tooltip>
              <TooltipTrigger className="flex items-center space-x-4 cursor-default">
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
                      : currentSymbol.experience}
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
      </div>
    </section>
  );
};

export default Tools;
