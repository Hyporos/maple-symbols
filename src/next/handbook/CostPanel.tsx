import Message from "../../i18n/Message";
import { interpolate, useLocale, useMessages, useNameSet } from "../../i18n";
import { symbolNames } from "../../i18n/gameNames";
import { formatNumber } from "../../lib/format";
import { isPublished, mesosKind } from "../../lib/regions";
import { editionOf } from "../../lib/routes";
import { cn } from "../../lib/utils";
import { useAppStore, useMode, useSelectedSymbol } from "../../state/store";
import { DataTable } from "../ui";
import FamilyHeader from "./FamilyHeader";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * CostPanel is the Handbook's Meso cost tab: the selected symbol's own cost table (a picker
// * row lets the player switch symbols within the family), hidden when a server has not
// * published that family's costs yet (REGIONS D-6).
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const CostPanel = () => {
  const messages = useMessages();
  const handbook = messages.handbook;
  const locale = useLocale();
  const nameSet = useNameSet();

  const mode = useAppStore((s) => s.mode);
  const family = useMode(); // Grand folds to Sacred for the heading term only.
  const symbols = useAppStore((s) => s.symbols);
  const region = useAppStore((s) => s.region);
  const selectSymbol = useAppStore((s) => s.selectSymbol);
  const symbol = useSelectedSymbol();

  const shown = symbols.filter((s) => s.type === mode);
  const published = isPublished(region, mesosKind(symbol.type));

  let total = 0;
  const rows = symbol.mesosRequired.map((cost, index) => {
    const level = index + 1;
    const isFirstRow = index === 0;
    const current = symbol.level === level;
    total += cost;
    return {
      key: String(index),
      current,
      cells: [
        <span key="level" className="inline-flex items-center justify-center gap-2">
          {current && (
            <img
              src={symbol.img}
              alt={interpolate(handbook.currentLevelAlt, {
                symbol: symbolNames(symbol, nameSet).name,
              })}
              className="h-3 w-3"
            />
          )}
          {level}
        </span>,
        isFirstRow || !published ? "-" : formatNumber(cost, locale),
        isFirstRow || !published ? "-" : formatNumber(total, locale),
      ],
    };
  });

  return (
    <div>
      <FamilyHeader
        heading={handbook.symbolsHeading[family]}
        tooltip={<Message text={handbook.costTooltip} />}
      />

      <div
        role="group"
        aria-label={messages.next.calculator.pickerLabel}
        className="mb-5 flex flex-wrap gap-2"
      >
        {shown.map((s) => {
          const selected = s.id === symbol.id;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={selected}
              aria-label={symbolNames(s, nameSet).name}
              onClick={() => selectSymbol(s.id)}
              className={cn(
                "rounded-lg p-1.5 transition-colors motion-reduce:transition-none",
                selected ? "bg-secondary" : "hover:bg-light"
              )}
            >
              <img src={s.img} alt="" width={24} height={24} />
            </button>
          );
        })}
      </div>

      {!published && (
        <p className="mb-5 text-sm text-tertiary">
          <Message text={handbook.costsUnpublished} values={{ server: editionOf(region).name }} />
        </p>
      )}

      <DataTable
        caption={handbook.tabs.cost.label}
        columns={[
          { key: "level", header: handbook.level, align: "center" },
          { key: "mesos", header: handbook.mesosRequired, align: "center" },
          { key: "total", header: handbook.totalCost, align: "center" },
        ]}
        rows={rows}
      />
    </div>
  );
};

export default CostPanel;
