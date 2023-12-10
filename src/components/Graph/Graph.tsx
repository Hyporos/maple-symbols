import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { isValid, getRemainingSymbols, getDailySymbols } from "../../lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";
import "./Graph.css";
import { HiArrowSmRight } from "react-icons/hi";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

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
      symbolsRequired: Array<number>;
    }
  ];
  swapped: boolean;
}

interface GraphSymbols {
  name: string;
  level: number;
  progress: [{ level: number; date: string }];
}

const Graph = ({ symbols, swapped }: Props) => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  const isMobile = useMediaQuery({ query: `(max-width: 799px)` });
  const isTablet = useMediaQuery({ query: `(max-width: 1149px)` });

  const [graphSymbols, setGraphSymbols] = useState<GraphSymbols[]>([]);
  const [finalSymbols, setFinalSymbols] = useState([]);
  const [nonReduced, setNonReduced] = useState([]);
  const [basePower, setBasePower] = useState(0);
  const [targetPower, setTargetPower] = useState(0);
  const [dateToPower, setDateToPower] = useState("");

  /* ―――――――――――――――――――― Functions ―――――――――――――――――――――― */

  // Calculate the base arcane power of the character
  useEffect(() => {
    let tempBasePower = 0;

    for (const symbol of symbols) {
      if (
        !isValid(symbol.level) ||
        !isValid(symbol.experience) ||
        (!symbol.daily && !symbol.weekly)
      )
        continue;
      tempBasePower += symbol.level * 10 + 20;
    }

    setBasePower(tempBasePower);
  }, [symbols]);

  // Calculate the date in which the target power will be reached
  useLayoutEffect(() => {
    // Merge all symbol level up dates into one array and sort them
    const mergedDates = [];

    for (const symbol of graphSymbols) {
      for (const level of symbol.progress) {
        mergedDates.push(level.date);
      }
    }

    mergedDates.sort((a: string, b: string) => dayjs(a).diff(dayjs(b)));

    // Add 10 to the character's power until they reach the target power
    let tempDate = "";
    let tempPower = basePower;

    for (const date of mergedDates) {
      if (tempPower <= targetPower) {
        tempDate = date;
        tempPower += 10;
      }
    }

    setDateToPower(tempDate);
  }, [targetPower, basePower, graphSymbols]);

  // Calculate and store every symbol's date needed to reach future levels
  useLayoutEffect(() => {
    try {
      const tempGraphSymbols = symbols // ! THERES LAG PROLLY CAUSE OF ALL THE CALLS
        .filter(
          (currentSymbol) =>
            (currentSymbol.weekly || currentSymbol.daily) &&
            isValid(currentSymbol.level) &&
            isValid(currentSymbol.experience) &&
            (!swapped
              ? currentSymbol.type === "arcane"
              : currentSymbol.type === "sacred")
        )
        .map((currentSymbol) => {
          const progress = [];
          let days = 0;
          let count = 0;
          let resets = 0;
          let mondayReached = false;

          const dailySymbols = getDailySymbols(currentSymbol);

          for (
            let symbolLevel = 0;
            symbolLevel <= (!swapped ? 20 : 11);
            symbolLevel++
          ) {
            for (let i = 0; i < 1000; i++) {
              const remainingSymbols = getRemainingSymbols(
                symbolLevel,
                currentSymbol
              );

              if (
                days * dailySymbols + (currentSymbol.weekly ? resets * 45 : 0) <
                remainingSymbols
              ) {
                if (
                  mondayReached === false &&
                  dayjs().add(count, "day").isBefore(dayjs().day(8))
                ) {
                  count++;
                  if (dayjs().add(count, "day").isSame(dayjs().day(8))) {
                    mondayReached = true;
                  }
                } else if ((days - count) % 7 === 0) {
                  resets++;
                }
                days++;
              }
            }

            // Only push data for levels that have not yet been reached
            if (days > 0) {
              progress.push({
                level: symbolLevel,
                date: dayjs().add(days, "day").format("YYYY-MM-DD"),
              });
            }
          }

          return {
            name: currentSymbol.name,
            level: currentSymbol.level,
            progress,
          };
        });

      console.log(tempGraphSymbols);
      setGraphSymbols(tempGraphSymbols);
    } catch (e) {
      console.error(e);
      setGraphSymbols([]);
    }
  }, [symbols, swapped]);

  useEffect(() => {
    // Assuming graphSymbols is your state and setFinalSymbols is your state setter
    let tempPower = basePower;
    const maxPowerByDate = {};

    const graphSymbols2 = graphSymbols
      .flatMap((symbol) =>
        symbol.progress.map((entry) => ({
          name: symbol.name,
          level: symbol.level,
          entryLevel: entry.level,
          date: entry.date,
          power: 0,
        }))
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((entry) => {
        tempPower += 10;
        entry.power = tempPower;

        // Update the maximum power for the date
        maxPowerByDate[entry.date] = Math.max(
          maxPowerByDate[entry.date] || 0,
          entry.power
        );

        return entry;
      });

    const reduced = graphSymbols2.reduce((result, entry) => {
      // Only add entries with the highest power for each date
      if (entry.power === maxPowerByDate[entry.date]) {
        result.push(entry);
      }
      return result;
    }, []);

    // Add today's date and base power to the beginning of the graph
    reduced.unshift({
      date: dayjs().format("YYYY-MM-DD"),
      power: basePower,
    });

    setFinalSymbols(reduced);
    setNonReduced(graphSymbols2);
  }, [graphSymbols]);

  console.log("reduced", finalSymbols);
  console.log("non reduced", nonReduced);

  // Get the domain and tick numbers for the Y axis
  const getYAxisData = (option: string) => {
    let activeSymbols = 0;
    const ticks = [basePower];

    // Check how many symbols are currently enabled
    for (const symbol of graphSymbols) {
      if (symbol.level > 0) {
        activeSymbols++;
      }
    }

    // Set the ticks to multiples of 220 (power from max level symbol)
    for (let i = 1; i < activeSymbols + 1; i++) {
      if (basePower < i * 220) {
        ticks.push(i * 220);
      }
    }

    if (option === "domain") {
      return [basePower, activeSymbols * 220];
    } else if (option === "ticks") {
      return ticks;
    }
  };

  // Render the custom tooltip for the graph
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Get the list of symbol names
      const symbolNames = [...new Set(nonReduced.map((entry) => entry.name))];

      // Check if the entry is the first one (base power)
      const isFirstEntry = payload[0].value === basePower;

      return (
        <div className="flex flex-col bg-light p-4 space-y-1 rounded-lg">
          <p>{`${label}`}</p>
          <p className={`text-accent text-sm ${!isFirstEntry && "pb-2"}`}>
            Arcane Power : {payload[0].value}
          </p>
          {!isFirstEntry && <hr className="tooltip-divider pb-2" />}

          <div className="flex flex-col space-y-1">
            {symbolNames.map((symbolName) => {
              // Find the entry with the given name and date
              const symbolEntry = nonReduced.find(
                (entry) => entry.name === symbolName && entry.date === label
              );

              if (symbolEntry) {
                return (
                  // Display the previous and next level of the given entry, if the symbol leveled up
                  <div className="flex items-center space-x-1">
                    <p key={symbolName} className="text-sm text-tertiary">
                      {`${symbolName} : ${symbolEntry.entryLevel - 1}`}
                    </p>
                    <HiArrowSmRight fill="#8c8c8c" className="opacity-75" />
                    <p key={symbolName} className="text-sm text-tertiary">
                      {`${symbolEntry.entryLevel}`}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  // const getTargetPowerDate = () => {

  // }

  // Get the date or error message for the attainment date of the target power
  const getTargetPowerResponse = () => {
    let errorMessage = "";

    // If a valid target is provided, return the date
    if (dateToPower) return dateToPower;

    // Otherwise, return an error message
    if (isMobile) {
      errorMessage = targetPower === 0 ? "Enter a target power" : `Target must be over ${basePower}`
    } else {
      errorMessage = targetPower === 0 ? "Enter a target power" : `Target must be greater than ${basePower}`
    }

    return errorMessage;
  };

  /* ―――――――――――――――――――― Render Logic ――――――――――――――――――― */ // !! check firefox

  return (
    <section className="levels">
      <div className="flex justify-center items-center bg-gradient-to-t from-card to-card-grad rounded-lg p-10 mt-16 tablet:mt-28 w-[350px] tablet:w-[700px] laptop:w-[1050px]">
        <div className="flex flex-col items-center w-[350px] tablet:w-[700px] laptop:w-[1050px]">
          <div className={`flex flex-col tablet:flex-row text-center tablet:space-x-8 ${isMobile && "space-y-2"}`} /* Bug. Spacing weird if this is put in responsively with Tailwind.*/ >
            <div className="flex flex-col justify-center items-center bg-dark rounded-lg mb-2 py-4 px-6 laptop:px-8">
              <p>Arcane Power</p>
              <p className="text-accent laptop:text-lg pt-2.5">{basePower} / 1320</p>
            </div>

            <div className="flex flex-col justify-center items-center bg-dark rounded-lg mb-2 py-4 px-6 laptop:px-8">
              <div className="flex items-center space-x-3 tablet:space-x-3 pb-2.5">
                <p>{isMobile ? "Target Arcane Power" : "When will"}</p>
                <input
                  type="number"
                  className="power-input h-[30px] w-[65px]"
                  placeholder="Target"
                  onChange={(e) => setTargetPower(Number(e.target.value))}
                ></input>
                <p className={isMobile ? "hidden" : "block"}>arcane power be reached?</p>
              </div>
              <div className="flex space-x-1.5">
              <p className={(isMobile && targetPower >= basePower) ? "block" : "hidden"}>Attainment Date: </p>
              <p className="text-accent laptop:text-lg">
                {getTargetPowerResponse()}
              </p>
              </div>
            </div>
          </div>

          <hr className="horizontal-divider" />

          <LineChart
            width={isMobile ? 300 : isTablet ? 600 : 950}
            height={isMobile ? 300 : 450}
            data={finalSymbols}
            margin={{ top: 15, right: 50 }}
            className="text-xl"
          >
            <Tooltip
              cursor={{ stroke: "#8c8c8c", strokeWidth: 1.5 }}
              content={<CustomTooltip />}
            />
            <Line
              type="monotone"
              dataKey="power"
              name="Arcane Power"
              stroke="#b18bd0"
              strokeWidth={1.5}
              dot={{
                stroke: "#b18bd0",
                r: isMobile ? 2 : isTablet ? 2.5 : 3,
                fill: "#b18bd0",
              }}
              activeDot={{ stroke: "#b18bd0", strokeWidth: 10, r: 1 }}
            />
            <XAxis
              dataKey="date"
              tickMargin={10}
              minTickGap={15}
              stroke="#8c8c8c"
              padding={{ left: 0 }}
            />
            <YAxis
              dataKey="power"
              tickMargin={10}
              stroke="#8c8c8c"
              domain={getYAxisData("domain")}
              ticks={getYAxisData("ticks")}
            />
          </LineChart>
        </div>
      </div>
    </section>
  );
};

export default Graph;
