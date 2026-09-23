import type { ReactNode } from "react";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/Tooltip";
import { useMessages } from "../../i18n";
import { useAppStore } from "../../state/store";
import { SegmentedSwitch } from "../ui";

interface FamilyHeaderProps {
  /** The panel's own heading, e.g. `handbook.symbolsHeading[family]` or `regionName[family]`. */
  heading: string;
  /** The "?" tooltip's content, e.g. `<Message text={handbook.expTooltip} />`. */
  tooltip: ReactNode;
  /** Extra content after the tooltip icon (RatioPanel's power-column tooltip). */
  children?: ReactNode;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * FamilyHeader is the row every Handbook panel starts with: its own heading with a "?"
// * tooltip, and the Arcane/Sacred/Grand SegmentedSwitch bound to the store's mode.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const FamilyHeader = ({ heading, tooltip, children }: FamilyHeaderProps) => {
  const messages = useMessages();
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  const familyOptions = [
    { value: "arcane" as const, label: messages.shell.arcane },
    { value: "sacred" as const, label: messages.shell.sacred },
    { value: "grand" as const, label: messages.next.calculator.familyGrand },
  ];

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <h2 className="text-lg font-semibold text-primary">{heading}</h2>
        <Tooltip placement="right">
          <TooltipTrigger>
            <HiOutlineQuestionMarkCircle
              size={20}
              className="cursor-default text-tertiary transition-colors hover:text-primary motion-reduce:transition-none"
            />
          </TooltipTrigger>
          <TooltipContent className="tooltip">{tooltip}</TooltipContent>
        </Tooltip>
        {children}
      </div>
      <SegmentedSwitch
        label={messages.next.calculator.familyLabel}
        options={familyOptions}
        value={mode}
        onChange={setMode}
      />
    </div>
  );
};

export default FamilyHeader;
