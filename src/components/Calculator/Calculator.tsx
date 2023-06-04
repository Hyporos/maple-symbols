import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { HiArrowSmRight } from "react-icons/hi";
import { TbSlash } from "react-icons/tb";
import "./Calculator.css";

interface Props {
  arcaneSymbols: [
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
      weeklySymbols: number;
      data: [{
        level: number;
        symbolsRequired: number;
        mesosRequired: number;
      }]
    }
  ];
  setArcaneSymbols: Dispatch<SetStateAction<object>>;
  selectedArcane: number;
  classData: [{
    name: string;
    statForm: string;
    statGain: number;
  }]
  selectedClass: number;
}

const Calculator = ({
  arcaneSymbols,
  setArcaneSymbols,
  selectedArcane,
  classData,
  selectedClass,
}: Props) => {

  const [vjRemainingSymbols, setVjRemainingSymbols] = useState(0);

  const [vjDaysRemaining, setVjDaysRemaining] = useState(0);
  const [vjCompletionDate, setVjCompletionDate] = useState("");

  const nextSymbol = arcaneSymbols.find(
    (symbol) => symbol.level === arcaneSymbols[selectedArcane].level + 1
  );

  const requiredSymbols = nextSymbol?.symbolsRequired - arcaneSymbols[selectedArcane].experience;
  const symbolInProgress = arcaneSymbols[selectedArcane].experience < nextSymbol?.data.symbolsRequired;

  useEffect(() => {
    const remainingSymbols = 0;
    const splicedSymbols = arcaneSymbols[selectedArcane].data.splice(arcaneSymbols[selectedArcane].level, 20 - arcaneSymbols[selectedArcane].level);
    setVjRemainingSymbols(
      splicedSymbols.reduce(
        (total, currentSymbol) => total + currentSymbol.symbolsRequired,
        remainingSymbols
      ) - arcaneSymbols[selectedArcane].experience
    );
  }, []);

  useEffect(() => {
    setVjDaysRemaining(
      Math.ceil(vjRemainingSymbols / (arcaneSymbols[selectedArcane].dailySymbols + 6.42857142857))
    );
  }, [vjRemainingSymbols, arcaneSymbols[selectedArcane].dailySymbols, arcaneSymbols[selectedArcane].weeklySymbols]);

  useEffect(() => {
    const date = new Date();
    date.setDate(
      date.getDate() + Math.ceil(vjRemainingSymbols / arcaneSymbols[selectedArcane].dailySymbols)
    );
    const currentDay = String(date.getDate()).padStart(2, "0");
    const currentMonth = String(date.getMonth() + 1).padStart(2, "0");
    const currentYear = date.getFullYear();
    const currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
    setVjCompletionDate(currentDate);
  }, [vjDaysRemaining]);

  return (
    <section>
      <div className="flex justify-center items-center">
        <div className="flex items-center bg-card rounded-t-lg h-[350px]">
          <div className="px-10 space-y-6 w-[350px]">
            <div className="flex justify-center items-center space-x-4 pb-6">
              <img
                src={arcaneSymbols[selectedArcane].img}
                alt={arcaneSymbols[selectedArcane].alt}
              />
              <p className="text-xl text-primary font-semibold tracking-wider uppercase">
                {arcaneSymbols[selectedArcane].name}
              </p>
            </div>

            <div className="flex justify-center items-center space-x-2">
              <input
                type="number"
                placeholder="Level"
                value={arcaneSymbols[selectedArcane].level}
                className="symbol-input"
                onChange={(e) => {
                  if (Number(e.target.value) <= 20) {
                    setArcaneSymbols(arcaneSymbols.map(symbol => symbol.id === selectedArcane + 1 ? {...symbol, level: parseInt(e.target.value)} : symbol));
                  }
                  if (Number(e.target.value) >= 21) {
                    setArcaneSymbols(arcaneSymbols.map(symbol => symbol.id === selectedArcane + 1 ? {...symbol, level: 20} : symbol));
                  }
                  if (e.target.value === "0") {
                    setArcaneSymbols(arcaneSymbols.map(symbol => symbol.id === selectedArcane + 1 ? {...symbol, level: 1} : symbol));
                  }
                }}
              ></input>
              <TbSlash size={30} color="#B2B2B2" />
              <input
                type="number"
                placeholder="Experience"
                value={arcaneSymbols[selectedArcane].experience}
                className="symbol-input"
                onChange={(e) => {
                  if (Number(e.target.value) <= 2679) {
                    setArcaneSymbols(arcaneSymbols.map(symbol => symbol.id === selectedArcane + 1 ? {...symbol, experience: parseInt(e.target.value)} : symbol));
                  }
                  if (Number(e.target.value) >= 2680) {
                    setArcaneSymbols(arcaneSymbols.map(symbol => symbol.id === selectedArcane + 1 ? {...symbol, experience: 2679} : symbol));
                  }
                  if (e.target.value === "0" && arcaneSymbols[selectedArcane].level === 1) {
                    setArcaneSymbols(arcaneSymbols.map(symbol => symbol.id === selectedArcane + 1 ? {...symbol, experience: 1} : symbol));
                  }
                  if (e.target.value === "00" || e.target.value === "000") {
                    arcaneSymbols[selectedArcane].level === 1 ? setArcaneSymbols(arcaneSymbols.map(symbol => symbol.id === selectedArcane + 1 ? {...symbol, experience: 1} : symbol)) : (e.target.value = "0");
                  }
                  if (e.target.value.startsWith("0")) {
                    e.target.value = e.target.value.substring(1);
                  }
                }}
              ></input>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                className={`daily-box ${arcaneSymbols[selectedArcane].daily && "border-checked"}`}
                onClick={() => setArcaneSymbols(arcaneSymbols.map(symbol => symbol.id === selectedArcane + 1 ? {...symbol, daily: !arcaneSymbols[selectedArcane].daily, dailySymbols: arcaneSymbols[selectedArcane].dailySymbols === 0 ? arcaneSymbols[selectedArcane].dailySymbols += 9 : arcaneSymbols[selectedArcane].dailySymbols -= 9} : symbol))}
              >
                Daily
              </button>

              <button
                className={`daily-box ${arcaneSymbols[selectedArcane].weekly && "border-checked"}`}
                onClick={() => setArcaneSymbols(arcaneSymbols.map(symbol => symbol.id === selectedArcane + 1 ? {...symbol, weekly: !arcaneSymbols[selectedArcane].weekly, weeklySymbols: arcaneSymbols[selectedArcane].weeklySymbols === 0 ? 45 : 0} : symbol)) }
              >
                Weekly
              </button>
              <button
                className={`daily-box ${arcaneSymbols[selectedArcane].extra && "border-checked"}`}
                onClick={() => setArcaneSymbols(arcaneSymbols.map(symbol => symbol.id === selectedArcane + 1 ? {...symbol, extra: !arcaneSymbols[selectedArcane].extra, dailySymbols: arcaneSymbols[selectedArcane].dailySymbols === 9 ? arcaneSymbols[selectedArcane].dailySymbols += 9 : arcaneSymbols[selectedArcane].dailySymbols -= 9} : symbol))}
              >
                Extra
              </button>
            </div>

            <div className="flex justify-center items-center text-tertiary pt-6">
              <div className="flex flex-col text-center text-sm">
                <p>{arcaneSymbols[selectedArcane].dailySymbols} symbols / day</p>
                <p>{arcaneSymbols[selectedArcane].weeklySymbols} symbols / week</p>
              </div>
            </div>
          </div>

          <div className="vertical-divider"></div>

          <div className="w-[350px] space-y-9">
            <div className="symbol-stats">
              <div className="flex justify-center items-center text-primary text-xl font-semibold tracking-wider">
                <div
                  className={`flex space-x-2 items-center ${
                    arcaneSymbols[selectedArcane].level === 20 || isNaN(arcaneSymbols[selectedArcane].level) ? "hidden" : "block"
                  }`}
                >
                  <h1>
                    Level <span>{arcaneSymbols[selectedArcane].level}</span>
                  </h1>
                  <HiArrowSmRight size={30} className="fill-basic" />
                  <h1>
                    Level <span>{arcaneSymbols[selectedArcane].level + 1}</span>
                  </h1>
                </div>
                <div
                  className={`text-2xl tracking-widest uppercase ${
                    arcaneSymbols[selectedArcane].level === 20 || isNaN(arcaneSymbols[selectedArcane].level) ? "block" : "hidden"
                  }`}
                >
                  <h1>
                    {arcaneSymbols[selectedArcane].level === 20 ? (
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
                isNaN(arcaneSymbols[selectedArcane].level) || arcaneSymbols[selectedArcane].level === 20 ? "hidden" : "block"
              }`}
            >
              {(() => {
                if (
                  symbolInProgress &&
                  (arcaneSymbols[selectedArcane].dailySymbols != 0 || arcaneSymbols[selectedArcane].weeklySymbols != 0)
                ) {
                  return (
                    <p>
                      <span>
                        {Math.ceil(
                          (arcaneSymbols[selectedArcane].data[arcaneSymbols[selectedArcane].level].symbolsRequired -
                            arcaneSymbols[selectedArcane].experience) /
                            (arcaneSymbols[selectedArcane].dailySymbols + arcaneSymbols[selectedArcane].weeklySymbols / 7)
                        )}
                      </span>{" "}
                      {Math.ceil(
                        (arcaneSymbols[selectedArcane].data[arcaneSymbols[selectedArcane].level].symbolsRequired - arcaneSymbols[selectedArcane].experience) /
                          (arcaneSymbols[selectedArcane].dailySymbols + arcaneSymbols[selectedArcane].weeklySymbols / 7)
                      ) > 1
                        ? "days to go"
                        : "day to go"}
                    </p>
                  );
                } else if (requiredSymbols <= 0) {
                  return (
                    <p>
                      <span>Ready</span> for upgrade
                    </p>
                  );
                } else if (isNaN(arcaneSymbols[selectedArcane].experience)) {
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
              })()}
              {(() => {
                if (symbolInProgress) {
                  return (
                    <p>
                      <span>{requiredSymbols}</span>{" "}
                      {requiredSymbols > 1
                        ? "symbols remaining"
                        : "symbol remaining"}
                    </p>
                  );
                } else if (requiredSymbols <= 0) {
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
              })()}
            </div>

            <div
              className={`symbol-stats ${
                isNaN(arcaneSymbols[selectedArcane].level) || arcaneSymbols[selectedArcane].level === 20 ? "hidden" : "block"
              }`}
            >
              <p>
                <span>
                  {arcaneSymbols[selectedArcane].level <= 19 &&
                    arcaneSymbols[selectedArcane].data[arcaneSymbols[selectedArcane].level].mesosRequired.toLocaleString()}
                </span>{" "}
                mesos required
              </p>
            </div>

            <div
              className={`symbol-stats ${
                isNaN(arcaneSymbols[selectedArcane].level) || arcaneSymbols[selectedArcane].level === 20 ? "hidden" : "block"
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
