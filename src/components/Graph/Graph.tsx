import { useEffect, useLayoutEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  TooltipProps,
} from "recharts";
import {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent'
import { useMediaQuery } from "react-responsive";
import { HiArrowSmRight } from "react-icons/hi";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip/Tooltip";
import { isValid, getRemainingSymbols, getDailySymbols } from "../../lib/utils";

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

import "./Graph.css";

type Props = {
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
};

type DateSymbols = {
  name: string;
  level: number;
  progress: [{ level: number; date: string }];
};

type GraphSymbols = {
  name: string;
  level: number;
  entryLevel: number;
  date: string;
  power: number;
};

type UnmergedSymbols = GraphSymbols;

const Graph = ({ symbols, swapped }: Props) => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  const isMobile = useMediaQuery({ query: `(max-width: 799px)` });
  const isTablet = useMediaQuery({ query: `(max-width: 1149px)` });

  const [dateSymbols, setDateSymbols] = useState<DateSymbols[]>([]);
  const [graphSymbols, setGraphSymbols] = useState<GraphSymbols[]>([]);
  const [unmergedSymbols, setUnmergedSymbols] = useState<UnmergedSymbols[]>([]);
  const [currentPower, setCurrentPower] = useState(NaN);
  const [targetPower, setTargetPower] = useState(NaN);
  const [dateToPower, setDateToPower] = useState("");

  const symbolNames = [...new Set(graphSymbols.map((entry) => entry.name))];
  const enabledSymbols = symbols.filter((symbol) => symbol.level > 0).length;
  const maxPower = graphSymbols[graphSymbols.length - 1]?.power;

  /* ―――――――――――――――――――― Functions ―――――――――――――――――――――― */

  // Calculate the base arcane power of the character
  useEffect(() => {
    let tempCurrentPower = 0;

    for (const symbol of symbols) {
      if (!isValid(symbol.level)) continue;
      tempCurrentPower += symbol.level * 10 + 20;
    }

    setCurrentPower(tempCurrentPower);
  }, [symbols]);

  // Calculate the date in which the target power will be reached
  useLayoutEffect(() => {
    // Merge all symbol level up dates into one array and sort them
    const mergedDates = [];

    for (const symbol of dateSymbols) {
      for (const level of symbol.progress) {
        mergedDates.push(level.date);
      }
    }

    mergedDates.sort((a: string, b: string) => dayjs(a).diff(dayjs(b)));

    // Add 10 to the character's power until they reach the target power
    let tempDate = "";
    let tempPower = currentPower;

    for (const date of mergedDates) {
      if (tempPower < targetPower) {
        tempDate = date;
        tempPower += 10;
      }
    }

    setDateToPower(tempDate);
  }, [targetPower, currentPower, dateSymbols]);

  // Calculate and store every symbol's date needed to reach future levels
  useLayoutEffect(() => {
    try {
      const tempDateSymbols = symbols // ! THERES LAG PROLLY CAUSE OF ALL THE CALLS
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

      console.log(tempDateSymbols);
      setDateSymbols(tempDateSymbols);
    } catch (e) {
      console.error(e);
      setDateSymbols([]);
    }
  }, [symbols, swapped]);

  useEffect(() => {
    // Assuming dateSymbols is your state and setGraphSymbols is your state setter
    let tempPower = currentPower;
    const maxPowerByDate = {};

    const dateSymbols2 = dateSymbols
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

    const reduced = dateSymbols2.reduce((result, entry) => {
      // Only add entries with the highest power for each date
      if (entry.power === maxPowerByDate[entry.date]) {
        result.push(entry);
      }
      return result;
    }, []);

    // Add today's date and base power to the beginning of the graph
    reduced.unshift({
      date: dayjs().format("YYYY-MM-DD"),
      power: currentPower,
    });

    setUnmergedSymbols(dateSymbols2);
    setGraphSymbols(reduced);
  }, [dateSymbols]);

  console.log("graphSymbols", graphSymbols);

  // Render the custom tooltip for the graph
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      // Check if the entry is the first one (base power)
      const isFirstEntry = payload[0].value === currentPower;

      return (
        <div className="flex flex-col bg-light rounded-lg space-y-1 p-4">
          <p>{`${label}`}</p>
          <p className={`text-accent text-sm ${!isFirstEntry && "pb-2"}`}>
            Arcane Power : {payload[0].value}
          </p>
          {!isFirstEntry && <hr className="tooltip-divider" />}

          <div className="flex flex-col space-y-1">
            {symbolNames.map((symbolName) => {
              // Find the entry with the given name and date
              const symbolEntry = unmergedSymbols.find(
                (entry) => entry.name === symbolName && entry.date === label
              );

              if (!isValid(symbolEntry?.entryLevel as number)) return;

              return (
                // Display the previous and next level of the given entry, if the symbol leveled up
                <div
                  key={symbolName}
                  className="flex items-center text-tertiary space-x-1"
                >
                  <p className="text-sm">{`${symbolName} : ${
                    symbolEntry?.entryLevel ?? 0 - 1
                  }`}</p>
                  <HiArrowSmRight fill="#8c8c8c" className="opacity-75" />
                  <p className="text-sm">{`${symbolEntry?.entryLevel ?? 0}`}</p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  // Generate 4 evenly spaced ticks for the Y axis
  const getYAxisTicks = () => {
    const ticks = [currentPower];

    for (let i = 1; i < 3; i++) {
      ticks.push(
        Math.round((currentPower + (i * (maxPower - currentPower)) / 3) / 10) *
          10
      );
    }

    ticks.push(maxPower);

    return ticks;
  };

  // Validate the provided target power
  const getTargetPowerDate = (target: string) => {
    // If target is less than max power, set the value to target
    if (Number(target) <= maxPower) {
      setTargetPower(parseInt(target));
    }

    // If target is greater than max power, set the value to max power
    if (Number(target) >= maxPower) {
      setTargetPower(maxPower);
    }

    // If no target, set it to NaN instead of default 0
    if (Number(target) < 0) {
      setTargetPower(NaN);
    }

    // If target is 0, set it to 1
    if (target === "0") {
      setTargetPower(1);
    }
  };

  // Get the date or error message for the attainment date of the target power
  const getTargetPowerResponse = () => {
    // If a valid target is provided, return the date
    if (dateToPower) return dateToPower;

    // Otherwise, return an error message
    return !isValid(targetPower)
      ? "Enter a target power"
      : `Target must
      ${isMobile ? " be over" : " be greater than"} ${currentPower}`;
  };

  /* ―――――――――――――――――――― Render Logic ――――――――――――――――――― */ // !! Test on Firefox

  return (
    <section className="levels">
      <div className="flex justify-center items-center bg-gradient-to-t from-card to-card-grad rounded-lg p-10 mt-16 tablet:mt-28 w-[350px] tablet:w-[700px] laptop:w-[1050px]">
        <div className="flex flex-col items-center w-[350px] tablet:w-[700px] laptop:w-[1050px]">
          <div
            className={`flex flex-col tablet:flex-row text-center tablet:space-x-8 ${
              isMobile && "space-y-2"
            }`} /* Bug. Spacing weird if this is put in responsively with Tailwind.*/
          >
            <div className="flex flex-col justify-center items-center bg-dark rounded-lg mb-2 py-4 px-6 laptop:px-8">
              <p>Arcane Power</p>
              <p className="text-accent laptop:text-lg pt-2.5">
                {currentPower} / {enabledSymbols * 220}
              </p>
            </div>

            <div className="flex flex-col justify-center items-center bg-dark rounded-lg mb-2 py-4 px-6 laptop:px-8">
              <div className="flex items-center space-x-3 tablet:space-x-3 pb-2.5">
                <p>{isMobile ? "Target Arcane Power" : "When will"}</p>
                <Tooltip>
                  <TooltipTrigger asChild={true}>
                    <input
                      type="number"
                      className="power-input h-[30px] w-[65px]"
                      placeholder="Target"
                      value={targetPower}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => getTargetPowerDate(e.target.value)}
                    ></input>
                  </TooltipTrigger>
                  <TooltipContent className="tooltip">
                    Calculate the date you'll <br></br>achieve the{" "}
                    <span>specified power</span>
                  </TooltipContent>
                </Tooltip>
                <p className={isMobile ? "hidden" : "block"}>
                  arcane power be reached?
                </p>
              </div>
              <div className="flex space-x-1.5">
                <p
                  className={
                    isMobile && targetPower >= currentPower ? "block" : "hidden"
                  }
                >
                  Attainment Date:{" "}
                </p>
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
            data={graphSymbols}
            margin={{ top: 15, right: 50 }}
            className="text-xl"
          >
            <RechartsTooltip
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
              domain={[currentPower, maxPower]}
              ticks={getYAxisTicks()}
            />
          </LineChart>
        </div>
      </div>
    </section>
  );
};

export default Graph;
