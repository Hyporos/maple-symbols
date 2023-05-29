import { useEffect, useState } from "react";
import { HiChevronUp, HiChevronDoubleUp } from "react-icons/hi";
import "./Calculator.css";

const Calculator = () => {
  const [vjKillQuest, setVjKillQuest] = useState(false);
  const [vjPartyQuest, setVjPartyQuest] = useState(false);
  const [vjExpansion, setVjExpansion] = useState(false);

  const [vjDailySymbols, setVjDailySymbols] = useState(0);

  const [vjLevel, setVjLevel] = useState(0);
  const [vjExperience, setVjExperience] = useState(0);

  const [vjTotalSymbols, setVjTotalSymbols] = useState(0);
  const [vjRemainingSymbols, setVjRemainingSymbols] = useState(0);

  const [vjSpentMesos, setVjSpentMesos] = useState(0);
  const [vjRemainingMesos, setVjRemainingMesos] = useState(0);

  const [vjDaysRemaining, setVjDaysRemaining] = useState(0);
  const [vjCompletionDate, setVjCompletionDate] = useState("");

  const vjSymbolData = [
    { level: 1, symbolsRequired: 0, mesosRequired: 0 },
    { level: 2, symbolsRequired: 12, mesosRequired: 7070000 },
    { level: 3, symbolsRequired: 15, mesosRequired: 11030000 },
    { level: 4, symbolsRequired: 20, mesosRequired: 14990000 },
    { level: 5, symbolsRequired: 27, mesosRequired: 18950000 },
    { level: 6, symbolsRequired: 36, mesosRequired: 22910000 },
    { level: 7, symbolsRequired: 47, mesosRequired: 26870000 },
    { level: 8, symbolsRequired: 60, mesosRequired: 30830000 },
    { level: 9, symbolsRequired: 75, mesosRequired: 34790000 },
    { level: 10, symbolsRequired: 92, mesosRequired: 38750000 },
    { level: 11, symbolsRequired: 111, mesosRequired: 42710000 },
    { level: 12, symbolsRequired: 132, mesosRequired: 46670000 },
    { level: 13, symbolsRequired: 155, mesosRequired: 50630000 },
    { level: 14, symbolsRequired: 180, mesosRequired: 54590000 },
    { level: 15, symbolsRequired: 207, mesosRequired: 58550000 },
    { level: 16, symbolsRequired: 236, mesosRequired: 62510000 },
    { level: 17, symbolsRequired: 267, mesosRequired: 66470000 },
    { level: 18, symbolsRequired: 300, mesosRequired: 70430000 },
    { level: 19, symbolsRequired: 335, mesosRequired: 74390000 },
    { level: 20, symbolsRequired: 372, mesosRequired: 78350000 },
  ];

  const onChangeLevel = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVjLevel(parseInt(event.target.value));
  };

  const onChangeExperience = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVjExperience(parseInt(event.target.value));
  };

  useEffect(() => {
    let dailySymbols = 0;
    if (vjKillQuest) dailySymbols += 8;
    if (vjPartyQuest) dailySymbols += 6;
    if (vjExpansion) dailySymbols += 8;
    setVjDailySymbols(dailySymbols);
  }, [vjKillQuest, vjPartyQuest, vjExpansion]);

  useEffect(() => {
    let totalSymbols = 0;
    let splicedSymbols = vjSymbolData.splice(0, vjLevel);
    setVjTotalSymbols(
      splicedSymbols.reduce(
        (total, currentSymbol) => total + currentSymbol.symbolsRequired,
        totalSymbols
      ) + vjExperience
    );
    setVjSpentMesos(
      splicedSymbols.reduce(
        (total, currentSymbol) => total + currentSymbol.mesosRequired,
        totalSymbols
      )
    );
  }, [vjLevel, vjExperience]);

  useEffect(() => {
    let remainingSymbols = 0;
    let splicedSymbols = vjSymbolData.splice(vjLevel, 20 - vjLevel);
    setVjRemainingSymbols(
      splicedSymbols.reduce(
        (total, currentSymbol) => total + currentSymbol.symbolsRequired,
        remainingSymbols
      ) - vjExperience
    );
    setVjRemainingMesos(
      splicedSymbols.reduce(
        (total, currentSymbol) => total + currentSymbol.mesosRequired,
        remainingSymbols
      )
    );
  }, [vjTotalSymbols]);

  useEffect(() => {
    setVjDaysRemaining(~~(vjRemainingSymbols / vjDailySymbols));
  }, [vjRemainingSymbols, vjDailySymbols]);

  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + ~~(vjRemainingSymbols / vjDailySymbols));
    let currentDay = String(date.getDate()).padStart(2, "0");
    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
    let currentYear = date.getFullYear();

    let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;

    setVjCompletionDate(currentDate);
  }, [vjDaysRemaining]);

  return (
    <section>
      <div className="h-screen flex justify-center items-center">
        <div className="flex space-x-20">
          <div className="px-10 py-10 space-y-5 shadow-card max-w-card">
            <div className="flex justify-center items-center space-x-4 pb-4">
              <img src="/vj-symbol.webp" alt="Vanishing Journey Symbol" />
              <p className="text-xl text-text font-semibold uppercase">
                Vanishing Journey
              </p>
            </div>

            <div className="flex space-x-4 justify-center">
              <input
                type="number"
                id="vj-level"
                placeholder="Level"
                onChange={onChangeLevel}
                value={vjLevel}
                className="symbol-input"
              ></input>
              <input
                type="number"
                id="vj-level"
                placeholder="Experience"
                onChange={onChangeExperience}
                value={vjExperience}
                className="symbol-input"
              ></input>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setVjKillQuest(!vjKillQuest);
                }}
                className={`daily-box ${vjKillQuest && "shadow-primary"}`}
              >
                Kill Quest
              </button>

              <button
                onClick={() => {
                  setVjPartyQuest(!vjPartyQuest);
                }}
                className={`daily-box ${vjPartyQuest && "shadow-primary"}`}
              >
                Party Quest
              </button>
            </div>

            <div>
              <button
                onClick={() => {
                  setVjExpansion(!vjExpansion);
                }}
                className={`daily-box ${vjExpansion && "shadow-primary"}`}
              >
                Reverse City
              </button>
            </div>

            <div className="flex justify-between items-center text-text text-opacity-70 pt-4">
              <HiChevronUp
                onClick={() => console.log("clicked")}
                size={30}
                color={"#b18bd0"}
                className="card-icon"
              />
              <p>{vjDailySymbols} symbols / day</p>
              <HiChevronDoubleUp
                onClick={() => console.log("clicked")}
                size={30}
                color={"#919191"}
                className="card-icon"
              />
            </div>
          </div>

          <div className="flex shadow-card flex-col space-y-12 justify-center px-10">
            <div className="symbol-stats">
              <p>
                <span>{vjDaysRemaining}</span> days to go
              </p>
              <p>
                Complete on <span>{vjCompletionDate}</span>
              </p>
            </div>

            <div className="symbol-stats">
              <p>
                <span>{vjTotalSymbols}</span> total symbols
              </p>
              <p>
                <span>{vjRemainingSymbols}</span> symbols remaining
              </p>
            </div>

            <div className="symbol-stats">
              <p>
                <span>{vjSpentMesos.toLocaleString()}</span> total mesos spent
              </p>
              <p>
                <span>{vjRemainingMesos.toLocaleString()}</span> mesos needed
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
