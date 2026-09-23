import { useEffect, useState } from "react";
import { Card, DataTable, NumberField, ProgressBar } from "../ui";
import { collapsedRowLabels, targetPanelLabels } from "../../lib/overview";
import { clampNumberInput } from "../../lib/inputs";
import { maxLevelFor } from "../../lib/game";
import { gameToday } from "../../lib/regions";
import { calculateDaysRemaining, cn, getDailySymbols, isMaxLevel } from "../../lib/utils";
import { formatDay } from "../../lib/format";
import { useAppStore } from "../../state/store";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useLocale, useMessages, useNameSet, interpolate } from "../../i18n";
import { symbolNames } from "../../i18n/gameNames";
import Message from "../../i18n/Message";
import { allMaxedOn } from "./allMaxedOn";

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * OverviewCard is the /next per-symbol target table: a row per symbol of the current
// * family with its target level, done-by date and symbols remaining, plus a target-level
// * box for the selected symbol and a closing "all maxed on" line once every date is known.
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const OverviewCard = () => {
  const m = useMessages().overview;
  const mn = useMessages().next.overview;
  const locale = useLocale();
  const nameSet = useNameSet();

  const symbols = useAppStore((s) => s.symbols);
  const mode = useAppStore((s) => s.mode);
  const region = useAppStore((s) => s.region);
  const selectedId = useAppStore((s) => s.selectedId);
  const selectSymbol = useAppStore((s) => s.selectSymbol);

  const { isTablet } = useBreakpoint();

  const [targetLevel, setTargetLevel] = useState(NaN);

  const today = gameToday(region);
  const familySymbols = symbols.filter((symbol) => symbol.type === mode);
  const currentSymbol = symbols.find((symbol) => symbol.id === selectedId) ?? symbols[0];
  const maxLevel = maxLevelFor(currentSymbol.type);

  // The target-level box always applies to the selected symbol, so a new selection clears it.
  useEffect(() => {
    setTargetLevel(NaN);
  }, [selectedId]);

  const dailySymbols = getDailySymbols(currentSymbol);
  const targetSymbols =
    currentSymbol.symbolsRequired
      .slice(currentSymbol.level, targetLevel)
      .reduce((accumulator, experience) => accumulator + experience, 0) - currentSymbol.experience;

  let targetDays: number;
  try {
    targetDays = calculateDaysRemaining(
      targetSymbols,
      dailySymbols,
      !!currentSymbol.weekly,
      today,
      region
    );
  } catch {
    targetDays = NaN;
  }
  const targetDate = today.add(targetDays, "day").format("YYYY-MM-DD");

  const panel = targetPanelLabels({
    rowLevel: currentSymbol.level,
    current: currentSymbol,
    targetLevel,
    targetSymbols,
    targetDays,
    targetDate,
    isTablet,
    m,
    locale,
  });

  // allMaxedOn also returns null once the family is already fully maxed (nothing left to
  // date); that state gets its own line ("Complete"), checked first.
  const familyComplete =
    familySymbols.length > 0 &&
    familySymbols.every((symbol) => isMaxLevel(symbol.level, symbol.type));
  const allMaxed = allMaxedOn(symbols, mode, today, region);

  const columns = [
    { key: "symbol", header: m.symbol },
    { key: "target", header: m.targetLevel, align: "center" as const },
    { key: "completion", header: m.completionDate, align: "center" as const },
    { key: "remaining", header: m.symbolsRemaining, align: "center" as const },
  ];

  const rows = familySymbols.map((symbol) => {
    const names = symbolNames(symbol, nameSet);
    const row = collapsedRowLabels(symbol, maxLevelFor(symbol.type), m, today, region, locale);

    const maxToMax = symbol.symbolsRequired.reduce((a, b) => a + b, 0);
    const invested = Number.isNaN(symbol.level)
      ? 0
      : symbol.symbolsRequired.slice(0, symbol.level).reduce((a, b) => a + b, 0) +
        (Number.isNaN(symbol.experience) ? 0 : symbol.experience);
    const percent = maxToMax > 0 ? Math.min(100, Math.round((invested / maxToMax) * 100)) : 0;

    return {
      key: String(symbol.id),
      current: symbol.id === selectedId,
      cells: [
        <div key="symbol" className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => selectSymbol(symbol.id)}
            className="flex items-center gap-2 text-left"
          >
            <img
              src={symbol.img}
              alt=""
              aria-hidden="true"
              width={24}
              className={cn(Number.isNaN(symbol.level) && "grayscale")}
            />
            <span>{names.name}</span>
          </button>
          <ProgressBar
            value={invested}
            max={maxToMax}
            label={interpolate(mn.toMax, { symbol: names.name, percent }, locale)}
          />
        </div>,
        <span
          key="target"
          className={cn(Number.isNaN(symbol.level) ? "grayscale filter" : "text-accent")}
        >
          {row.target}
        </span>,
        <div key="completion">
          <p>{row.completion}</p>
          <p className="text-xs text-tertiary">{row.days}</p>
        </div>,
        row.remaining,
      ],
    };
  });

  return (
    <Card label={mn.label} as="section">
      <DataTable caption={mn.label} columns={columns} rows={rows} />

      <div className="mt-4 flex flex-col items-center gap-3 rounded-lg bg-dark px-4 py-3 md:flex-row md:justify-between">
        <p className="text-sm">{m.targetLevel}</p>
        <NumberField
          value={targetLevel}
          onChange={(raw) => setTargetLevel(clampNumberInput(raw, maxLevel))}
          placeholder={m.levelPlaceholder}
          label={m.targetLevel}
          className="w-20"
        />
        <p className="text-sm text-tertiary">{panel.completion}</p>
        <p className="text-sm text-tertiary">{panel.days}</p>
        <p className="text-sm text-tertiary">{panel.remaining}</p>
      </div>

      <p className="mt-3 text-center text-sm text-tertiary">
        {familyComplete ? (
          m.complete
        ) : allMaxed ? (
          <Message text={mn.allMaxedOn} values={{ date: formatDay(allMaxed, locale) }} />
        ) : (
          mn.allMaxedUnknown
        )}
      </p>
    </Card>
  );
};

export default OverviewCard;
