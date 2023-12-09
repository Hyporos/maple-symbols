import { useEffect, useMemo, useState } from "react";
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
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "./Graph.css";
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

  const [graphSymbols, setGraphSymbols] = useState<GraphSymbols[]>([]);
  const [finalSymbols, setFinalSymbols] = useState([]);
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
  useEffect(() => {
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
  useMemo(() => {
    try {
      const tempGraphSymbols = symbols
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
      })
      .reduce((result, entry) => {
        // Only add entries with the highest power for each date
        if (entry.power === maxPowerByDate[entry.date]) {
          result.push(entry);
        }
        return result;
      }, []);

    setFinalSymbols(graphSymbols2);
  }, [graphSymbols]);

  console.log(finalSymbols);

  // Get the domain and tick numbers for the Y axis
  const getYAxisData = (option: string) => {
    let activeSymbols = 0;
    const ticks = [];

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

  /* ―――――――――――――――――――― Render Logic ――――――――――――――――――― */

  return (
    <section className="levels">
      <div className="flex justify-center items-center bg-gradient-to-t from-card to-card-grad rounded-lg w-[350px] tablet:w-[700px] laptop:w-[1050px] p-10 mt-16 tablet:mt-28">
        <div className="flex flex-col w-[350px] tablet:w-[700px] laptop:w-[1050px] items-center">
          <div className="flex space-x-8">
            <div className="flex flex-col justify-center items-center mb-4 bg-dark py-4 px-8 rounded-xl">
              <div className="flex items-center space-x-4 pb-2.5">
                <p>Base Arcane Power</p>
              </div>
              <p className="text-accent text-xl">{basePower} / 1320</p>
            </div>
            <div className="flex flex-col justify-center items-center mb-4 bg-dark py-4 px-8 rounded-xl">
              <div className="flex items-center space-x-4 pb-2.5">
                <p>When will</p>
                <input
                  type="number"
                  className="power-input h-[30px] w-[65px]"
                  placeholder="Target"
                  onChange={(e) => setTargetPower(Number(e.target.value))}
                ></input>
                <p>arcane power be reached?</p>
              </div>
              <p className="text-accent text-xl">
                {dateToPower || "Enter a target power"}
              </p>
            </div>
          </div>
          <hr className="horizontal-divider" />
          <LineChart
            width={950}
            height={450}
            data={finalSymbols}
            margin={{ top: 15, right: 50 }}
          >
            <Line
              type="monotone"
              dataKey="power"
              name="Arcane Power"
              stroke="#b18bd0"
              strokeWidth={1.5}
              dot={{ stroke: "#b18bd0", strokeWidth: 1.5, fill: "#b18bd0" }}
              activeDot={{ stroke: "#8c8c8c", strokeWidth: 10, r: 1 }}
            />
            <XAxis dataKey="date" tickMargin={10} stroke="#8c8c8c" />
            <YAxis
              dataKey="power"
              tickMargin={10}
              stroke="#8c8c8c"
              domain={getYAxisData("domain")}
              ticks={getYAxisData("ticks")}
            />
            <Tooltip
              cursor={{ stroke: "#8c8c8c", strokeWidth: 1.5 }}
              contentStyle={{ background: "#262626", borderColor: "#262626" }}
            />
          </LineChart>
        </div>
      </div>
    </section>
  );
};

export default Graph;
