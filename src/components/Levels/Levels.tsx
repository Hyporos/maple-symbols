import { useEffect, useMemo, useState } from "react";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import dayjs from "dayjs";
import "./Levels.css";

interface Props {
  symbols: [
    {
      name: string;
      img: string;
      alt: string;
      type: string;
      level: number;
      extra: boolean;
      daily: ConstrainBooleanParameters;
      dailySymbols: number;
      weekly: boolean;
      experience: number;
      symbolsRemaining: number;
      daysRemaining: number;
      completion: string;
      data: [
        {
          level: number;
          symbolsRequired: number;
        }
      ];
    }
  ];
  swapped: boolean;
}

const Levels = ({ symbols, swapped }: Props) => {
  const [targetSymbol, setTargetSymbol] = useState(0);
  const [targetLevel, setTargetLevel] = useState(NaN);
  const [targetDays, setTargetDays] = useState(NaN);
  const [selectedNone, setSelectedNone] = useState(true);

  const currentSymbol = symbols[targetSymbol];

  const dailySymbols = currentSymbol.daily
    ? currentSymbol.dailySymbols *
      (currentSymbol.extra ? (currentSymbol.type === "arcane" ? 2 : 1.5) : 1)
    : 0;

  const targetSymbols =
    currentSymbol.data
      .slice(currentSymbol.level, targetLevel)
      .reduce(
        (total, currentSymbol) => total + currentSymbol.symbolsRequired,
        0
      ) - currentSymbol.experience;

  useMemo(() => {
    try {
      let days = 0;
      let count = 0;
      let resets = 0;
      let mondayReached = false;
      for (let i = 0; i < 1000; i++) {
        if (
          days * dailySymbols + (currentSymbol.weekly ? resets * 45 : 0) <
          targetSymbols
        ) {
          if (
            // ? Should this be a while loop? while monday false
            mondayReached === false &&
            dayjs().add(count, "day").isBefore(dayjs().day(8))
          ) {
            count++;
            if (dayjs().add(count, "day").isSame(dayjs().day(8))) {
              //resets++; // ? Should the 'Weekly Done' toggle be included?
              mondayReached = true;
            }
          } else if ((days - count) % 7 === 0) {
            resets++;
          }
          days++;
        }
      }
      setTargetDays(days);
    } catch (e) {
      ////console.log(e as Error);
    }
  }, [
    targetLevel,
    currentSymbol.level,
    currentSymbol.experience,
    currentSymbol.weekly,
    currentSymbol.daily,
    currentSymbol.extra,
  ]);

  const targetDate = dayjs()
    .add(targetDays, "day")
    .format("YYYY-MM-DD")
    .toString();

  useEffect(() => {
    setSelectedNone(true);
  }, [swapped]);

  return (
    <section className="levels">
      <div className="flex justify-center items-center bg-gradient-to-t from-card to-card-grad rounded-lg w-[1050px] p-10 mt-28">
        <div className="flex flex-col w-[1050px]">
          <div className="flex items-center text-center text-tertiary">
            <HiOutlineQuestionMarkCircle size={30} className="w-1/4" />
            <p className="w-1/4 tracking-wider">Symbol</p>
            <p className="w-1/4 tracking-wider">Target Level</p>
            <p className="w-1/4 tracking-wider">Completion Date</p>
            <p className="w-1/4 tracking-wider">Symbols Remaining</p>
          </div>
          <hr className="horizontal-divider" />
          {symbols.map(
            (symbol, index) =>
              symbol.type === (!swapped ? "arcane" : "sacred") && (
                <div
                  className={`${
                    targetSymbol === index &&
                    selectedNone === false &&
                    symbol.level < 20 &&
                    "rounded-3xl shadow-level shadow-accent z-10 "
                  }`}
                >
                  <div
                    onClick={() => {
                      setTargetSymbol(index);
                      setTargetLevel(NaN);
                      targetSymbol === index
                        ? setSelectedNone(!selectedNone)
                        : setSelectedNone(false);
                    }}
                    className={`flex items-center text-center hover:bg-dark cursor-pointer py-4 ${
                      isNaN(symbol.level) && "opacity-25 pointer-events-none"
                    } ${symbol.level === 20 && "pointer-events-none"} ${
                      targetSymbol === index &&
                      selectedNone === false &&
                      symbol.level < 20
                        ? "bg-dark hover:bg-gradient-to-b hover:from-light rounded-t-3xl"
                        : "rounded-3xl"
                    }`}
                  >
                    <div className="w-1/4 flex justify-center">
                      <img
                        src={symbol.img}
                        alt={symbol.alt}
                        width={40}
                        className={`${
                          isNaN(symbol.level) && "filter grayscale"
                        }`}
                      ></img>
                    </div>
                    <p className="w-1/4 tracking-wider">{symbol.name}</p>
                    <p
                      className={`w-1/4 ${
                        isNaN(symbol.level) ? "filter grayscale" : "text-accent"
                      }`}
                    >
                      {symbol.level === 20
                        ? "MAX"
                        : isNaN(symbol.level)
                        ? "0"
                        : 20}
                    </p>
                    <div className="w-1/4">
                      <p>
                        {symbol.level === 20 || isNaN(symbol.level)
                          ? "‎"
                          : symbol.completion === "Invalid Date" || (!symbol.daily && !symbol.weekly) || isNaN(symbol.experience)
                          ? "Indefinite"
                          : symbol.daysRemaining === 0
                          ? "Complete"
                          : symbol.completion}
                      </p>
                      <p className="text-tertiary">
                        {symbol.level === 20 || isNaN(symbol.level)
                          ? "‎"
                          : String(symbol.daysRemaining) === "Infinity" ||
                            isNaN(symbol.daysRemaining) || (!symbol.daily && !symbol.weekly) || isNaN(symbol.experience)
                          ? "? days"
                          : symbol.daysRemaining === 0
                          ? "Ready for upgrade"
                          : symbol.daysRemaining > 1
                          ? symbol.daysRemaining + " days"
                          : symbol.daysRemaining + " day"}
                      </p>
                    </div>
                    <p className="w-1/4">
                      {symbol.level === 20 || isNaN(symbol.level)
                        ? "‎"
                        : isNaN(symbol.symbolsRemaining)
                        ? "?"
                        : symbol.symbolsRemaining === 0
                        ? "‎"
                        : symbol.symbolsRemaining}
                    </p>
                  </div>
                  <div
                    className={`flex items-center text-center rounded-b-3xl bg-dark py-4 ${
                      isNaN(symbol.level) && "opacity-25 pointer-events-none"
                    } ${symbol.level === 20 && "pointer-events-none"} ${
                      targetSymbol === index &&
                      selectedNone === false &&
                      symbol.level < 20
                        ? "block border-secondary"
                        : "hidden"
                    }`}
                  >
                    <div className="w-1/4">
                      <hr className="ml-24 w-[330px] border-y border-white border-opacity-5 absolute"></hr>
                      <hr className="ml-24 translate-y-level h-[40px] border-x border-white border-opacity-5 absolute"></hr>
                    </div>
                    <div className="w-1/4"></div>
                    <div className="w-1/4">
                      <input
                        type="number"
                        placeholder="Level"
                        value={targetLevel}
                        className="level-input"
                        onChange={(e) => {
                          if (Number(e.target.value) <= (!swapped ? 20 : 11)) {
                            setTargetLevel(parseInt(e.target.value));
                          }
                          if (Number(e.target.value) >= (!swapped ? 20 : 11)) {
                            setTargetLevel(!swapped ? 20 : 11);
                          }
                          if (Number(e.target.value) < 0) {
                            setTargetLevel(NaN);
                          }
                          if (e.target.value === "0") {
                            setTargetLevel(1);
                          }
                        }}
                      />
                    </div>
                    <div className="w-1/4">
                      <p>
                        {targetSymbols === 0
                          ? "Complete"
                          : targetLevel <= symbol.level ||
                            isNaN(targetLevel) ||
                            targetDate === "Invalid Date"
                          ? "Indefinite"
                          : targetDate}
                      </p>
                      <p className="text-tertiary">
                        {targetSymbols === 0
                          ? "Ready for upgrade"
                          : targetLevel <= symbol.level
                          ? "Level must be over " + symbol.level
                          : isNaN(targetLevel)
                          ? "Enter a target level"
                          : String(targetDays) ===
                              ("Infinity" || "-Infiinity") || isNaN(targetDays)
                          ? "? days"
                          : targetDays > 1
                          ? targetDays + " days"
                          : targetDays + " day"}
                      </p>
                    </div>
                    <p className="w-1/4">
                      {isNaN(targetSymbols) || targetSymbols < 0
                        ? "?"
                        : targetSymbols}
                    </p>
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </section>
  );
};

export default Levels;
