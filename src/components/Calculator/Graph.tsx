import { useEffect, useState, useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  TooltipContentProps,
  ResponsiveContainer,
} from "recharts";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { FaArrowRight } from "react-icons/fa6";

import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import {
  isValid,
  getRemainingSymbols,
  getDailySymbols,
  cn,
  advanceDayCount,
  INITIAL_DAY_COUNT,
} from "../../lib/utils";
import { usePower } from "../../hooks/usePower";
import { dayjs } from "../../lib/dayjs";
import RadioButton from "../ui/RadioButton";
import { useAppStore } from "../../state/store";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import type { SymbolData } from "../../lib/types";

type DateSymbols = {
  name: string;
  level: number;
  progress: Array<{ level: number; date: string }>;
};

type GraphSymbols = {
  name: string;
  level: number;
  entryLevel: number;
  date: string | number;
  power: number;
};

interface CustomTooltipProps extends TooltipContentProps<ValueType, NameType> {
  currentPower: number;
  isMobile: boolean;
  graphDynamic: boolean;
  swapped: boolean;
  symbols: SymbolData[];
  flatDateSymbols: GraphSymbols[];
}

// Defined outside Graph so the function reference is stable across re-renders,
// preventing Recharts from unmounting and remounting the tooltip.
const CustomTooltip = ({
  active,
  payload,
  label,
  currentPower,
  isMobile,
  graphDynamic,
  swapped,
  symbols,
  flatDateSymbols,
}: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Check if the entry is the first one (for base power)
  const isFirstEntry = payload[0].value === currentPower;

  return (
    <div
      className={`flex flex-col ${isMobile ? "bg-light/90" : "bg-light"} space-y-1 rounded-lg p-4`}
    >
      <p className={isMobile ? "text-sm" : ""}>{`${
        graphDynamic
          ? dayjs()
              .add(label as number, "day")
              .format("YYYY-MM-DD")
          : label
      }`}</p>
      <p className={`text-accent ${isMobile ? "text-xs" : "text-sm"} ${!isFirstEntry && "pb-2"}`}>
        {!swapped ? "Arcane" : "Sacred"} Power : {payload[0].value}
      </p>
      {!isFirstEntry && <hr className="my-8 w-full pb-2 opacity-20" />}

      <div className="flex flex-col space-y-1">
        {symbols
          .filter((symbol) => symbol.level > 0)
          .map((symbol) => {
            const symbolEntries = flatDateSymbols.filter(
              (entry) => entry.name === symbol.name && entry.date === label
            );

            if (symbolEntries.length === 0 || isFirstEntry) return;

            const occurrences = symbolEntries.length - 1;

            const isSecondEntry = label === (graphDynamic ? 0 : dayjs().format("YYYY-MM-DD"));

            const upgradeReady = symbol.experience >= symbol.symbolsRequired[symbol.level];

            return (
              <div key={symbol.name} className="flex flex-col text-tertiary">
                <div className="flex items-center space-x-1.5">
                  <p className={isMobile ? "text-xs" : "text-sm"}>{`${
                    symbol.name
                  } : ${symbolEntries[0].entryLevel - 1}`}</p>
                  <FaArrowRight size={isMobile ? 10 : 12} fill="#8c8c8c" className="opacity-75" />
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

const Graph = () => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  const symbols = useAppStore((s) => s.symbols);
  const swapped = useAppStore((s) => s.swapped);

  const { isMobile, isTablet } = useBreakpoint();

  const [targetPower, setTargetPower] = useState(NaN);
  const [graphDynamic, setGraphDynamic] = useState(true);

  const enabledSymbols = symbols.filter(
    (symbol) => symbol.level > 0 && (!swapped ? symbol.type === "arcane" : symbol.type === "sacred")
  ).length;

  /* ―――――――――――――――――――― Functions ―――――――――――――――――――――― */

  // Calculate the base power of the character
  const currentPower = usePower(symbols, swapped);

  // Calculate every symbol's date needed to reach future levels
  const dateSymbols = useMemo((): DateSymbols[] => {
    try {
      return symbols
        .filter(
          // Only use symbols that have a valid level/exp/quest
          (currentSymbol) =>
            (currentSymbol.weekly || currentSymbol.daily) &&
            isValid(currentSymbol.level) &&
            isValid(currentSymbol.experience) &&
            (!swapped ? currentSymbol.type === "arcane" : currentSymbol.type === "sacred")
        )
        .map((currentSymbol) => {
          const progress = [];
          let dayState = INITIAL_DAY_COUNT;

          // Get the daily symbol count of the symbol
          const dailySymbols = getDailySymbols(currentSymbol);

          // Loop through the next symbol levels
          for (
            let nextLevel = currentSymbol.level + 1;
            nextLevel <= (!swapped ? 20 : 11);
            nextLevel++
          ) {
            // Get the symbols needed to get from the current iterated level to the next level
            const remainingSymbols = getRemainingSymbols(nextLevel, currentSymbol);

            // Advance the shared day-count state to the point where this level is reached
            dayState = advanceDayCount(
              dayState,
              remainingSymbols,
              dailySymbols,
              !!currentSymbol.weekly
            );

            // Store the dates needed to reach the next levels
            progress.push({
              level: nextLevel,
              date: dayjs().add(dayState.days, "day").format("YYYY-MM-DD"),
            });
          }

          // Return the new tempDateSymbols object
          return {
            name: currentSymbol.name,
            level: currentSymbol.level,
            progress: progress,
          };
        }) as DateSymbols[];
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [symbols, swapped]);

  // Derive graph entries from dateSymbols
  const { graphSymbols, flatDateSymbols, maxPower, maxDays } = useMemo(() => {
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
        maxPowerByDate[entry.date] = Math.max(maxPowerByDate[entry.date] || 0, entry.power);

        return entry;
      });

    // Create a new array with only entries with the highest power for each date
    const tempGraphSymbols = tempFlatDateSymbols.reduce((result: GraphSymbols[], entry) => {
      if (entry.power === maxPowerByDate[entry.date]) {
        result.push(entry);
      }
      return result;
    }, []);

    // Add today's date and base power to the beginning of the graph
    tempGraphSymbols.unshift({
      name: "",
      level: NaN,
      entryLevel: NaN,
      date: graphDynamic ? 0 : dayjs().format("YYYY-MM-DD"),
      power: currentPower,
    });

    return {
      flatDateSymbols: tempFlatDateSymbols,
      graphSymbols: tempGraphSymbols,
      maxPower: tempGraphSymbols[tempGraphSymbols.length - 1]?.power ?? NaN,
      maxDays: (tempGraphSymbols[tempGraphSymbols.length - 1]?.date ?? NaN) as number,
    };
  }, [dateSymbols, currentPower, graphDynamic]);

  // Stable tooltip content reference — deps listed so it only re-creates when
  // the underlying data changes, not on every render.
  const tooltipContent = useCallback(
    (props: TooltipContentProps<ValueType, NameType>) => (
      <CustomTooltip
        {...props}
        currentPower={currentPower}
        isMobile={isMobile}
        graphDynamic={graphDynamic}
        swapped={swapped}
        symbols={symbols}
        flatDateSymbols={flatDateSymbols}
      />
    ),
    [currentPower, isMobile, graphDynamic, swapped, symbols, flatDateSymbols]
  );

  const yAxisTicks = useMemo((): number[] => {
    if (!isValid(currentPower) || !isValid(maxPower) || currentPower === 0 || maxPower === 0) {
      return [];
    }

    const ticks = [currentPower];

    for (let i = 1; i < 3; i++) {
      ticks.push(Math.round((currentPower + (i * (maxPower - currentPower)) / 3) / 10) * 10);
    }

    ticks.push(maxPower);

    // ! Bandaid bug fix | ticks[1] sacred would be stuck in middle of Y axis (arcane)
    return ticks[0] !== ticks[2] ? ticks : [];
  }, [currentPower, maxPower]);

  const xAxisTicks = useMemo((): number[] => {
    if (!isValid(currentPower) || !isValid(maxPower) || currentPower === 0 || maxPower === 0) {
      return [];
    }

    const ticks = [0];

    for (let i = 1; i < 7; i++) {
      ticks.push(Math.ceil((i * maxDays) / 7));
    }

    ticks.push(maxDays);

    // ! Bandaid bug fix | ticks[1] sacred would be stuck in middle of Y axis (arcane)
    return ticks[0] !== ticks[2] && graphDynamic ? ticks : [];
  }, [currentPower, maxPower, maxDays, graphDynamic]);

  // Validate the specified target power
  const getTargetPowerDate = (target: string) => {
    if (target === "0") {
      setTargetPower(1);
    } else if (Number(target) < 0) {
      setTargetPower(NaN);
    } else if (Number(target) >= maxPower) {
      setTargetPower(maxPower);
    } else {
      setTargetPower(parseInt(target));
    }
  };

  // Derive the attainment date for the target power
  const dateToPower = useMemo((): string => {
    if (Math.ceil(targetPower / 10) * 10 <= currentPower) return "";

    // Find the first graphSymbol entry that matches or is closest to the specified power
    let tempDateToPower = graphSymbols.find(
      (entry) => entry.power >= Math.ceil(targetPower / 10) * 10
    )?.date;

    if (graphDynamic) {
      tempDateToPower = dayjs()
        .add(tempDateToPower as number, "day")
        .format("YYYY-MM-DD");
    }

    return dayjs(tempDateToPower).isValid() ? (tempDateToPower as string) : "";
  }, [currentPower, targetPower, graphSymbols, graphDynamic]);

  // Get the date or error message for the attainment date of the target power
  const getTargetPowerResponse = () => {
    // If a valid target is specified, return the date
    if (dateToPower) return dateToPower;

    // Otherwise, return an error message
    return !isValid(targetPower)
      ? "Enter a target power"
      : isMobile
        ? "Target power too low"
        : `Target must be greater than ${currentPower}`;
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
      <div className="mx-4 mt-16 flex w-[360px] max-w-[1050px] flex-col items-center justify-center rounded-lg bg-gradient-to-t from-card to-card-grad px-8 py-8 md:mx-8 md:mt-28 md:w-full md:px-10 md:py-10">
        {/* POWER OVERVIEW */}
        <div className="flex w-full flex-col justify-center gap-4 md:flex-row md:gap-0 md:space-x-8">
          <div className="flex items-center justify-between gap-3 rounded-lg bg-dark px-8 py-4 md:flex-col md:justify-center">
            <p className="text-sm md:text-base">{!swapped ? "Arcane" : "Sacred"} Power</p>
            <p className="text-sm text-accent md:text-base">
              {currentPower} / {enabledSymbols * (!swapped ? 220 : 110)}
            </p>
          </div>

          {/* TARGET POWER */}
          <div className="flex w-full max-w-[325px] flex-col items-center justify-center gap-3 rounded-lg bg-dark px-8 py-4">
            <div className="flex w-full items-center justify-between">
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
                      "h-[25px] w-[65px] bg-secondary text-center text-sm tracking-wider text-secondary outline-none transition-colors hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary focus:outline-none md:h-[30px]",
                      graphSymbols.length === 1 && "pointer-events-none select-none opacity-25"
                    )}
                    placeholder="Target"
                    value={isNaN(targetPower) ? "" : targetPower}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => getTargetPowerDate(e.target.value)}
                    tabIndex={graphSymbols.length === 1 ? -1 : 0}
                  />
                </TooltipTrigger>
                <TooltipContent className="tooltip">
                  Calculate the date you'll <br></br>achieve the <span>specified power</span>
                </TooltipContent>
              </Tooltip>
            </div>
            <div
              className={cn(
                "flex w-full justify-between",
                (!targetPower || targetPower < currentPower) && !isMobile && "justify-center"
              )}
            >
              <p className="text-sm md:hidden">Date:</p>
              <p className={!isMobile && targetPower > currentPower ? "block" : "hidden"}>
                Attainment Date:{" "}
              </p>
              <p className="text-sm text-accent md:text-base">{getTargetPowerResponse()}</p>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <hr className="my-8 h-px w-full opacity-10" />

        {/* RADIO BUTTONS */}
        <div className="flex space-x-[75px] pb-6 md:space-x-32 md:pb-4">
          <Tooltip>
            <TooltipTrigger asChild={true}>
              {" "}
              <RadioButton
                label="Dynamic"
                selected={graphDynamic}
                onClick={() => setGraphDynamic(true)}
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
                onClick={() => setGraphDynamic(false)}
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
              content={tooltipContent}
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
              domain={[() => 0, (max: number) => (isFinite(max) ? maxDays : 1)]}
              stroke="#8c8c8c"
              tickCount={graphDynamic ? 10 : undefined}
              ticks={graphDynamic ? xAxisTicks : undefined}
              tick={{ fontSize: !isMobile ? 16 : 12 }}
              tickFormatter={graphDynamic ? (tick) => formatXAxis(tick) : undefined}
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
