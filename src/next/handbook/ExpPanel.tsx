import Message from "../../i18n/Message";
import { interpolate, useLocale, useMessages, useNameSet } from "../../i18n";
import { symbolNames } from "../../i18n/gameNames";
import { inFamily } from "../../lib/game";
import { formatNumber } from "../../lib/format";
import symbolsJson from "../../lib/symbols.json";
import { isValid } from "../../lib/utils";
import { useMode, useSelectedSymbol } from "../../state/store";
import { DataTable } from "../ui";
import FamilyHeader from "./FamilyHeader";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * ExpPanel is the Handbook's Experience tab: the current ExpTable's numbers as a DataTable,
// * with the selected symbol's level highlighted. Grand reads the Sacred table (same 11 levels).
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ExpPanel = () => {
  const messages = useMessages();
  const handbook = messages.handbook;
  const locale = useLocale();
  const nameSet = useNameSet();

  const family = useMode(); // Grand folds to Sacred: the exp table and the term it names.
  const symbol = useSelectedSymbol();

  const expTable =
    family === "arcane" ? symbolsJson.arcaneExpRequired : symbolsJson.sacredExpRequired;
  const currentLevel = inFamily(symbol.type, family) && isValid(symbol.level) ? symbol.level : null;

  let total = 0;
  const rows = expTable.map((exp, index) => {
    const level = index + 1;
    const isFirstRow = index === 0;
    const current = currentLevel === level;
    total += exp;
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
        isFirstRow ? "-" : formatNumber(exp, locale),
        isFirstRow ? "-" : formatNumber(total, locale),
      ],
    };
  });

  return (
    <div>
      <FamilyHeader
        heading={handbook.symbolsHeading[family]}
        grandHeading={messages.next.handbook.grandSymbolsHeading}
        tooltip={<Message text={handbook.expTooltip} />}
      />

      <DataTable
        caption={handbook.tabs.exp.label}
        columns={[
          { key: "level", header: handbook.level, align: "center" },
          { key: "symbols", header: handbook.symbolsRequired, align: "center" },
          { key: "total", header: handbook.totalExperience, align: "center" },
        ]}
        rows={rows}
      />
    </div>
  );
};

export default ExpPanel;
