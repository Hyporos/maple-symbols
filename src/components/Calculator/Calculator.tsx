import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  useFloating,
  offset,
  useHover,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { HiArrowSmRight, HiChevronDoubleRight } from "react-icons/hi";
import { RiMoreFill } from "react-icons/ri";
import { TbSlash } from "react-icons/tb";
import "./Calculator.css";

interface Props {
  symbols: [
    {
      id: number;
      name: string;
      alt: string;
      img: string;
      type: string;
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
  arcanePower: [{ x: string; y: number }];
  setArcanePower: Dispatch<SetStateAction<object>>;
  swapped: boolean;
}

const Calculator = ({
  symbols,
  setSymbols,
  selectedSymbol,
  arcanePower,
  setArcanePower,
  swapped,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10)],
  });

  const hover = useHover(context, {
    delay: {
      open: 500,
      close: 250,
    },
  });

  const { isMounted, styles } = useTransitionStyles(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

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
  }, [
    currentSymbol.symbolsRemaining,
    currentSymbol.daily,
    currentSymbol.weekly,
    currentSymbol.extra,
  ]);

  useEffect(() => {
    const date = new Date();
    date.setDate(
      date.getDate() + Math.ceil(currentSymbol.symbolsRemaining / symbolCount)
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
  }, [currentSymbol.daysRemaining]);

  const [arcaneForce, setArcaneForce] = useState(0);

  useEffect(() => {
    try {
      if (
        currentSymbol.experience < nextLevel.symbolsRequired &&
        (currentSymbol.daily || currentSymbol.weekly)
      ) {
        const remaining = [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
          { x: 0, y: 3 },
          { x: 0, y: 4 },
          { x: 0, y: 5 },
          { x: 0, y: 6 },
          { x: 0, y: 7 },
          { x: 0, y: 8 },
          { x: 0, y: 9 },
          { x: 0, y: 10 },
          { x: 0, y: 11 }, //God what is this spaghetti code please make my graph work
          { x: 0, y: 12 },
          { x: 0, y: 13 },
          { x: 0, y: 14 },
          { x: 0, y: 15 },
          { x: 0, y: 16 },
          { x: 0, y: 17 },
          { x: 0, y: 18 },
          { x: 0, y: 19 },
          { x: 0, y: 20 },
        ];
        let lastDays = 0;
        for (let i = 0; i < currentSymbol.data.length; i++) {
          const date = new Date();  
          date.setDate(
            date.getDate() +
            Math.ceil(
              ((symbols[selectedSymbol].data[currentSymbol.level + i]
                .symbolsRequired -
                currentSymbol.experience) /
                symbolCount) + lastDays
            )
          );
          const currentDay = String(date.getDate()).padStart(2, "0");
          const currentMonth = String(date.getMonth() + 1).padStart(2, "0");
          const currentYear = date.getFullYear();
          const currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
          lastDays = Math.ceil((symbols[selectedSymbol].data[currentSymbol.level + i]
            .symbolsRequired -
            currentSymbol.experience) /
            symbolCount) + lastDays;
          console.log(            Math.ceil(
            ((symbols[selectedSymbol].data[currentSymbol.level + i]
              .symbolsRequired -
              currentSymbol.experience) /
              symbolCount)
          ));
          remaining[i].x = currentDate;
          setArcanePower(remaining);
          setArcaneForce(arcaneForce + 10);
        }
      }
    } catch (e) {
      console.log("Error");
    }
  }, [currentSymbol.level, currentSymbol.experience]);

  return (
    <section className="calculator">
      <div className="flex py-16 bg-gradient-to-t from-card-tool to-card-grad rounded-t-lg h-[350px]">
        <div className="px-10 space-y-6 w-[350px]">
          <div className="flex justify-center items-center space-x-4 pb-6">
            <img src={currentSymbol.img} alt={currentSymbol.alt} />
            <p className="text-xl text-primary font-semibold tracking-wider uppercase">
              {currentSymbol.name}
            </p>
          </div>

          <div className="flex justify-center items-center space-x-2">
            <input
              type="number"
              placeholder="Level"
              value={currentSymbol.level}
              className="symbol-input"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => {
                if (Number(e.target.value) <= (!swapped ? 20 : 11)) {
                  setSymbols(
                    symbols.map((symbol) =>
                      symbol.id === selectedSymbol + 1
                        ? { ...symbol, level: parseInt(e.target.value) }
                        : symbol
                    )
                  );
                }
                if (Number(e.target.value) >= (!swapped ? 20 : 11)) {
                  setSymbols(
                    symbols.map((symbol) =>
                      symbol.id === selectedSymbol + 1
                        ? {
                            ...symbol,
                            level: !swapped ? 20 : 11,
                            experience: 0,
                          }
                        : symbol
                    )
                  );
                }
                if (Number(e.target.value) < 0) {
                  setSymbols(
                    symbols.map((symbol) =>
                      symbol.id === selectedSymbol + 1
                        ? { ...symbol, level: NaN }
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
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => {
                if (isNaN(currentSymbol.level)) {
                  setSymbols(
                    symbols.map((symbol) =>
                      symbol.id === selectedSymbol + 1
                        ? { ...symbol, experience: NaN }
                        : symbol
                    )
                  );
                }
                if (Number(e.target.value) <= nextLevel.symbolsRequired) {
                  setSymbols(
                    symbols.map((symbol) =>
                      symbol.id === selectedSymbol + 1
                        ? { ...symbol, experience: parseInt(e.target.value) }
                        : symbol
                    )
                  );
                }
                if (Number(e.target.value) >= nextLevel.symbolsRequired) {
                  setSymbols(
                    symbols.map((symbol) =>
                      symbol.id === selectedSymbol + 1
                        ? { ...symbol, experience: nextLevel.symbolsRequired }
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
                if (Number(e.target.value) < 0) {
                  setSymbols(
                    symbols.map((symbol) =>
                      symbol.id === selectedSymbol + 1
                        ? { ...symbol, experience: NaN }
                        : symbol
                    )
                  );
                }
                if (e.target.value.startsWith("0")) {
                  e.target.value = e.target.value.substring(1);
                }
              }}
            ></input>
          </div>

          <div className="flex space-x-2">
            <button
              ref={refs.setReference}
              {...getReferenceProps()}
              className={`daily-box ${currentSymbol.daily && "border-checked"}`}
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

            {isMounted && (
              <div
                className="floating"
                ref={refs.setFloating}
                style={{ ...floatingStyles, ...styles }}
                {...getFloatingProps()}
              >
                <span>[Daily Quest]</span> <br></br> Vanishing Journey Research
              </div>
            )}

            {isMounted && (
              <div
                className="floating"
                ref={refs.setFloating}
                style={{ ...floatingStyles, ...styles }}
                {...getFloatingProps()}
              >
                <span>[Daily Quest]</span> <br></br> Vanishing Journey Research
              </div>
            )}

            <button
              ref={refs.setReference}
              {...getReferenceProps()}
              className={`daily-box ${
                currentSymbol.weekly && "border-checked"
              } ${currentSymbol.type === "arcane" ? "block" : "hidden"}`}
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
                typeof currentSymbol.extra !== "undefined" ? "block" : "hidden"
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

          <div
            className={`flex flex-row text-center text-sm  pt-6 text-tertiary ${
              currentSymbol.type === "arcane"
                ? "justify-between"
                : "justify-center"
            }`}
          >
            <p>
              {currentSymbol.daily && currentSymbol.extra
                ? currentSymbol.name != "Cernium"
                  ? currentSymbol.dailySymbols * 2
                  : currentSymbol.dailySymbols + 5
                : currentSymbol.daily
                ? currentSymbol.dailySymbols
                : 0}{" "}
              symbols / day
            </p>
            <p>
              {currentSymbol.type === "arcane"
                ? currentSymbol.weekly
                  ? 45 + " symbols / week"
                  : 0 + " symbols / week"
                : ""}{" "}
            </p>
          </div>
        </div>

        <div className="vertical-divider"></div>

        <div className="w-[350px] space-y-10">
          <div className="symbol-stats">
            <div className="flex justify-center items-center text-primary text-xl font-semibold tracking-wider">
              <div
                className={`flex space-x-2 items-center ${
                  currentSymbol.level === (!swapped ? 20 : 11) ||
                  isNaN(currentSymbol.level)
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
                  currentSymbol.level === (!swapped ? 20 : 11) ||
                  isNaN(currentSymbol.level)
                    ? "block"
                    : "hidden"
                }`}
              >
                <h1>
                  {currentSymbol.level === (!swapped ? 20 : 11) ? (
                    <div className="py-[72.5%]">
                      <p className="text-accent">Max Level</p>
                    </div>
                  ) : (
                    <div className="space-y-4 py-[40%]">
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
              isNaN(currentSymbol.level) ||
              currentSymbol.level === (!swapped ? 20 : 11)
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
                        (nextLevel.symbolsRequired - currentSymbol.experience) /
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
                      {nextLevel.symbolsRequired - currentSymbol.experience > 1
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
              isNaN(currentSymbol.level) ||
              currentSymbol.level === (!swapped ? 20 : 11)
                ? "hidden"
                : "block"
            }`}
          >
            <p>
              {(() => {
                try {
                  if (
                    currentSymbol.level <= (!swapped ? 19 : 10) &&
                    currentSymbol.level > 0
                  ) {
                    return (
                      <span>{nextLevel.mesosRequired.toLocaleString()}</span>
                    );
                  }
                } catch (e) {
                  //console.log((e as Error).message);
                }
              })()}{" "}
              mesos required
            </p>
          </div>

          <div
            className={`symbol-stats ${
              isNaN(currentSymbol.level) ||
              currentSymbol.level === (!swapped ? 20 : 11)
                ? "hidden"
                : "block"
            }`}
          >
            <p className="flex justify-center items-center space-x-1.5">
              <span>+100</span> <p>main stat</p>
              <HiChevronDoubleRight
                size={19}
                className="fill-accent hover:fill-hover transition-all"
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
