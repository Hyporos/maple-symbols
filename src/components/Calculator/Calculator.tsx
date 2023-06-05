import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { HiArrowSmRight } from "react-icons/hi";
import { TbSlash } from "react-icons/tb";
import "./Calculator.css";

interface Props {
  symbols: [
    {
      id: number;
      name: string;
      alt: string;
      img: string;
      level: number;
      experience: number;
      daily: boolean;
      weekly: boolean;
      extra: boolean;
      dailySymbols: number;
      daysRemaining: number;
      symbolsRemaining: number;
      data: [
        {
          level: number;
          symbolsRequired: number;
          mesosRequired: number;
        }
      ];
    }
  ];
  setSymbols: Dispatch<SetStateAction<object>>;
  selectedSymbol: number;
  classData: [
    {
      name: string;
      statForm: string;
      statGain: number;
    }
  ];
  selectedClass: number;
}

const Calculator = ({
  symbols,
  setSymbols,
  selectedSymbol,
  classData,
  selectedClass,
}: Props) => {

  const currentSymbol = symbols[selectedSymbol];
  const nextLevel = symbols[selectedSymbol].data[currentSymbol.level];

  const symbolCount =
    (currentSymbol.extra && currentSymbol.daily
      ? currentSymbol.dailySymbols * 2
      : currentSymbol.daily
      ? currentSymbol.dailySymbols
      : 0) + (currentSymbol.weekly ? 45 / 7 : 0);

  useEffect(() => {
    const splicedSymbols = currentSymbol.data.slice(currentSymbol.level, 20);

    const remaining =
      splicedSymbols.reduce(
        (total, currentSymbol) => total + currentSymbol.symbolsRequired,
        0
      ) - currentSymbol.experience;

    setSymbols(
      symbols.map((symbol) =>
        symbol.id === selectedSymbol + 1
          ? { ...symbol, symbolsRemaining: remaining }
          : symbol
      )
    );
  }, [currentSymbol.level, currentSymbol.experience]);

  useEffect(() => {
    const remaining = Math.ceil(currentSymbol.symbolsRemaining / symbolCount);

    setSymbols(
      symbols.map((symbol) =>
        symbol.id === selectedSymbol + 1
          ? { ...symbol, daysRemaining: remaining }
          : symbol
      )
    );

    const date = new Date();
    date.setDate(
      date.getDate() +
        Math.ceil(currentSymbol.symbolsRemaining / symbolCount)
    );
    const currentDay = String(date.getDate()).padStart(2, "0");
    const currentMonth = String(date.getMonth() + 1).padStart(2, "0");
    const currentYear = date.getFullYear();
    const currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
    setSymbols(
      symbols.map((symbol) =>
        symbol.id === selectedSymbol + 1
          ? { ...symbol, completion: currentDate }
          : symbol
      )
    );
  }, [
    currentSymbol.symbolsRemaining,
    currentSymbol.daily,
    currentSymbol.weekly,
    currentSymbol.extra,
  ]);

  useEffect(() => {

  }, [currentSymbol.daysRemaining]);

  return (
    <section>
      <div className="flex justify-center items-center">
        <div className="flex items-center bg-card rounded-t-lg h-[350px]">
          <div className="px-10 space-y-6 w-[350px]">
            <div className="flex justify-center items-center space-x-4 pb-6">
              <img src={currentSymbol.img} alt={currentSymbol.alt} />
              <p className="text-xl text-primary font-semibold tracking-wider uppercase">
                {currentSymbol.name} <br></br>
              </p>
            </div>

            <div className="flex justify-center items-center space-x-2">
              <input
                type="number"
                placeholder="Level"
                value={currentSymbol.level}
                className="symbol-input"
                onChange={(e) => {
                  if (Number(e.target.value) <= 20) {
                    setSymbols(
                      symbols.map((symbol) =>
                        symbol.id === selectedSymbol + 1
                          ? { ...symbol, level: parseInt(e.target.value) }
                          : symbol
                      )
                    );
                  }
                  if (Number(e.target.value) >= 21) {
                    setSymbols(
                      symbols.map((symbol) =>
                        symbol.id === selectedSymbol + 1
                          ? { ...symbol, level: 20 }
                          : symbol
                      )
                    );
                  }
                  if (e.target.value === "0") {
                    setSymbols(
                      symbols.map((symbol) =>
                        symbol.id === selectedSymbol + 1
                          ? { ...symbol, level: 1 }
                          : symbol
                      )
                    );
                  }
                }}
              ></input>
              <TbSlash size={30} color="#B2B2B2" />
              <input
                type="number"
                placeholder="Experience"
                value={currentSymbol.experience}
                className="symbol-input"
                onChange={(e) => {
                  if (Number(e.target.value) <= 2679) {
                    setSymbols(
                      symbols.map((symbol) =>
                        symbol.id === selectedSymbol + 1
                          ? { ...symbol, experience: parseInt(e.target.value) }
                          : symbol
                      )
                    );
                  }
                  if (Number(e.target.value) >= 2680) {
                    setSymbols(
                      symbols.map((symbol) =>
                        symbol.id === selectedSymbol + 1
                          ? { ...symbol, experience: 2679 }
                          : symbol
                      )
                    );
                  }
                  if (e.target.value === "0" && currentSymbol.level === 1) {
                    setSymbols(
                      symbols.map((symbol) =>
                        symbol.id === selectedSymbol + 1
                          ? { ...symbol, experience: 1 }
                          : symbol
                      )
                    );
                  }
                  if (e.target.value === "00" || e.target.value === "000") {
                    currentSymbol.level === 1
                      ? setSymbols(
                          symbols.map((symbol) =>
                            symbol.id === selectedSymbol + 1
                              ? { ...symbol, experience: 1 }
                              : symbol
                          )
                        )
                      : (e.target.value = "0");
                  }
                  if (e.target.value.startsWith("0")) {
                    e.target.value = e.target.value.substring(1);
                  }
                }}
              ></input>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                className={`daily-box ${
                  currentSymbol.daily && "border-checked"
                }`}
                onClick={() =>
                  setSymbols(
                    symbols.map((symbol) =>
                      symbol.id === selectedSymbol + 1
                        ? {
                            ...symbol,
                            daily: !currentSymbol.daily,
                          }
                        : symbol
                    )
                  )
                }
              >
                Daily
              </button>

              <button
                className={`daily-box ${
                  currentSymbol.weekly && "border-checked"
                } `}
                onClick={() =>
                  setSymbols(
                    symbols.map((symbol) =>
                      symbol.id === selectedSymbol + 1
                        ? {
                            ...symbol,
                            weekly: !currentSymbol.weekly,
                          }
                        : symbol
                    )
                  )
                }
              >
                Weekly
              </button>
              <button
                className={`daily-box ${
                  currentSymbol.extra && "border-checked"
                } ${
                  typeof currentSymbol.extra !== "undefined"
                    ? "block"
                    : "hidden"
                }
                }`}
                onClick={() =>
                  setSymbols(
                    symbols.map((symbol) =>
                      symbol.id === selectedSymbol + 1
                        ? {
                            ...symbol,
                            extra: !currentSymbol.extra,
                          }
                        : symbol
                    )
                  )
                }
              >
                Extra
              </button>
            </div>

            <div className="flex justify-center items-center text-tertiary pt-6">
              <div className="flex flex-col text-center text-sm">
                <p>
                  {currentSymbol.daily && currentSymbol.extra
                    ? currentSymbol.dailySymbols * 2
                    : currentSymbol.daily
                    ? currentSymbol.dailySymbols
                    : 0}{" "}
                  symbols / day
                </p>
                <p>{currentSymbol.weekly ? 45 : 0} symbols / week</p>
              </div>
            </div>
          </div>

          <div className="vertical-divider"></div>

          <div className="w-[350px] space-y-9">
            <div className="symbol-stats">
              <div className="flex justify-center items-center text-primary text-xl font-semibold tracking-wider">
                <div
                  className={`flex space-x-2 items-center ${
                    currentSymbol.level === 20 || isNaN(currentSymbol.level)
                      ? "hidden"
                      : "block"
                  }`}
                >
                  <h1>
                    Level <span>{currentSymbol.level}</span>
                  </h1>
                  <HiArrowSmRight size={30} className="fill-basic" />
                  <h1>
                    Level <span>{currentSymbol.level + 1}</span>
                  </h1>
                </div>
                <div
                  className={`text-2xl tracking-widest uppercase ${
                    currentSymbol.level === 20 || isNaN(currentSymbol.level)
                      ? "block"
                      : "hidden"
                  }`}
                >
                  <h1>
                    {currentSymbol.level === 20 ? (
                      <span className="text-accent text-2xl font-bold">
                        Max Level
                      </span>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-secondary">Disabled</p>
                        <p className="text-secondary text-xs lowercase font-light tracking-widest">
                          Enter a level to enable this symbol
                        </p>
                      </div>
                    )}
                  </h1>
                </div>
              </div>
            </div>
            

            <div
              className={`symbol-stats ${
                isNaN(currentSymbol.level) || currentSymbol.level === 20
                  ? "hidden"
                  : "block"
              }`}
            >
              {(() => {
                try {
                  if (
                    currentSymbol.experience < nextLevel.symbolsRequired &&
                    (currentSymbol.daily || currentSymbol.weekly)
                  ) {
                    return (
                      <p>
                        <span>
                          {Math.ceil(
                            (nextLevel.symbolsRequired -
                              currentSymbol.experience) /
                              symbolCount
                          )}
                        </span>{" "}
                        {Math.ceil(
                          (nextLevel.symbolsRequired -
                            currentSymbol.experience) /
                            symbolCount
                        ) > 1
                          ? "days to go"
                          : "day to go"}
                      </p>
                    );
                  } else if (
                    nextLevel.symbolsRequired - currentSymbol.experience <=
                    0
                  ) {
                    return (
                      <p>
                        <span>Ready</span> for upgrade
                      </p>
                    );
                  } else if (isNaN(currentSymbol.experience)) {
                    return (
                      <p>
                        <span>Experience</span> is not set
                      </p>
                    );
                  } else {
                    return (
                      <p>
                        <span>Quests</span> are not set
                      </p>
                    );
                  }
                } catch (e) {
                  //console.log((e as Error).message);
                }
              })()}
              {(() => {
                try {
                  if (currentSymbol.experience < nextLevel.symbolsRequired) {
                    return (
                      <p>
                        <span>
                          {nextLevel.symbolsRequired - currentSymbol.experience}
                        </span>{" "}
                        {nextLevel.symbolsRequired - currentSymbol.experience >
                        1
                          ? "symbols remaining"
                          : "symbol remaining"}
                      </p>
                    );
                  } else if (
                    nextLevel.symbolsRequired - currentSymbol.experience <=
                    0
                  ) {
                    return (
                      <p>
                        <span>Sufficient</span> symbols reached
                      </p>
                    );
                  } else {
                    return (
                      <p>
                        <span>Unknown</span> symbols remaining
                      </p>
                    );
                  }
                } catch (e) {
                  //console.log((e as Error).message);
                }
              })()}
            </div>

            <div
              className={`symbol-stats ${
                isNaN(currentSymbol.level) || currentSymbol.level === 20
                  ? "hidden"
                  : "block"
              }`}
            >
              <p>
                <span>
                  {(currentSymbol.level <= 19 && currentSymbol.level > 0) &&
                    nextLevel.mesosRequired.toLocaleString()}
                </span>{" "}
                mesos required
              </p>
            </div>

            <div
              className={`symbol-stats ${
                isNaN(currentSymbol.level) || currentSymbol.level === 20
                  ? "hidden"
                  : "block"
              }`}
            >
              <p>
                <span>+10</span> arcane force
              </p>
              <p>
                <span>+{classData[selectedClass].statGain}</span>{" "}
                {classData[selectedClass].statForm}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
