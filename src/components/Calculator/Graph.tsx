import { useEffect, useLayoutEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  TooltipProps,
  ResponsiveContainer,
} from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { useMediaQuery } from "react-responsive";
import { FaArrowRight } from "react-icons/fa6";

import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { isValid, getRemainingSymbols, getDailySymbols, cn } from "../../lib/utils";
import { usePower } from "../../hooks/usePower";

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

import RadioButton from "../RadioButton";

type Props = {
  symbols: [
    {
      name: string;
      img: string;
      alt: string;
      type: string;
      level: number;
      extra: boolean;
      daily: boolean;
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
  date: string | number;
  power: number;
};

type FlatDateSymbols = GraphSymbols;

const Graph = ({ symbols, swapped }: Props) => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });
  const isTablet = useMediaQuery({ query: `(max-width: 1149px)` });

  const [dateSymbols, setDateSymbols] = useState<DateSymbols[]>([]);
  const [graphSymbols, setGraphSymbols] = useState<GraphSymbols[]>([]);
  const [flatDateSymbols, setFlatDateSymbols] = useState<FlatDateSymbols[]>([]);
  const [maxPower, setMaxPower] = useState(NaN);
  const [maxDays, setMaxDays] = useState(NaN);
  const [targetPower, setTargetPower] = useState(NaN);
  const [dateToPower, setDateToPower] = useState("");
  const [yAxisTicks, setYAxisTicks] = useState<number[]>([]);
  const [xAxisTicks, setXAxisTicks] = useState<number[]>([]);
  const [graphDynamic, setGraphDynamic] = useState(true);

  const enabledSymbols = symbols.filter(
    (symbol) =>
      symbol.level > 0 &&
      (!swapped ? symbol.type === "arcane" : symbol.type === "sacred")
  ).length;

  /* ―――――――――――――――――――― Functions ―――――――――――――――――――――― */

  // Calculate the base power of the character
  const currentPower = usePower(symbols, swapped);

  // Calculate and store every symbol's date needed to reach future levels
  useLayoutEffect(() => {
    try {
      const tempDateSymbols = symbols
        .filter(
          // Only use symbols that have a valid level/exp/quest
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
          let dailyResets = 0;
          let weeklyResets = 0;
          let mondayReached = false;

          // Get the daily symbol count of the symbol
          const dailySymbols = getDailySymbols(currentSymbol);

          // Loop through the next symbol levels
          for (
            let nextLevel = currentSymbol.level + 1;
            nextLevel <= (!swapped ? 20 : 11);
            nextLevel++
          ) {
            // Get the symobls needed to get from the current iterated level to the next level
            const remainingSymbols = getRemainingSymbols(
              nextLevel,
              currentSymbol
            );

            // Calculate the number of days needed to reach the level (up to 1000 days, but the loop will break before then)
            for (let i = 0; i <= 1000; i++) {
              while (
                days * dailySymbols +
                  (currentSymbol.weekly ? weeklyResets * 45 : 0) <
                remainingSymbols
              ) {
                // If the day isn't a monday, add 1 day
                if (
                  mondayReached === false &&
                  dayjs().add(dailyResets, "day").isBefore(dayjs().day(8))
                ) {
                  dailyResets++;
                  // If the day is a monday, set the flag to true
                  if (dayjs().add(dailyResets, "day").isSame(dayjs().day(8))) {
                    mondayReached = true;
                  }
                } else if ((days - dailyResets) % 7 === 0) {
                  // If the monday flag is true, increment weeklyResets (adds 45 symbols)
                  weeklyResets++;
                }
                days++;
              }
            }

            // Store the dates needed to reach the next levels
            progress.push({
              level: nextLevel,
              date: dayjs().add(days, "day").format("YYYY-MM-DD"),
            });
          }

          // Return the new tempDateSymbols object
          return {
            name: currentSymbol.name,
            level: currentSymbol.level,
            progress: progress,
          };
        });

      setDateSymbols(tempDateSymbols as DateSymbols[]);
    } catch (e) {
      console.error(e);
      setDateSymbols([]);
    }
  }, [symbols, swapped, graphDynamic]);

  // Get and store the individual entries for the graph
  useLayoutEffect(() => {
    let tempPower = currentPower;
    const maxPowerByDate: Record<string, number> = {};

    // Create a flat (merged) version of the dateSymbols array.
    const tempFlatDateSymbols = dateSymbols
      .flatMap((symbol) =>
        symbol.progress.map((entry) => {
          // Find the difference of days between today and the entry date (days).
          // If they both land on today, make sure it's set to 0 and not 1
          const diffDays = dayjs().isSameOrAfter(entry.date, "day")
            ? 0
            : dayjs(entry.date).diff(dayjs(), "day") + 1;

          return {
            name: symbol.name,
            level: symbol.level,
            entryLevel: entry.level,
            date: graphDynamic ? diffDays : entry.date,
            power: NaN,
          };
        })
      )
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
      // If there is more than one entry on the same date, merge them and combine the power gain (+10)
      .map((entry) => {
        tempPower += 10;
        entry.power = tempPower;

        // Update the maximum power for the specific date
        maxPowerByDate[entry.date] = Math.max(
          maxPowerByDate[entry.date] || 0,
          entry.power
        );

        return entry;
      });

    // Create a new array with only entries with the highest power for each date
    const tempGraphSymbols = tempFlatDateSymbols.reduce(
      (result: GraphSymbols[], entry) => {
        if (entry.power === maxPowerByDate[entry.date]) {
          result.push(entry);
        }
        return result;
      },
      []
    );

    // Add today's date and base power to the beginning of the graph
    tempGraphSymbols.unshift({
      name: "",
      level: NaN,
      entryLevel: NaN,
      date: graphDynamic ? 0 : dayjs().format("YYYY-MM-DD"),
      power: currentPower,
    });

    setFlatDateSymbols(tempFlatDateSymbols);
    setGraphSymbols(tempGraphSymbols);
    setMaxPower(tempGraphSymbols[tempGraphSymbols.length - 1]?.power);
    setMaxDays(tempGraphSymbols[tempGraphSymbols.length - 1]?.date as number);
  }, [dateSymbols]);

  // Render the custom tooltip for the graph
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    // If props do not exist, return null
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    // Check if the entry is the first one (for base power)
    const isFirstEntry = payload[0].value === currentPower;

    return (
      <div
        className={`flex flex-col ${
          isMobile ? "bg-light/90" : "bg-light"
        } rounded-lg space-y-1 p-4`}
      >
        <p className={isMobile ? "text-sm" : ""}>{`${
          graphDynamic
            ? dayjs()
                .add(label as number, "day")
                .format("YYYY-MM-DD")
            : label
        }`}</p>
        <p
          className={`text-accent ${isMobile ? "text-xs" : "text-sm"} ${
            !isFirstEntry && "pb-2"
          }`}
        >
          {!swapped ? "Arcane" : "Sacred"} Power : {payload[0].value}
        </p>
        {!isFirstEntry && <hr className="opacity-20 pb-2 my-8 w-full" />}

        <div className="flex flex-col space-y-1">
          {symbols
            .filter((symbol) => symbol.level > 0)
            .map((symbol) => {
              // Find all entries with the given name and date
              const symbolEntries = flatDateSymbols.filter(
                (entry) => entry.name === symbol.name && entry.date === label
              );

              if (symbolEntries.length === 0 || isFirstEntry) return;

              // Increment the final level if the symbol leveled up more than once on the same day
              const occurrences = symbolEntries.length - 1;

              // Check if the entry is the second one (for upgrade message)
              const isSecondEntry =
                label === (graphDynamic ? 0 : dayjs().format("YYYY-MM-DD"));

              // If the symbol is ready to upgrade
              const upgradeReady =
                symbol.experience >= symbol.symbolsRequired[symbol.level];

              return (
                <div key={symbol.name} className="flex flex-col text-tertiary">
                  <div className="flex items-center space-x-1.5">
                    <p className={isMobile ? "text-xs" : "text-sm"}>{`${
                      symbol.name
                    } : ${symbolEntries[0].entryLevel - 1}`}</p>
                    <FaArrowRight
                      size={isMobile ? 10 : 12}
                      fill="#8c8c8c"
                      className="opacity-75"
                    />
                    <p className={isMobile ? "text-xs" : "text-sm"}>{`${
                      symbolEntries[0].entryLevel + occurrences
                    }`}</p>
                  </div>
                  <p className="text-xs text-accent/75">
                    {isSecondEntry && upgradeReady && "Ready for upgrade"}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  // Generate 4 evenly spaced ticks for the Y axis
  useEffect(() => {
    if (
      !isValid(currentPower) ||
      !isValid(maxPower) ||
      currentPower === 0 ||
      maxPower === 0
    ) {
      setYAxisTicks([]);
    }

    const ticks = [currentPower];

    for (let i = 1; i < 3; i++) {
      ticks.push(
        Math.round((currentPower + (i * (maxPower - currentPower)) / 3) / 10) *
          10
      );
    }

    ticks.push(maxPower);

    if (ticks[0] !== ticks[2]) {
      // ! Bandaid bug fix | ticks[1] sacred would be stuck in middle of Y axis (arcane)
      setYAxisTicks(ticks);
    } else {
      setYAxisTicks([]);
    }
  }, [graphSymbols]);

  // Generate 7 evenly spaced ticks for the X axis
  useLayoutEffect(() => {
    if (
      !isValid(currentPower) ||
      !isValid(maxPower) ||
      currentPower === 0 ||
      maxPower === 0
    ) {
      setXAxisTicks([]);
    }

    const ticks = [0];

    for (let i = 1; i < 7; i++) {
      ticks.push(Math.ceil((i * maxDays) / 7));
    }

    ticks.push(maxDays);

    if (ticks[0] !== ticks[2] && graphDynamic) {
      // ! Bandaid bug fix | ticks[1] sacred would be stuck in middle of Y axis (arcane)
      setXAxisTicks(ticks);
    } else {
      setXAxisTicks([]);
    }
  }, [graphSymbols]);

  // Validate the specified target power
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

  // Get the date in which the target power will be reached
  useLayoutEffect(() => {
    // Additional checks. If currentPower is changed, make sure the date is updated accordingly
    if (Math.ceil(targetPower / 10) * 10 <= currentPower) {
      setDateToPower("");
      return;
    }

    // Find the first graphSymbol entry that matches or is closest to the specified power
    let tempDateToPower = graphSymbols.find(
      (entry) => entry.power >= Math.ceil(targetPower / 10) * 10
    )?.date;

    if (graphDynamic) {
      tempDateToPower = dayjs()
        .add(tempDateToPower as number, "day")
        .format("YYYY-MM-DD");
    }

    if (dayjs(tempDateToPower).isValid()) {
      setDateToPower(tempDateToPower as string);
    }
  }, [currentPower, targetPower, graphSymbols]);

  // Get the date or error message for the attainment date of the target power
  const getTargetPowerResponse = () => {
    // If a valid target is specified, return the date
    if (dateToPower) return dateToPower;

    // Otherwise, return an error message
    return !isValid(targetPower)
      ? "Enter a target power"
      : isMobile
      ? "Target power too low"
      : `Target must
      ${isMobile ? " be over" : " be greater than"} ${currentPower}`;
  };

  // Reset targetPower if symbols are swapped
  useEffect(() => {
    setTargetPower(NaN);
  }, [swapped]);

  // Reset targetPower if symbols are disabled
  useEffect(() => {
    if (currentPower === 0) {
      setTargetPower(NaN);
    }
  }, [currentPower]);

  // Format the X axis (change from days to date)
  const formatXAxis = (tick: number) => {
    return dayjs().add(tick, "day").format("YYYY-MM-DD");
  };

  /* ―――――――――――――――――――― Render Logic ――――――――――――――――――― */

  return (
    <section className="flex justify-center">
      <div className="flex flex-col justify-center items-center bg-gradient-to-t from-card to-card-grad rounded-lg px-8 md:px-10 py-8 md:py-10 mt-16 md:mt-28 mx-4 md:mx-8 w-[360px] md:w-full max-w-[1050px]">
        {/* POWER OVERVIEW */}
        <div className="flex flex-col md:flex-row justify-center md:space-x-8 gap-4 md:gap-0 w-full">
          <div className="flex md:flex-col justify-between md:justify-center items-center bg-dark rounded-lg gap-3 py-4 px-8">
            <p className="text-sm md:text-base">
              {!swapped ? "Arcane" : "Sacred"} Power
            </p>
            <p className="text-sm md:text-base text-accent">
              {currentPower} / {enabledSymbols * (!swapped ? 220 : 110)}
            </p>
          </div>

          {/* TARGET POWER */}
          <div className="flex flex-col justify-center items-center bg-dark rounded-lg gap-3 py-4 px-8 w-full max-w-[325px]">
            <div className="flex justify-between items-center w-full">
              <p className="text-sm md:text-base">
                {isMobile
                  ? `Target Power`
                  : !swapped
                  ? "Target Arcane Power"
                  : "Target Sacred Power"}
              </p>
              <Tooltip>
                <TooltipTrigger asChild={true}>
                  <input
                    type="number"
                    className={cn(
                      "bg-secondary text-secondary hover:text-primary text-center text-sm tracking-wider hover:bg-hover focus:bg-hover focus:text-primary outline-none focus:outline-none transition-colors h-[25px] md:h-[30px] w-[65px]",
                      graphSymbols.length === 1 &&
                        "opacity-25 pointer-events-none select-none"
                    )}
                    placeholder="Target"
                    value={targetPower}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => getTargetPowerDate(e.target.value)}
                    tabIndex={graphSymbols.length === 1 ? -1 : 0}
                  />
                </TooltipTrigger>
                <TooltipContent className="tooltip">
                  Calculate the date you'll <br></br>achieve the{" "}
                  <span>specified power</span>
                </TooltipContent>
              </Tooltip>
            </div>
            <div
              className={cn(
                "flex justify-between w-full",
                (!targetPower || targetPower < currentPower) &&
                  !isMobile &&
                  "justify-center"
              )}
            >
              <p className="text-sm md:hidden">Date:</p>
              <p
                className={
                  !isMobile && targetPower > currentPower ? "block" : "hidden"
                }
              >
                Attainment Date:{" "}
              </p>
              <p className="text-sm md:text-base text-accent">
                {getTargetPowerResponse()}
              </p>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <hr className="opacity-10 my-8 h-px w-full" />

        {/* RADIO BUTTONS */}
        <div className="flex space-x-[75px] md:space-x-32 pb-6 md:pb-4">
          <Tooltip>
            <TooltipTrigger asChild={true}>
              {" "}
              <RadioButton
                label="Dynamic"
                selected={graphDynamic}
                value={true}
                setValue={setGraphDynamic}
              />
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              X-axis points will have <span>dynamic</span>
              <br></br> spacing based on <span>dates</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild={true}>
              {" "}
              <RadioButton
                label="Linear"
                selected={!graphDynamic}
                value={false}
                setValue={setGraphDynamic}
              />
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              X-axis points will have <span>consistent</span> spacing
            </TooltipContent>
          </Tooltip>
        </div>

        {/* GRAPH */}
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 450}>
          <LineChart
            data={graphSymbols}
            margin={{
              top: 15,
              right: isMobile ? 12 : 50,
              left: isMobile ? -12 : 0,
            }}
          >
            <RechartsTooltip
              cursor={{ stroke: "#8c8c8c", strokeWidth: 1.5 }}
              content={<CustomTooltip />}
            />
            <Line
              type="linear"
              isAnimationActive={false}
              dataKey="power"
              name={`${!swapped ? "Arcane" : "Sacred"} Power`}
              stroke="#b18bd0"
              strokeWidth={1.5}
              dot={{
                stroke: "#b18bd0",
                r: isMobile ? 1.75 : isTablet ? 2.5 : 3,
                fill: "#b18bd0",
              }}
              activeDot={{
                stroke: "#b18bd0",
                strokeWidth: isMobile ? 7.5 : 10,
                r: 1,
              }}
            />
            <XAxis
              dataKey="date"
              type={graphDynamic ? "number" : "category"}
              tickMargin={isMobile ? 5 : 10}
              minTickGap={isMobile ? 50 : 35}
              domain={[
                (min: number) => {
                  if (isFinite(min)) {
                    return 0;
                  } else {
                    return 0;
                  }
                },
                (max: number) => {
                  if (isFinite(max)) {
                    return maxDays;
                  } else {
                    return 1;
                  }
                },
              ]}
              stroke="#8c8c8c"
              tickCount={graphDynamic ? 10 : undefined}
              ticks={graphDynamic ? xAxisTicks : undefined}
              tick={{ fontSize: !isMobile ? 16 : 12 }}
              tickFormatter={
                graphDynamic ? (tick) => formatXAxis(tick) : undefined
              }
            />
            <YAxis
              dataKey="power"
              tickMargin={isMobile ? 5 : 10}
              stroke="#8c8c8c"
              domain={[currentPower, maxPower]}
              ticks={yAxisTicks}
              tick={{ fontSize: !isMobile ? 16 : 12 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default Graph;
