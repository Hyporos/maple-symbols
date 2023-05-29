import React, { useEffect, useState } from "react";
import "./Calculator.css";

const Calculator = () => {
  const [vjKillQuest, setVjKillQuest] = useState(false);
  const [vjPartyQuest, setVjPartyQuest] = useState(false);
  const [vjExpansion, setVjExpansion] = useState(false);

  const [vjLevel, setVjLevel] = useState(0);
  const [vjExperience, setVjExperience] = useState(0);

  const [vjDailySymbols, setVjDailySymbols] = useState(0);

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
    const date = new Date();
    date.setDate(date.getDate() + ~~(vjRemainingSymbols / vjDailySymbols));
    let currentDay = String(date.getDate() + 1).padStart(2, "0");
    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
    let currentYear = date.getFullYear();

    let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;


    setVjCompletionDate(currentDate);
  }, [vjLevel, vjExperience, vjDailySymbols])

  return (
    <section>
      <div className="h-screen flex justify-center items-center flex-row">
        <div className="bg-transparent px-6 py-6 space-y-4 w-1/6 shadow-card">
          <div className="flex flex-row justify-center items-center space-x-4">
            <img src="/vj-symbol.webp" alt="Vanishing Journey Symbol" />
            <p className="text-xl text-text font-semibold font-maven-pro uppercase">
              Vanishing Journey
            </p>
          </div>

          <div className="flex justify-center align-center space-x-3">
            <input
              type="number"
              id="vj-level"
              placeholder="Level"
              onChange={onChangeLevel}
              value={vjLevel}
              className="bg-secondary text-text text-center text-sm rounded-lg block w-full p-2.5"
            ></input>
            <input
              type="number"
              id="vj-level"
              placeholder="Experience"
              onChange={onChangeExperience}
              value={vjExperience}
              className="bg-secondary text-text text-center text-sm rounded-lg block w-full p-2.5"
            ></input>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setVjKillQuest(!vjKillQuest);
              }}
              className={`flex flex-row justify-center bg-secondary rounded border-2 shadow-input ${
                vjKillQuest ? "shadow-checked" : "shadow-unchecked"
              } py-1.5 w-full`}
            >
              <p className="font-semibold text-text">Kill Quest</p>
            </button>

            <button
              onClick={() => {
                setVjPartyQuest(!vjPartyQuest);
              }}
              className={`flex flex-row justify-center bg-secondary rounded border-2 shadow-input ${
                vjPartyQuest ? "shadow-checked" : "shadow-unchecked"
              } py-1.5 w-full`}
            >
              <p className="font-semibold text-text">Party Quest</p>
            </button>
          </div>

          <div>
            <button
              onClick={() => {
                setVjExpansion(!vjExpansion);
              }}
              className={`flex flex-row justify-center bg-secondary rounded border-2 shadow-input ${
                vjExpansion ? "shadow-checked" : "shadow-unchecked"
              } py-1.5 w-full`}
            >
              <p className="font-semibold text-text">Reverse City</p>
            </button>
          </div>

          <div className="flex justify-center text-text text-opacity-70">
            <p>{vjDailySymbols} symbols / day</p>
          </div>
        </div>
        <div className="pl-10 flex justify-center text-text text-opacity-70 flex-col">
          <p>{vjRemainingSymbols} symbols remaining</p>
          <p>{~~(vjRemainingSymbols / vjDailySymbols)} days to go</p>
          <p>{vjSpentMesos} mesos spent</p>
          <p>{vjRemainingMesos} mesos remaining</p>
          <p>Complete on {vjCompletionDate}</p>
          <p>{vjLevel} Level</p>
          <p>{vjExperience} Experience</p>
          <p>{vjTotalSymbols} Total Symbols</p>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
