import type { ReactNode } from "react";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { MdOutlineInfo } from "react-icons/md";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/Tooltip";
import Message from "../../i18n/Message";
import { useMessages } from "../../i18n";
import { arcaneRatioData, sacredRatioData } from "../../lib/ratioData";
import { useAppStore, useMode } from "../../state/store";
import { DataTable, SegmentedSwitch } from "../ui";

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

  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const family = useMode(); // Grand folds to Sacred: it reads the same ratio bands.

  const familyOptions = [
    { value: "arcane" as const, label: messages.shell.arcane },
    { value: "sacred" as const, label: messages.shell.sacred },
    { value: "grand" as const, label: messages.next.calculator.familyGrand },
  ];

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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold text-primary">{handbook.regionName[family]}</h2>
          <Tooltip placement="right">
            <TooltipTrigger>
              <HiOutlineQuestionMarkCircle
                size={20}
                className="cursor-default text-tertiary transition-colors hover:text-primary motion-reduce:transition-none"
              />
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              <Message
                text={handbook.ratioTooltip}
                values={{ region: handbook.regionName[family], power: handbook.power[family] }}
              />
            </TooltipContent>
          </Tooltip>
          <Tooltip placement="right">
            <TooltipTrigger>
              <MdOutlineInfo
                size={18}
                className="cursor-default text-tertiary transition-colors hover:text-primary motion-reduce:transition-none"
              />
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              <Message
                text={
                  family === "arcane" ? handbook.arcanePowerTooltip : handbook.sacredPowerTooltip
                }
              />
            </TooltipContent>
          </Tooltip>
        </div>
        <SegmentedSwitch
          label={messages.next.calculator.familyLabel}
          options={familyOptions}
          value={mode}
          onChange={setMode}
        />
      </div>

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
