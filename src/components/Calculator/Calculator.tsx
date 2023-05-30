import { useEffect, useState } from "react";
import { HiChevronUp, HiChevronDoubleUp } from "react-icons/hi";
import { z } from "zod";
import "./Calculator.css";

const Calculator = () => {
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

  const arcaneStatData = [
    { class: "Demon Avenger", statForm: "HP", statGain: 2100 },
    { class: "Xenon", statForm: "all stat", statGain: 48 },
    { class: "Other", statForm: "main stat", statGain: 100 },
  ];

  const arcaneForcePerUpgrade = 10;

  const [vjKillQuest, setVjKillQuest] = useState(false);
  const [vjPartyQuest, setVjPartyQuest] = useState(false);
  const [vjExpansion, setVjExpansion] = useState(false);

  const [vjDailySymbols, setVjDailySymbols] = useState(0);

  const [vjLevel, setVjLevel] = useState(1);
  const [vjExperience, setVjExperience] = useState(0);

  const [vjTotalSymbols, setVjTotalSymbols] = useState(0);
  const [vjRemainingSymbols, setVjRemainingSymbols] = useState(0);

  const [vjSpentMesos, setVjSpentMesos] = useState(0);
  const [vjRemainingMesos, setVjRemainingMesos] = useState(0);

  const [vjDaysRemaining, setVjDaysRemaining] = useState(0);
  const [vjCompletionDate, setVjCompletionDate] = useState("");

  const [vjUpgradeReady, setVjUpgradeReady] = useState(false);

  const [selectedClass, setSelectedClass] = useState(2);

  useEffect(() => {
    let dailySymbols = 0;
    if (vjKillQuest) dailySymbols += 9;
    if (vjPartyQuest) dailySymbols += 6;
    if (vjExpansion) dailySymbols += 9;
    setVjDailySymbols(dailySymbols);
  }, [vjKillQuest, vjPartyQuest, vjExpansion]);

  useEffect(() => {
    if (vjLevel > 20) setVjLevel(20);
    if (vjLevel < 1) setVjLevel(1);

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

  useEffect(() => {
    const result = vjSymbolData.find(
      (required) => required.level === vjLevel + 1
    );
    if (vjExperience >= result?.symbolsRequired) {
      setVjUpgradeReady(false);
    } else {
      setVjUpgradeReady(true);
    }
  }, [vjRemainingSymbols]);

  const handleVjUpgrade = () => {
    const result = vjSymbolData.find(
      (required) => required.level === vjLevel + 1
    );
    if (vjExperience >= result?.symbolsRequired) {
      setVjExperience(vjExperience - result?.symbolsRequired);
      setVjLevel(vjLevel + 1);
      setVjUpgradeReady(true);
    }
  };

  return (
    <section>
      <div className="h-screen flex justify-center items-center">
        <div className="flex shadow-card items-center bg-card rounded-lg h-[350px]">
          <div className="px-10 space-y-6 w-[350px]">
            <div className="flex justify-center items-center space-x-4 pb-4">
              <img src="/vj-symbol.webp" alt="Vanishing Journey Symbol" />
              <p className="text-xl text-primary font-semibold tracking-wider uppercase">
                Vanishing Journey
              </p>
            </div>

            <div className="flex space-x-4 justify-center">
              <input
                type="number"
                id="level"
                placeholder="Level"
                onChange={(event) => setVjLevel(parseInt(event.target.value))}
                value={vjLevel}
                className="symbol-input"
              ></input>
              <input
                type="number"
                id="experience"
                placeholder="Experience"
                onChange={(event) =>
                  setVjExperience(parseInt(event.target.value))
                }
                value={vjExperience}
                className="symbol-input"
              ></input>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setVjKillQuest(!vjKillQuest);
                }}
                className={`daily-box ${vjKillQuest && "border-checked"}`}
              >
                Daily
              </button>

              <button
                onClick={() => {
                  setVjPartyQuest(!vjPartyQuest);
                }}
                className={`daily-box ${vjPartyQuest && "border-checked"}`}
              >
                Weekly
              </button>
              <button
                onClick={() => {
                  setVjExpansion(!vjExpansion);
                }}
                className={`daily-box ${vjExpansion && "border-checked"}`}
              >
                Extra
              </button>
            </div>

            <div className="flex justify-between items-center text-primary text-opacity-70 pt-4">
              <HiChevronUp
                onClick={() => setVjExperience(vjExperience + vjDailySymbols)}
                size={30}
                color={"#b18bd0"}
                cursor="pointer"
              />
              <p className="select-none">{vjDailySymbols} symbols / day</p>
              <HiChevronDoubleUp
                onClick={() => handleVjUpgrade()}
                size={30}
                color={!vjUpgradeReady ? "#b18bd0" : "#919191"}
                cursor={!vjUpgradeReady ? "pointer" : "default"}
              />
            </div>
          </div>

          <div className="h-[350px] w-px bg-gradient-to-t from-transparent via-white to-transparent opacity-10"></div>

          <div className="space-y-9 w-[350px]">
            <div className="symbol-stats">
              <h1 className="text-primary text-xl font-semibold tracking-wider">
                Level <span>{vjLevel}</span> &gt; Level{" "}
                <span>{vjLevel + 1}</span>
              </h1>
            </div>

            <div className="symbol-stats">
              <p>
                <span>
                  {vjLevel >= 0 &&
                    vjLevel <= 19 &&
                    ~~(
                      (vjSymbolData[vjLevel].symbolsRequired - vjExperience) /
                      vjDailySymbols
                    )}
                </span>{" "}
                days to go
              </p>
              <p>
                <span>
                  {vjLevel >= 0 &&
                    vjLevel <= 19 &&
                    vjSymbolData[vjLevel].symbolsRequired - vjExperience}
                </span>{" "}
                symbols remaining
              </p>
              <p>
                <span>
                  {vjLevel >= 0 &&
                    vjLevel <= 19 &&
                    vjSymbolData[vjLevel].mesosRequired.toLocaleString()}
                </span>{" "}
                mesos required
              </p>
            </div>

            <div className="symbol-stats">
              <p>
                <span>+{arcaneForcePerUpgrade}</span> arcane force
              </p>
              <p>
                <span>+{arcaneStatData[selectedClass].statGain}</span>{" "}
                {arcaneStatData[selectedClass].statForm}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
