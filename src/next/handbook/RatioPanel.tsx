import type { ReactNode } from "react";
import { MdOutlineInfo } from "react-icons/md";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/Tooltip";
import Message from "../../i18n/Message";
import { useMessages } from "../../i18n";
import { arcaneRatioData, sacredRatioData } from "../../lib/ratioData";
import { useMode } from "../../state/store";
import { DataTable } from "../ui";
import FamilyHeader from "./FamilyHeader";

interface Row {
  key: string;
  cells: ReactNode[];
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * RatioPanel is the Handbook's Damage ratio tab: the current RatioTable's bands as a DataTable,
// * with the region name and its tooltips. Grand reads the Sacred ratios.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const buildRow = (
  power: string | number,
  damageDealt: number,
  damageTaken: number,
  index: number,
  oneDamageTooltip: string
): Row => ({
  key: String(index),
  cells: [
    power,
    `${damageDealt}%`,
    <span key="taken" className="inline-flex items-center justify-center gap-1.5">
      {damageTaken}%
      {oneDamageTooltip && (
        <Tooltip>
          <TooltipTrigger>
            <MdOutlineInfo
              size={16}
              className="cursor-default text-tertiary transition-colors hover:text-primary motion-reduce:transition-none"
            />
          </TooltipTrigger>
          <TooltipContent className="tooltip">
            <Message text={oneDamageTooltip} />
          </TooltipContent>
        </Tooltip>
      )}
    </span>,
  ],
});

const RatioPanel = () => {
  const messages = useMessages();
  const handbook = messages.handbook;

  const family = useMode(); // Grand folds to Sacred: it reads the same ratio bands.

  const rows: Row[] =
    family === "arcane"
      ? arcaneRatioData.map((r, index) =>
          buildRow(
            r.arcanePower,
            r.damageDealt,
            r.damageTaken,
            index,
            index === 8 ? handbook.oneDamageTooltip : ""
          )
        )
      : sacredRatioData.map((r, index) =>
          buildRow(r.sacredPower, r.damageDealt, r.damageTaken, index, "")
        );

  return (
    <div>
      <FamilyHeader
        heading={handbook.regionName[family]}
        tooltip={
          <Message
            text={handbook.ratioTooltip}
            values={{ region: handbook.regionName[family], power: handbook.power[family] }}
          />
        }
      >
        <Tooltip placement="right">
          <TooltipTrigger>
            <MdOutlineInfo
              size={18}
              className="cursor-default text-tertiary transition-colors hover:text-primary motion-reduce:transition-none"
            />
          </TooltipTrigger>
          <TooltipContent className="tooltip">
            <Message
              text={family === "arcane" ? handbook.arcanePowerTooltip : handbook.sacredPowerTooltip}
            />
          </TooltipContent>
        </Tooltip>
      </FamilyHeader>

      <DataTable
        caption={handbook.tabs.ratio.label}
        columns={[
          { key: "power", header: handbook.power[family], align: "center" },
          { key: "dealt", header: handbook.damageDealt, align: "center" },
          { key: "taken", header: handbook.damageTaken, align: "center" },
        ]}
        rows={rows}
      />
    </div>
  );
};

export default RatioPanel;
