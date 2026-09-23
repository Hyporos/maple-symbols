import { useMemo, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { track } from "../../lib/analytics";
import { getRemainingToMax } from "../../lib/calculator";
import { CATALYST_RETENTION, maxLevelFor } from "../../lib/game";
import { clampNumberInput } from "../../lib/inputs";
import { REGION_PROFILES } from "../../lib/regions";
import { catalystPreview, formatPreview, selectorPreview } from "../../lib/tools";
import { isValid, updateSymbol } from "../../lib/utils";
import { useMessages } from "../../i18n";
import Message from "../../i18n/Message";
import { useAppStore, useSelectedSymbol } from "../../state/store";
import { NumberField, Sheet } from "../ui";

export type Tool = "selector" | "catalyst";

interface ToolsSheetProps {
  tool: Tool;
  open: boolean;
  onClose: () => void;
  /** The button that opened it; the popover sits under it on desktop. */
  anchor: HTMLElement | null;
}

interface PreviewRowProps {
  before: string;
  after: string;
  accentAfter?: boolean;
}

// The "level / exp → level / exp" line both tools show.
const PreviewRow = ({ before, after, accentAfter }: PreviewRowProps) => (
  <div className="flex items-center justify-center gap-4 rounded-lg bg-dark px-3 py-2 text-sm">
    <p className="text-secondary">{before}</p>
    <FaArrowRight size={14} className="shrink-0 text-tertiary" />
    <p className={accentAfter ? "text-accent" : "text-secondary"}>{after}</p>
  </div>
);

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * ToolsSheet is the Symbol Selector or Catalyst preview in a kit Sheet (a popover under its button
// * on desktop, a bottom sheet on phones). Same maths and rules as src/components/Calculator/Tools.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ToolsSheet = ({ tool, open, onClose, anchor }: ToolsSheetProps) => {
  /* ―――――――――――――――――――― Declarations ―――――――――――――――――――― */

  const messages = useMessages();
  const m = messages.tools;

  const setSymbols = useAppStore((s) => s.setSymbols);
  const selectedId = useAppStore((s) => s.selectedId);
  const region = useAppStore((s) => s.region);

  const symbol = useSelectedSymbol();
  const [selectorCount, setSelectorCount] = useState(NaN);

  const maxLevel = maxLevelFor(symbol.type);
  const nextExperience = symbol.symbolsRequired[symbol.level];
  const retention = CATALYST_RETENTION[symbol.type];
  const catalystName = symbol.type === "arcane" ? m.arcaneCatalyst : m.sacredCatalyst;

  const disabled = !isValid(symbol.level);
  // Unlocked experience past the next level: the Selector preview does not apply (Tools.tsx).
  const overflowing = symbol.level < maxLevel && symbol.experience > nextExperience;
  // Symbols still needed to max: the count's ceiling (derived, never stored).
  const remainingToMax = getRemainingToMax(symbol, maxLevel);

  // Level/exp after applying the Symbol Selectors.
  const { level: selectorLevel, experience: selectorExp } = useMemo(
    () => selectorPreview(symbol, selectorCount),
    [symbol, selectorCount]
  );

  // Level/exp after a Catalyst transfer; Grand Sacred has no Catalyst.
  const { level: catalystLevel, experience: catalystExp } = useMemo(
    () =>
      retention === null ? { level: NaN, experience: NaN } : catalystPreview(symbol, retention),
    [symbol, retention]
  );

  const displayPreview = (level: number, experience: number) =>
    formatPreview(level, experience, {
      symbol,
      maxLevel,
      isCatalyst: tool === "catalyst",
      catalystExperience: catalystExp,
    });

  const applyDisabled =
    disabled ||
    overflowing ||
    isNaN(selectorExp) ||
    !isValid(selectorCount) ||
    symbol.level === maxLevel;

  const close = () => {
    setSelectorCount(NaN);
    onClose();
  };

  const apply = () => {
    track("tool_used", { tool: "selector", action: "apply" });
    setSymbols(
      updateSymbol(useAppStore.getState().symbols, selectedId, {
        level: selectorLevel,
        experience: selectorCount < remainingToMax ? selectorExp : 0,
      })
    );
    setSelectorCount(NaN);
  };

  /* ―――――――――――――――――――― Output ――――――――――――――――――――――――― */

  return (
    <Sheet
      open={open}
      onClose={close}
      title={tool === "selector" ? m.symbolSelector : catalystName}
      closeLabel={messages.next.calculator.toolsClose}
      anchor={anchor}
    >
      {tool === "selector" ? (
        <div className="flex flex-col gap-3">
          <NumberField
            label={m.countPlaceholder}
            placeholder={m.countPlaceholder}
            value={selectorCount}
            disabled={disabled || overflowing}
            onChange={(raw) =>
              setSelectorCount(
                isNaN(symbol.experience) ? NaN : clampNumberInput(raw, remainingToMax)
              )
            }
          />
          <PreviewRow
            before={displayPreview(symbol.level, symbol.experience)}
            after={isNaN(selectorCount) ? "? / ?" : displayPreview(selectorLevel, selectorExp)}
          />
          {overflowing && (
            <p className="text-xs text-tertiary">
              <Message text={m.disabledWhileUnlocked} />
            </p>
          )}
          <button
            type="button"
            disabled={applyDisabled}
            onClick={apply}
            className="rounded-lg bg-secondary px-4 py-2 text-sm text-secondary transition-colors hover:bg-hover hover:text-primary disabled:pointer-events-none disabled:opacity-25 motion-reduce:transition-none"
          >
            {m.apply}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <PreviewRow
            before={displayPreview(symbol.level, symbol.experience)}
            after={displayPreview(catalystLevel, catalystExp)}
            accentAfter
          />
          <p className="text-center text-sm text-tertiary">
            {symbol.level === 1 || isNaN(symbol.level)
              ? m.catalystLevelTooLow
              : symbol.type === "arcane"
                ? m.arcaneExpLoss
                : m.sacredExpLoss}
          </p>
          <p className="text-xs text-tertiary">
            {REGION_PROFILES[region].catalystRegularWorldOnly && (
              <>
                <Message text={m.catalystWorldTag} />{" "}
              </>
            )}
            <Message
              text={symbol.type === "arcane" ? m.arcaneCatalystTooltip : m.sacredCatalystTooltip}
            />
          </p>
        </div>
      )}
    </Sheet>
  );
};

export default ToolsSheet;
