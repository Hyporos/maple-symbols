import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip as RechartsTooltip,
  TooltipContentProps,
  ResponsiveContainer,
} from "recharts";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { FaArrowRight } from "react-icons/fa6";

import { Card, NumberField, SegmentedSwitch, StatBox } from "../ui";
import { isValid } from "../../lib/utils";
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
import { usePower } from "../../hooks/usePower";
import { dayjs } from "../../lib/dayjs";
import { gameToday, type Region } from "../../lib/regions";
import { useAppStore } from "../../state/store";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import type { Mode, SymbolData } from "../../lib/types";
import { interpolate, useLocale, useNameSet, useMessages } from "../../i18n";
import { symbolNames } from "../../i18n/gameNames";
import Message from "../../i18n/Message";
import { familyMaxPower } from "./familyMaxPower";

interface CustomTooltipProps extends TooltipContentProps<ValueType, NameType> {
  currentPower: number;
  isMobile: boolean;
  graphDynamic: boolean;
  family: Mode;
  symbols: SymbolData[];
  flatDateSymbols: GraphSymbols[];
  /** The shown server, whose game clock dates the entries. */
  region: Region;
}

// Defined outside GraphCard so the function reference is stable across re-renders,
// preventing Recharts from unmounting and remounting the tooltip.
const CustomTooltip = ({
  active,
  payload,
  label,
  currentPower,
  isMobile,
  graphDynamic,
  family,
  symbols,
  flatDateSymbols,
  region,
}: CustomTooltipProps) => {
  const m = useMessages().graph;
  const nameSet = useNameSet();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const isFirstEntry = payload[0].value === currentPower;

  return (
    <div className="flex flex-col space-y-1 rounded-lg bg-light p-4">
      <p className="text-sm">
        {graphDynamic
          ? gameToday(region)
              .add(label as number, "day")
              .format("YYYY-MM-DD")
          : label}
      </p>
      <p className={`text-sm text-accent ${!isFirstEntry && "pb-2"}`}>
        {interpolate(m.tooltipPower, { power: m.power[family], value: String(payload[0].value) })}
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
                  <p className="text-sm">
                    {interpolate(m.tooltipSymbolLevel, {
                      symbol: symbolNames(symbol, nameSet).name,
                      level: String(symbolEntries[0].entryLevel - 1),
                    })}
                  </p>
                  <FaArrowRight size={isMobile ? 10 : 12} fill="#8c8c8c" className="opacity-75" />
                  <p className="text-sm">{`${symbolEntries[0].entryLevel + occurrences}`}</p>
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

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * GraphCard is the /next power-over-time chart: current and target power, the
// * dynamic/linear spacing switch, and the projected power line for the current family
// * (Grand Sacred folds into Sacred, matching usePower and the current UI's Graph.tsx).
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const GraphCard = () => {
  const m = useMessages().graph;
  const mn = useMessages().next.graph;
  const locale = useLocale();

  const symbols = useAppStore((s) => s.symbols);
  const mode = useAppStore((s) => s.mode);
  const region = useAppStore((s) => s.region);

  const { isMobile } = useBreakpoint();

  const [targetPower, setTargetPower] = useState(NaN);
  const [graphDynamic, setGraphDynamic] = useState(true);

  // Grand Sacred's own power (and its Graph) counts toward Sacred, matching the current UI
  // (Graph.tsx) and usePower: the Grand tab reads as Sacred everywhere here.
  const family: Mode = mode === "grand" ? "sacred" : mode;

  // The whole family at max, set or not: the same maximum the picker shows.
  const maxFamilyPower = familyMaxPower(symbols, family);

  const currentPower = usePower(symbols, family);

  const dateSymbols = useMemo((): DateSymbols[] => {
    try {
      return buildDateSymbols(symbols, family, gameToday(region), region);
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [symbols, family, region]);

  const { graphSymbols, flatDateSymbols, maxPower, maxDays } = useMemo(
    () => buildGraphSeries(dateSymbols, currentPower, graphDynamic, gameToday(region)),
    [dateSymbols, currentPower, graphDynamic, region]
  );

  const tooltipContent = useCallback(
    (props: TooltipContentProps<ValueType, NameType>) => (
      <CustomTooltip
        {...props}
        currentPower={currentPower}
        isMobile={isMobile}
        graphDynamic={graphDynamic}
        family={family}
        symbols={symbols}
        flatDateSymbols={flatDateSymbols}
        region={region}
      />
    ),
    [currentPower, isMobile, graphDynamic, family, symbols, flatDateSymbols, region]
  );

  const yTicks = useMemo(() => yAxisTicks(currentPower, maxPower), [currentPower, maxPower]);

  const xTicks = useMemo(
    () => xAxisTicks(currentPower, maxPower, maxDays, graphDynamic),
    [currentPower, maxPower, maxDays, graphDynamic]
  );

  const attainmentDate = useMemo(
    () => dateToPower(targetPower, currentPower, graphSymbols, graphDynamic, gameToday(region)),
    [currentPower, targetPower, graphSymbols, graphDynamic, region]
  );

  // Where the attainment reference line sits on the X axis: a day offset on the dynamic
  // axis, the date string itself on the linear (category) axis.
  const attainmentX = useMemo(() => {
    if (!attainmentDate) return null;
    if (!graphDynamic) return attainmentDate;
    return dayjs(attainmentDate).startOf("day").diff(gameToday(region).startOf("day"), "day");
  }, [attainmentDate, graphDynamic, region]);

  const targetResponse = () => {
    if (attainmentDate)
      return <Message text={mn.reachedBy} values={{ date: formatDay(attainmentDate, locale) }} />;
    if (!isValid(targetPower)) return m.enterTarget;
    if (isMobile) return m.targetTooLow;
    return interpolate(m.targetMustBeGreater, { power: currentPower });
  };

  // Reset the target when the family changes or every symbol is disabled.
  useEffect(() => {
    setTargetPower(NaN);
  }, [family]);
  useEffect(() => {
    if (currentPower === 0) setTargetPower(NaN);
  }, [currentPower]);

  const formatXAxis = (tick: number) => gameToday(region).add(tick, "day").format("YYYY-MM-DD");

  const spacingOptions = [
    { value: "dynamic" as const, label: m.dynamic },
    { value: "linear" as const, label: m.linear },
  ];

  return (
    <Card label={mn.label} as="section">
      <div className="flex flex-col gap-3 md:flex-row">
        <StatBox caption={m.power[family]}>
          {currentPower} / {maxFamilyPower}
        </StatBox>
        <StatBox caption={m.targetPowerFull[family]} className="flex-1">
          <div className="flex items-center gap-2">
            <NumberField
              value={targetPower}
              onChange={(raw) => setTargetPower(clampNumberInput(raw, maxPower))}
              placeholder=""
              label={m.targetPowerFull[family]}
              disabled={graphSymbols.length === 1}
              className="w-20"
            />
            <span className="text-xs text-tertiary">{targetResponse()}</span>
          </div>
        </StatBox>
      </div>

      <div className="my-4">
        <SegmentedSwitch
          label={m.xAxisSpacing}
          options={spacingOptions}
          value={graphDynamic ? "dynamic" : "linear"}
          onChange={(value) => setGraphDynamic(value === "dynamic")}
        />
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 220 : 320}>
        <AreaChart
          data={graphSymbols}
          margin={{ top: 15, right: isMobile ? 12 : 30, left: isMobile ? -12 : 0 }}
        >
          <defs>
            <linearGradient id="next-power-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b18bd0" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#b18bd0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <RechartsTooltip
            cursor={{ stroke: "#8c8c8c", strokeWidth: 1.5 }}
            content={tooltipContent}
          />
          <Area
            type="linear"
            dataKey="power"
            stroke="#b18bd0"
            strokeWidth={2}
            fill="url(#next-power-fill)"
            dot={{ r: 2.5, fill: "#b18bd0" }}
            isAnimationActive={false}
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
            tick={{ fontSize: !isMobile ? 14 : 11 }}
            tickFormatter={graphDynamic ? (tick) => formatXAxis(tick) : undefined}
          />
          <YAxis
            dataKey="power"
            tickMargin={isMobile ? 5 : 10}
            stroke="#8c8c8c"
            domain={[currentPower, maxPower]}
            ticks={yTicks}
            tick={{ fontSize: !isMobile ? 14 : 11 }}
          />
          {attainmentX !== null && (
            <>
              <ReferenceLine y={targetPower} stroke="#bfbfbf" strokeDasharray="4 4" />
              <ReferenceLine x={attainmentX} stroke="#b18bd0" strokeDasharray="3 4" />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default GraphCard;
