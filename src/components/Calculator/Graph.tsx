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
import { isValid, cn } from "../../lib/utils";
import {
  buildDateSymbols,
  buildGraphSeries,
  dateToPower,
  xAxisTicks,
  yAxisTicks,
  type DateSymbols,
  type GraphSymbols,
} from "../../lib/graph";
import { clampNumberInput } from "../../lib/inputs";
import { formatDay } from "../../lib/format";
import { inFamily, MAX_POWER_PER_SYMBOL } from "../../lib/game";
import { usePower } from "../../hooks/usePower";
import { gameToday, type Region } from "../../lib/regions";
import RadioButton from "../ui/RadioButton";
import { useAppStore, useMode } from "../../state/store";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { track } from "../../lib/analytics";
import type { Mode, SymbolData } from "../../lib/types";
import { interpolate, useLocale, useNameSet, useMessages } from "../../i18n";
import { symbolNames } from "../../i18n/gameNames";
import Message from "../../i18n/Message";

interface CustomTooltipProps extends TooltipContentProps<ValueType, NameType> {
  currentPower: number;
  isMobile: boolean;
  graphDynamic: boolean;
  mode: Mode;
  symbols: SymbolData[];
  flatDateSymbols: GraphSymbols[];
  /** The shown server, whose game clock dates the entries. */
  region: Region;
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
  mode,
  symbols,
  flatDateSymbols,
  region,
}: CustomTooltipProps) => {
  const m = useMessages().graph;
  const nameSet = useNameSet();

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
          ? gameToday(region)
              .add(label as number, "day")
              .format("YYYY-MM-DD")
          : label
      }`}</p>
      <p className={`text-accent ${isMobile ? "text-xs" : "text-sm"} ${!isFirstEntry && "pb-2"}`}>
        {interpolate(m.tooltipPower, { power: m.power[mode], value: String(payload[0].value) })}
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

            const isSecondEntry =
              label === (graphDynamic ? 0 : gameToday(region).format("YYYY-MM-DD"));

            const upgradeReady = symbol.experience >= symbol.symbolsRequired[symbol.level];

            return (
              <div key={symbol.name} className="flex flex-col text-tertiary">
                <div className="flex items-center space-x-1.5">
                  <p className={isMobile ? "text-xs" : "text-sm"}>
                    {interpolate(m.tooltipSymbolLevel, {
                      symbol: symbolNames(symbol, nameSet).name,
                      level: String(symbolEntries[0].entryLevel - 1),
                    })}
                  </p>
                  <FaArrowRight size={isMobile ? 10 : 12} fill="#8c8c8c" className="opacity-75" />
                  <p className={isMobile ? "text-xs" : "text-sm"}>{`${
                    symbolEntries[0].entryLevel + occurrences
                  }`}</p>
                </div>
                <p className="text-xs text-accent/75">
                  {isSecondEntry && upgradeReady && m.readyForUpgrade}
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

  const m = useMessages().graph;
  const locale = useLocale();

  const symbols = useAppStore((s) => s.symbols);
  const mode = useMode();
  const region = useAppStore((s) => s.region);

  const { isMobile, isTablet } = useBreakpoint();

  const [targetPower, setTargetPower] = useState(NaN);
  const [graphDynamic, setGraphDynamic] = useState(true);

  // The Sacred family's max includes Grand Sacred (inFamily), matching usePower's total, so
  // this sums each enabled symbol's own max rather than multiplying by one shared max.
  const maxFamilyPower = symbols
    .filter((symbol) => symbol.level > 0 && inFamily(symbol.type, mode))
    .reduce((sum, symbol) => sum + MAX_POWER_PER_SYMBOL[symbol.type], 0);

  /* ―――――――――――――――――――― Functions ―――――――――――――――――――――― */

  // Calculate the base power of the character
  const currentPower = usePower(symbols, mode);

  // Calculate every symbol's date needed to reach future levels
  const dateSymbols = useMemo((): DateSymbols[] => {
    try {
      return buildDateSymbols(symbols, mode, gameToday(region), region);
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [symbols, mode, region]);

  // Derive graph entries from dateSymbols
  const { graphSymbols, flatDateSymbols, maxPower, maxDays } = useMemo(
    () => buildGraphSeries(dateSymbols, currentPower, graphDynamic, gameToday(region)),
    [dateSymbols, currentPower, graphDynamic, region]
  );

  // Stable tooltip content reference — deps listed so it only re-creates when
  // the underlying data changes, not on every render.
  const tooltipContent = useCallback(
    (props: TooltipContentProps<ValueType, NameType>) => (
      <CustomTooltip
        {...props}
        currentPower={currentPower}
        isMobile={isMobile}
        graphDynamic={graphDynamic}
        mode={mode}
        symbols={symbols}
        flatDateSymbols={flatDateSymbols}
        region={region}
      />
    ),
    [currentPower, isMobile, graphDynamic, mode, symbols, flatDateSymbols, region]
  );

  const yTicks = useMemo(() => yAxisTicks(currentPower, maxPower), [currentPower, maxPower]);

  const xTicks = useMemo(
    () => xAxisTicks(currentPower, maxPower, maxDays, graphDynamic),
    [currentPower, maxPower, maxDays, graphDynamic]
  );

  // Validate the specified target power
  const getTargetPowerDate = (target: string) => setTargetPower(clampNumberInput(target, maxPower));

  // Derive the attainment date for the target power
  const attainmentDate = useMemo(
    () => dateToPower(targetPower, currentPower, graphSymbols, graphDynamic, gameToday(region)),
    [currentPower, targetPower, graphSymbols, graphDynamic, region]
  );

  // Get the date or error message for the attainment date of the target power
  const getTargetPowerResponse = () => {
    // If a valid target is specified, return the date
    if (attainmentDate) return formatDay(attainmentDate, locale);

    // Otherwise, return an error message
    return !isValid(targetPower)
      ? m.enterTarget
      : isMobile
        ? m.targetTooLow
        : interpolate(m.targetMustBeGreater, { power: String(currentPower) });
  };

  // Reset targetPower if symbols are mode
  useEffect(() => {
    setTargetPower(NaN);
  }, [mode]);

  // Reset targetPower if symbols are disabled
  useEffect(() => {
    if (currentPower === 0) {
      setTargetPower(NaN);
    }
  }, [currentPower]);

  // Format the X axis (change from days to date)
  const formatXAxis = (tick: number) => {
    return gameToday(region).add(tick, "day").format("YYYY-MM-DD");
  };

  /* ―――――――――――――――――――― Render Logic ――――――――――――――――――― */

  return (
    <section className="flex justify-center">
      <div className="mx-4 mt-16 flex w-[360px] max-w-[1050px] flex-col items-center justify-center rounded-lg bg-linear-to-t from-card to-card-grad px-8 py-8 md:mx-8 md:mt-28 md:w-full md:px-10 md:py-10">
        {/* POWER OVERVIEW */}
        <div className="flex w-full flex-col justify-center gap-4 md:flex-row md:gap-0 md:space-x-8">
          <div className="flex items-center justify-between gap-3 rounded-lg bg-dark px-8 py-4 md:flex-col md:justify-center">
            <p className="text-sm md:text-base">{m.power[mode]}</p>
            <p className="text-sm text-accent md:text-base">
              {currentPower} / {maxFamilyPower}
            </p>
          </div>

          {/* TARGET POWER */}
          <div className="flex w-full max-w-[325px] flex-col items-center justify-center gap-3 rounded-lg bg-dark px-8 py-4">
            <div className="flex w-full items-center justify-between">
              <p className="text-sm md:text-base">
                {isMobile ? m.targetPower : m.targetPowerFull[mode]}
              </p>
              <Tooltip>
                <TooltipTrigger asChild={true}>
                  <input
                    type="number"
                    className={cn(
                      "h-[25px] w-[65px] bg-secondary text-center text-sm tracking-wider text-secondary outline-hidden transition-colors hover:bg-hover hover:text-primary focus:bg-hover focus:text-primary focus:outline-hidden md:h-[30px]",
                      graphSymbols.length === 1 && "pointer-events-none opacity-25 select-none"
                    )}
                    placeholder={m.targetPlaceholder}
                    value={isNaN(targetPower) ? "" : targetPower}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => getTargetPowerDate(e.target.value)}
                    tabIndex={graphSymbols.length === 1 ? -1 : 0}
                  />
                </TooltipTrigger>
                <TooltipContent className="tooltip">
                  <Message text={m.targetTooltip} />
                </TooltipContent>
              </Tooltip>
            </div>
            <div
              className={cn(
                "flex w-full justify-between",
                (!targetPower || targetPower < currentPower) && !isMobile && "justify-center"
              )}
            >
              <p className="text-sm md:hidden">{m.dateLabel}</p>
              <p className={!isMobile && targetPower > currentPower ? "block" : "hidden"}>
                {m.attainmentDateLabel}{" "}
              </p>
              <p className="text-sm text-accent md:text-base">{getTargetPowerResponse()}</p>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <hr className="my-8 h-px w-full opacity-10" />

        {/* RADIO BUTTONS */}
        <div
          role="radiogroup"
          aria-label={m.xAxisSpacing}
          className="flex space-x-[75px] pb-6 md:space-x-32 md:pb-4"
        >
          <Tooltip>
            <TooltipTrigger as="div">
              <RadioButton
                label={m.dynamic}
                selected={graphDynamic}
                onClick={() => {
                  if (!graphDynamic) track("graph_mode", { mode: "dynamic" });
                  setGraphDynamic(true);
                }}
              />
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              <Message text={m.dynamicTooltip} />
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as="div">
              <RadioButton
                label={m.linear}
                selected={!graphDynamic}
                onClick={() => {
                  if (graphDynamic) track("graph_mode", { mode: "linear" });
                  setGraphDynamic(false);
                }}
              />
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              <Message text={m.linearTooltip} />
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
              name={m.power[mode]}
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
              ticks={graphDynamic ? xTicks : undefined}
              tick={{ fontSize: !isMobile ? 16 : 12 }}
              tickFormatter={graphDynamic ? (tick) => formatXAxis(tick) : undefined}
            />
            <YAxis
              dataKey="power"
              tickMargin={isMobile ? 5 : 10}
              stroke="#8c8c8c"
              domain={[currentPower, maxPower]}
              ticks={yTicks}
              tick={{ fontSize: !isMobile ? 16 : 12 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default Graph;
