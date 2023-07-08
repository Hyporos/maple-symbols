import { useEffect, useState } from "react";
import { HiChevronUp, HiOutlineQuestionMarkCircle } from "react-icons/hi2";
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
  selectedArcane: number;
}

const Levels = ({ symbols, swapped }: Props) => {
  const [selectedSymbol, setSelectedSymbol] = useState(0);
  const [selectedNone, setSelectedNone] = useState(true);

  const [targetLevel, setTargetLevel] = useState(NaN);
  const [targetSymbols, setTargetSymbols] = useState(0);
  const [targetDays, setTargetDays] = useState(0);
  const [targetDate, setTargetDate] = useState("");

  const [set, setSet] = useState(false);

  const currentSymbol = symbols[selectedSymbol];

  const symbolCount =
    (currentSymbol.extra && currentSymbol.daily
      ? currentSymbol.dailySymbols * 2
      : currentSymbol.daily
      ? currentSymbol.dailySymbols
      : 0) + (currentSymbol.weekly ? 45 / 7 : 0);

  useEffect(() => {
    const splicedSymbols = currentSymbol.data.slice(
      symbols[selectedSymbol].level,
      targetLevel
    );

    setTargetSymbols(
      splicedSymbols.reduce(
        (total, currentSymbol) => total + currentSymbol.symbolsRequired,
        0
      ) - symbols[selectedSymbol].experience
    );
  }, [targetLevel, currentSymbol.experience]);

  useEffect(() => {
    setTargetDays(Math.ceil(targetSymbols / symbolCount));
  }, [targetLevel, targetSymbols, symbolCount]);

  useEffect(() => {
    setSelectedNone(true);
  }, [swapped]);

  useEffect(() => {
      const date = new Date();
      date.setDate(date.getDate() + Math.ceil(targetSymbols / symbolCount));
      const currentDay = String(date.getDate()).padStart(2, "0");
      const currentMonth = String(date.getMonth() + 1).padStart(2, "0");
      const currentYear = date.getFullYear();
      const currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
      setTargetDate(currentDate);
      setSet(true);
  }, [targetLevel, targetSymbols, symbolCount]);

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
          {symbols.map((symbol, index) =>
            !swapped
              ? symbol.type === "arcane" && (
                  <div
                    className={`${
                      selectedSymbol === index &&
                      selectedNone === false &&
                      symbol.level < 20 &&
                      "rounded-3xl shadow-level shadow-accent z-10 "
                    }`}
                  >
                    <div
                      onClick={() => {
                        setSelectedSymbol(index);
                        setTargetLevel(NaN);
                        selectedSymbol === index
                          ? setSelectedNone(!selectedNone)
                          : setSelectedNone(false);
                      }}
                      className={`flex items-center text-center hover:bg-dark cursor-pointer py-4 ${
                        isNaN(symbol.level) && "opacity-25 pointer-events-none"
                      } ${symbol.level === 20 && "pointer-events-none"} ${
                        selectedSymbol === index &&
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
                          isNaN(symbol.level)
                            ? "filter grayscale"
                            : "text-accent"
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
                            : symbol.completion === "NaN-NaN-NaN"
                            ? "Indefinite"
                            : symbol.daysRemaining === 0
                            ? "Complete"
                            : symbol.completion}
                        </p>
                        <p className="text-tertiary">
                          {symbol.level === 20 || isNaN(symbol.level)
                            ? "‎"
                            : String(symbol.daysRemaining) === "Infinity" ||
                              isNaN(symbol.daysRemaining)
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
                        selectedSymbol === index &&
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
                            if (Number(e.target.value) <= 20) {
                              setTargetLevel(parseInt(e.target.value));
                            }
                            if (Number(e.target.value) >= 20) {
                              setTargetLevel(20);
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
                            : targetLevel <= symbol.level || isNaN(targetLevel)
                            ? "Indefinite"
                            : targetDate === "NaN-NaN-NaN"
                            ? "Indefinite"
                            : targetDays > 0 
                            ? targetDate
                            : "‎"}
                        </p>
                        <p className="text-tertiary">
                          {(() => {
                            if (targetSymbols === 0) {
                              return <p>Ready for upgrade</p>;
                            } else if (targetLevel <= symbol.level) {
                              return <p>Level must be over {symbol.level}</p>;
                            } else if (isNaN(targetLevel)) {
                              return <p>Enter a target level</p>;
                            } else if (
                              String(targetDays) ===
                                ("Infinity" || "-Infinity") ||
                              isNaN(targetDays)
                            ) {
                              return <p>? days</p>;
                            } else if (targetDays > 1) {
                              return <p>{targetDays} days</p>;
                            } else if (targetDays > 0) {
                              return <p>{targetDays} day</p>;
                            } else {
                              return <p>‎</p>
                            }
                          })()}
                          {/*targetSymbols === 0
                            ? "Ready for upgrade"
                            : targetLevel <= symbol.level
                            ? "Level must be over " + symbol.level
                            : isNaN(targetLevel)
                            ? "Enter a target level"
                            : String(targetDays) ===
                                ("Infinity" || "-Infiinity") ||
                              isNaN(targetDays)
                            ? "? days"
                            : targetDays > 1
                            ? targetDays + " days"
                        : targetDays + " day"*/}
                        </p>
                      </div>
                      <p className="w-1/4">
                        {targetLevel <= symbol.level ||
                        isNaN(targetSymbols) ||
                        targetSymbols <= 0
                          ? "?"
                          : targetSymbols}
                      </p>
                    </div>
                  </div>
                )
              : symbol.type === "sacred" && (
                  <div
                    className={`${
                      selectedSymbol === index &&
                      selectedNone === false &&
                      symbol.level < 11 &&
                      "rounded-3xl shadow-level shadow-accent z-10 "
                    }`}
                  >
                    <div
                      onClick={() => {
                        setSelectedSymbol(index);
                        setTargetLevel(NaN);
                        selectedSymbol === index
                          ? setSelectedNone(!selectedNone)
                          : setSelectedNone(false);
                      }}
                      className={`flex items-center text-center hover:bg-dark cursor-pointer py-4 ${
                        isNaN(symbol.level) && "opacity-25 pointer-events-none"
                      } ${symbol.level === 11 && "pointer-events-none"} ${
                        selectedSymbol === index &&
                        selectedNone === false &&
                        symbol.level < 11
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
                          isNaN(symbol.level)
                            ? "filter grayscale"
                            : "text-accent"
                        }`}
                      >
                        {symbol.level === 11
                          ? "MAX"
                          : isNaN(symbol.level)
                          ? "0"
                          : 11}
                      </p>
                      <div className="w-1/4">
                        <p>
                          {symbol.level === 11 || isNaN(symbol.level)
                            ? "‎"
                            : symbol.completion === "NaN-NaN-NaN"
                            ? "Indefinite"
                            : symbol.daysRemaining === 0
                            ? "Complete"
                            : symbol.completion}
                        </p>
                        <p className="text-tertiary">
                          {symbol.level === 11 || isNaN(symbol.level)
                            ? "‎"
                            : String(symbol.daysRemaining) === "Infinity" ||
                              isNaN(symbol.daysRemaining)
                            ? "? days"
                            : symbol.daysRemaining === 0
                            ? "Ready for upgrade"
                            : symbol.daysRemaining > 1
                            ? symbol.daysRemaining + " days"
                            : symbol.daysRemaining + " day"}
                        </p>
                      </div>
                      <p className="w-1/4">
                        {symbol.level === 11 || isNaN(symbol.level)
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
                      } ${symbol.level === 11 && "pointer-events-none"} ${
                        selectedSymbol === index &&
                        selectedNone === false &&
                        symbol.level < 11
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
                            if (Number(e.target.value) <= 11) {
                              setTargetLevel(parseInt(e.target.value));
                            }
                            if (Number(e.target.value) >= 11) {
                              setTargetLevel(11);
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
                            : targetLevel <= symbol.level || isNaN(targetLevel)
                            ? "Indefinite"
                            : targetDate === "NaN-NaN-NaN"
                            ? "Indefinite"
                            : targetDays > 0 
                            ? targetDate
                            : "‎"}
                        </p>
                        <p className="text-tertiary">
                          {(() => {
                            if (targetSymbols === 0) {
                              return <p>Ready for upgrade</p>;
                            } else if (targetLevel <= symbol.level) {
                              return <p>Level must be over {symbol.level}</p>;
                            } else if (isNaN(targetLevel)) {
                              return <p>Enter a target level</p>;
                            } else if (
                              String(targetDays) ===
                                ("Infinity" || "-Infinity") ||
                              isNaN(targetDays)
                            ) {
                              return <p>? days</p>;
                            } else if (targetDays > 1) {
                              return <p>{targetDays} days</p>;
                            } else if (targetDays > 0) {
                              return <p>{targetDays} day</p>;
                            } else {
                              return <p>‎</p>
                            }
                          })()}
                          {/*targetSymbols === 0
                            ? "Ready for upgrade"
                            : targetLevel <= symbol.level
                            ? "Level must be over " + symbol.level
                            : isNaN(targetLevel)
                            ? "Enter a target level"
                            : String(targetDays) ===
                                ("Infinity" || "-Infiinity") ||
                              isNaN(targetDays)
                            ? "? days"
                            : targetDays > 1
                            ? targetDays + " days"
                        : targetDays + " day"*/}
                        </p>
                      </div>
                      <p className="w-1/4">
                        {targetLevel <= symbol.level ||
                        isNaN(targetSymbols) ||
                        targetSymbols < 0
                          ? "?"
                          : targetSymbols === 0
                          ? "0"
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
