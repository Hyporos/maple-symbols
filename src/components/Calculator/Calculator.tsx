import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  useFloating,
  offset,
  useHover,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { HiArrowSmRight, HiChevronDoubleRight } from "react-icons/hi";
import { TbSlash } from "react-icons/tb";
import "./Calculator.css";
import dayjs from "dayjs";

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
  swapped: boolean;
}

const Calculator = ({
  symbols,
  setSymbols,
  selectedSymbol,
  swapped,
}: Props) => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  const currentSymbol = symbols[selectedSymbol];
  const nextLevel = symbols[selectedSymbol].data[currentSymbol.level];

  /* ―――――――――――――――――――― Floating UI ―――――――――――――――――――― */

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

  /* ―――――――――――――――――――― Calculations ――――――――――――――――――― */

  // Calculates Daily/Weekly Symbols
  const questSymbols =
    (currentSymbol.daily
      ? currentSymbol.dailySymbols * (currentSymbol.extra ? 2 : 1)
      : 0) + (currentSymbol.weekly ? 45 / 7 : 0);

  // Calculates Remaining Symbols
  const symbolsRemaining =
    currentSymbol.data
      .slice(currentSymbol.level, !swapped ? 20 : 11)
      .reduce(
        (total, currentSymbol) => total + currentSymbol.symbolsRequired,
        0
      ) - currentSymbol.experience;

  useEffect(() => {
    setSymbols(
      symbols.map((symbol) =>
        symbol.id === selectedSymbol + 1
          ? { ...symbol, symbolsRemaining: symbolsRemaining }
          : symbol
      )
    );
  }, [currentSymbol.level, currentSymbol.experience]);

  // Calculates Remaining Days
  const daysRemaining = Math.ceil(
    currentSymbol.symbolsRemaining / questSymbols
  );

  useEffect(() => {
    setSymbols(
      symbols.map((symbol) =>
        symbol.id === selectedSymbol + 1
          ? { ...symbol, daysRemaining: daysRemaining }
          : symbol
      )
    );
  }, [
    currentSymbol.symbolsRemaining,
    currentSymbol.daily,
    currentSymbol.weekly,
    currentSymbol.extra,
  ]);

  // Calculates Completion Date
  const completion = dayjs()
    .add(daysRemaining, "day")
    .format("YYYY-MM-DD")
    .toString();

  useEffect(() => {
    setSymbols(
      symbols.map((symbol) =>
        symbol.id === selectedSymbol + 1
          ? { ...symbol, completion: completion }
          : symbol
      )
    );
  }, [currentSymbol.daysRemaining]);

  /* ―――――――――――――――――――― Render Logic ――――――――――――――――――― */

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
          <div className="text-secondary text-center space-y-1.5">
            <div className="flex justify-center items-center text-primary text-xl font-semibold tracking-wider">
              <div
                className={`text-secondary text-center space-y-1.5 ${
                  isNaN(currentSymbol.level) ||
                  currentSymbol.level === (!swapped ? 20 : 11)
                    ? "hidden"
                    : "block"
                }`}
              >
                {(() => {
                  try {
                    //BANDAID FIX. HORRIBLE LOGIC UPDATE ASAP
                    if (
                      currentSymbol.type === (!swapped ? "arcane" : "sacred") ||
                      (currentSymbol.level != 20 &&
                        currentSymbol.level != (!swapped && 11) &&
                        String(currentSymbol.level) != "NaN")
                    ) {
                      return (
                        <div className="flex space-x-2 items-center justify-center text-primary text-xl font-semibold tracking-wider">
                          <h1>
                            Level <span>{currentSymbol.level}</span>
                          </h1>
                          <HiArrowSmRight size={30} className="fill-basic" />
                          <h1>
                            Level <span>{currentSymbol.level + 1}</span>
                          </h1>
                        </div>
                      );
                    }
                  } catch (e) {
                    //console.log((e as Error).message);
                  }
                })()}
              </div>
              <div className={`text-2xl tracking-widest uppercase`}>
                {(() => {
                  try {
                    if (
                      currentSymbol.level === (!swapped ? 20 : 11) &&
                      currentSymbol.type === (!swapped ? "arcane" : "sacred")
                    ) {
                      //BANDAID FIX. HORRIBLE LOGIC UPDATE ASAP
                      return (
                        <div className="py-[72.5%]">
                          <p className="text-accent">Max Level</p>
                        </div>
                      );
                    } else if (isNaN(currentSymbol.level)) {
                      return (
                        <div className="space-y-4 py-[40%]">
                          <p className="text-secondary">Disabled</p>
                          <p className="text-secondary text-xs lowercase font-light tracking-widest">
                            Enter a level to enable this symbol
                          </p>
                        </div>
                      );
                    }
                  } catch (e) {
                    //console.log((e as Error).message);
                  }
                })()}
              </div>
            </div>
          </div>

          <div
            className={`text-secondary text-center space-y-1.5 ${
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
                            questSymbols
                        )}
                      </span>{" "}
                      {Math.ceil(
                        (nextLevel.symbolsRequired - currentSymbol.experience) /
                          questSymbols
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
            {(() => {
              try {
                if (
                  currentSymbol.level <= (!swapped ? 19 : 10) &&
                  currentSymbol.level > 0
                ) {
                  return (
                    <p className="pt-8">
                      <span>{nextLevel.mesosRequired.toLocaleString()}</span>{" "}
                      mesos required
                      <div className="flex justify-center items-center space-x-1.5 pt-10">
                        <p>
                          <span>{!swapped ? "+100" : "+200"}</span> main stat
                        </p>
                        <HiChevronDoubleRight
                          size={19}
                          className="fill-accent hover:fill-hover transition-all"
                        />
                      </div>
                    </p>
                  );
                }
              } catch (e) {
                //console.log((e as Error).message);
              }
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
