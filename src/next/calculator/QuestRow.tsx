import { useId, type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/Tooltip";
import { Switch } from "../ui";

interface QuestRowProps {
  /** The quest's label, also the switch's accessible name. */
  label: string;
  /** What the quest pays, e.g. "20 / day". */
  rate: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /**
   * The quest's in-game name: a tooltip on the label for the mouse, and the switch's accessible
   * description for everyone else (the label is not focusable, so its tooltip never opens by key).
   */
  tooltip: ReactNode;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * QuestRow is one quest (daily, weekly, extra) on the /next calculator card: its label, what it
// * pays and a switch. The label carries the quest's tooltip; the switch is the only control.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const QuestRow = ({ label, rate, checked, onChange, tooltip }: QuestRowProps) => {
  const descriptionId = useId();

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <Tooltip placement="bottom">
        <TooltipTrigger as="div" className="min-w-0 cursor-default text-sm text-secondary">
          {label}
        </TooltipTrigger>
        <TooltipContent className="tooltip">{tooltip}</TooltipContent>
      </Tooltip>
      <p id={descriptionId} className="sr-only">
        {tooltip}
      </p>
      <div className="flex shrink-0 items-center gap-3">
        <p className="text-xs text-tertiary">{rate}</p>
        <Switch checked={checked} onChange={onChange} label={label} describedBy={descriptionId} />
      </div>
    </div>
  );
};

export default QuestRow;
