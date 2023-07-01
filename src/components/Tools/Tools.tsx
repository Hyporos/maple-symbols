import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { HiArrowSmRight } from "react-icons/hi";
import "./Tools.css";

interface Props {
  symbols: [
    {
      id: number;
      img: string;
      level: number;
      experience: number;
      symbolsRemaining: number;
      data: {
        symbolsRequired: number;
      };
    }
  ];
  setSymbols: Dispatch<SetStateAction<object>>;
  selectedSymbol: number;
  swapped: boolean;
}

const Tools = ({ symbols, setSymbols, selectedSymbol, swapped }: Props) => {
  const [selectedTool, setSelectedTool] = useState(1);
  const [selectorCount, setSelectorCount] = useState(NaN);
  const [selectorLevel, setSelectorLevel] = useState(NaN);
  const [selectorExperience, setSelectorExperience] = useState(NaN);

  const [catalystLevel, setCatalystLevel] = useState(NaN);
  const [catalystExperience, setCatalystExperience] = useState(NaN);

  const currentSymbol = symbols[selectedSymbol];

  useEffect(() => {
    setCatalystLevel(currentSymbol.level);
    let accumulated = 0;
    symbols[selectedSymbol].data.forEach((symbol) => {
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

      symbols[selectedSymbol].data.forEach((symbol) => {
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

  useEffect(() => {
    setSelectorLevel(currentSymbol.level);
    let count = 0;
    let accumulated = 0;
    symbols[selectedSymbol].data.forEach((symbol) => {
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
    });
  }, [currentSymbol.level, currentSymbol.experience, selectorCount]);

  useEffect(() => {
    setSelectorCount(NaN);
  }, [selectedSymbol]);

  return (
    <section className="tools">
      <div className="flex flex-col justify-between bg-card rounded-b-lg h-[250px] w-[700px]">
        <hr className="horizontal-divider" />
        <div
          className={`flex justify-between mx-20 text-secondary space-x-4 mb-7 ${
            isNaN(currentSymbol.level) && "opacity-25 pointer-events-none"
          }`}
        >
          <button
            className={`tool-select ${
              selectedTool === 1 && "bg-secondary text-primary"
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
            <p>Symbol Selector</p>
          </button>
          <button
            className={`tool-select ${
              selectedTool === 2 && "bg-secondary text-primary"
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
            <p>{!swapped ? "Arcane Catalyst" : "Sacred Catalyst"}</p>
          </button>
        </div>
        <div
          className={`flex justify-center items-center bg-dark rounded-3xl mx-10 py-3 mb-9 space-x-10 ${
            selectedTool === 1 ? "block" : "hidden"
          } ${isNaN(currentSymbol.level) && "opacity-25 pointer-events-none"}`}
        >
          <div className="flex items-center space-x-4 w-1/4">
            <img src={currentSymbol.img}></img>
            <input
              type="number"
              placeholder="Count"
              value={selectorCount}
              className="tool-input w-[100px]"
              onChange={(e) => {
                if (Number(e.target.value) <= currentSymbol.symbolsRemaining) {
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
          <div className="flex items-center  justify-around w-1/3">
            <div>
              <p className="text-secondary">
                {isNaN(currentSymbol.level) ? "?" : currentSymbol.level} /{" "}
                {isNaN(currentSymbol.experience) || isNaN(currentSymbol.level)
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
                  {isNaN(currentSymbol.level) ? "?" : selectorLevel} /{" "}
                  {(isNaN(selectorExperience) &&
                    isNaN(currentSymbol.experience)) ||
                  isNaN(currentSymbol.level)
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
          </div>
          <button
            className={`tool-select text-secondary hover:text-primary bg-secondary hover:bg-hover w-[100px] ${
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
          className={`flex justify-center items-center bg-dark rounded-3xl mx-10 py-3 mb-9 space-x-8 ${
            selectedTool === 2 ? "block" : "hidden"
          } ${isNaN(currentSymbol.level) && "opacity-25"}`}
        >
          <div className="flex items-center w-[70px]">
            <img src={currentSymbol.img}></img>
          </div>
          <div className="flex items-center justify-around w-1/3">
            <div>
              <p className="text-secondary">
                {currentSymbol.level === 1 || isNaN(currentSymbol.level)
                  ? "?"
                  : currentSymbol.level}{" "}
                /{" "}
                {currentSymbol.level === 1 ||
                isNaN(currentSymbol.level) ||
                isNaN(currentSymbol.experience)
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
                  {currentSymbol.level === 1 || isNaN(currentSymbol.level)
                    ? "?"
                    : currentSymbol.level === 2 // Bugged. Bandaid fix
                    ? "1"
                    : catalystLevel}{" "}
                  /{" "}
                  {currentSymbol.level === 1 ||
                  isNaN(currentSymbol.level) ||
                  isNaN(currentSymbol.experience)
                    ? "?"
                    : Math.ceil(catalystExperience)}
                </span>
              </p>
            </div>
          </div>
            <p className="w-[200px] text-right py-2">
              {currentSymbol.level === 1 || isNaN(currentSymbol.level)
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
