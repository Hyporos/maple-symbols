import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { HiChevronUp, HiChevronDoubleUp, HiArrowSmRight } from "react-icons/hi";
import { TbSlash } from "react-icons/tb";
import "./Calculator.css";

interface Props {
  vjLevel: number;
  setVjLevel: Dispatch<SetStateAction<Number>>;
  vjUpgradeReady: boolean;
  setVjUpgradeReady: Dispatch<SetStateAction<boolean>>;
}

const Calculator = ({
  vjLevel,
  setVjLevel,
  vjUpgradeReady,
  setVjUpgradeReady,
}: Props) => {
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

  const [vjKillQuest, setVjKillQuest] = useState(false);
  const [vjPartyQuest, setVjPartyQuest] = useState(false);
  const [vjExpansion, setVjExpansion] = useState(false);

  const [vjDailySymbols, setVjDailySymbols] = useState(0);
  const [vjWeeklySymbols, setVjWeeklySymbols] = useState(0);

  const [vjExperience, setVjExperience] = useState(NaN);

  const [vjTotalSymbols, setVjTotalSymbols] = useState(0);
  const [vjRemainingSymbols, setVjRemainingSymbols] = useState(0);

  const [vjSpentMesos, setVjSpentMesos] = useState(0);
  const [vjRemainingMesos, setVjRemainingMesos] = useState(0);

  const [vjDaysRemaining, setVjDaysRemaining] = useState(0);
  const [vjCompletionDate, setVjCompletionDate] = useState("");

  const [selectedClass, setSelectedClass] = useState(2);

  const nextSymbol = vjSymbolData.find(
    (required) => required.level === vjLevel + 1
  );

  useEffect(() => {
    let dailySymbols = 0;
    if (vjKillQuest) dailySymbols += 9;
    vjPartyQuest ? setVjWeeklySymbols(45) : setVjWeeklySymbols(0);
    if (vjExpansion) dailySymbols += 9;
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

    vjExperience < nextSymbol?.symbolsRequired
      ? setVjUpgradeReady(true)
      : setVjUpgradeReady(false);

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
    setVjDaysRemaining(Math.ceil(vjRemainingSymbols / vjDailySymbols));
  }, [vjRemainingSymbols, vjDailySymbols]);

  useEffect(() => {
    const date = new Date();
    date.setDate(
      date.getDate() + Math.ceil(vjRemainingSymbols / vjDailySymbols)
    );
    let currentDay = String(date.getDate()).padStart(2, "0");
    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
    let currentYear = date.getFullYear();
    let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
    setVjCompletionDate(currentDate);
  }, [vjDaysRemaining]);

  const handleVjUpgrade = () => {
    if (vjExperience < nextSymbol?.symbolsRequired) {
      setVjExperience(vjExperience - nextSymbol?.symbolsRequired); // fix stupid boolean usestate opposite bug
      setVjLevel(vjLevel + 1);
    }
  };

  return (
    <section>
      <div className="flex justify-center items-center">
        <div className="flex shadow-card items-center bg-card rounded-lg h-[350px]">
          <div className="px-10 space-y-6 w-[350px]">
            <div className="flex justify-center items-center space-x-4 pb-6">
              <img
                src="/symbols/vj-symbol.webp"
                alt="Vanishing Journey Symbol"
              />
              <p className="text-xl text-primary font-semibold tracking-wider uppercase">
                Vanishing Journey
              </p>
            </div>

            <div className="flex justify-center items-center space-x-2">
              <input
                type="number"
                placeholder="Level"
                id="level"
                value={vjLevel}
                className="symbol-input"
                onChange={(e) =>
                  Number(e.target.value) <= 20 && Number(e.target.value) > 0
                    ? setVjLevel(parseInt(e.target.value))
                    : Number(e.target.value) <= 20
                    ? setVjLevel(NaN)
                    : setVjLevel(20)
                }
              ></input>
              <TbSlash size={30} color="#B2B2B2" />
              <input
                type="number"
                placeholder="Experience"
                id="experience"
                value={vjExperience}
                className="symbol-input"
                onChange={(e) =>
                  Number(e.target.value) <= 2679 && Number(e.target.value) > 0
                    ? setVjExperience(parseInt(e.target.value))
                    : Number(e.target.value) <= 2679 && vjLevel != 1
                    ? setVjExperience(parseInt(e.target.value)) // buggedddddddddd. validate for 0000000000
                    : Number(e.target.value) <= 2679
                    ? setVjExperience(NaN)
                    : setVjExperience(2679)
                }
              ></input>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                className={`daily-box ${vjKillQuest && "border-checked"}`}
                onClick={() => setVjKillQuest(!vjKillQuest)}
              >
                Daily
              </button>

              <button
                className={`daily-box ${vjPartyQuest && "border-checked"}`}
                onClick={() => setVjPartyQuest(!vjPartyQuest)}
              >
                Weekly
              </button>
              <button
                className={`daily-box ${vjExpansion && "border-checked"}`}
                onClick={() => setVjExpansion(!vjExpansion)}
              >
                Extra
              </button>
            </div>

            <div className="flex justify-between items-center text-secondary select-none pt-6">
              <HiChevronUp
                size={30}
                color="#b18bd0"
                cursor="pointer"
                onClick={() => setVjExperience(vjExperience + vjDailySymbols)}
              />
              <div className="flex flex-col text-center text-sm">
                <p>{vjDailySymbols} symbols / day</p>
                <p>{vjWeeklySymbols} symbols / week</p>
              </div>
              <HiChevronDoubleUp
                size={30}
                color="#b18bd0"
                cursor="pointer"
                onClick={() => setVjExperience(vjExperience + vjWeeklySymbols)}
              />
            </div>
          </div>

          <div className="vertical-divider"></div>

          <div className="w-[350px] space-y-9">
            <div className="symbol-stats">
              <div className="flex justify-center items-center text-primary text-xl font-semibold tracking-wider">
                <div
                  className={`flex space-x-2 ${
                    vjLevel === 20 || Number.isNaN(vjLevel) ? "hidden" : "block"
                  }`}
                >
                  <h1>
                    Level <span>{vjLevel}</span>
                  </h1>
                  <HiArrowSmRight size={25} color={"#B2B2B2"} />
                  <h1>
                    Level <span>{vjLevel + 1}</span>
                  </h1>
                </div>
                <div
                  className={`text-2xl tracking-widest uppercase ${
                    vjLevel === 20 || Number.isNaN(vjLevel) ? "block" : "hidden"
                  }`}
                >
                  <h1>
                    {vjLevel === 20 ? (
                      <span className="text-accent text-2xl font-bold">
                        Max Level
                      </span>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-secondary">Locked</p>
                        <p className="text-secondary text-xs lowercase font-light tracking-widest">
                          Enter a level to unlock this symbol
                        </p>
                      </div>
                    )}
                  </h1>
                </div>
              </div>
            </div>

            <div
              className={`symbol-stats ${
                Number.isNaN(vjLevel) || vjLevel === 20 ? "hidden" : "block"
              }`}
            >
              <p>
                <span>
                  {vjLevel <= 19 && vjUpgradeReady
                    ? Math.ceil(
                        (vjSymbolData[vjLevel].symbolsRequired - vjExperience) /
                          vjDailySymbols
                      )
                    : "Ready"}
                </span>
                {vjUpgradeReady
                  ? " days to go"
                  : " for upgrade"}
              </p>
              <p>
                <span>
                  {vjLevel <= 19 && vjUpgradeReady
                    ? vjSymbolData[vjLevel].symbolsRequired - vjExperience
                    : "Sufficient"}
                </span>
                {vjUpgradeReady
                  ? " symbols remaining"
                  : " symbols reached"}
              </p>
            </div>

            <div
              className={`symbol-stats ${
                Number.isNaN(vjLevel) || vjLevel === 20 ? "hidden" : "block"
              }`}
            >
              <p>
                <span>
                  {vjLevel <= 19 &&
                    vjSymbolData[vjLevel].mesosRequired.toLocaleString()}
                </span>{" "}
                mesos required
              </p>
            </div>

            <div
              className={`symbol-stats ${
                Number.isNaN(vjLevel) || vjLevel === 20 ? "hidden" : "block"
              }`}
            >
              <p>
                <span>+10</span> arcane force
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
