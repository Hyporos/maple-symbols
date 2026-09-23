import { useBreakpoint } from "../../hooks/useBreakpoint";
import { usePower } from "../../hooks/usePower";
import { track } from "../../lib/analytics";
import { formatNumber } from "../../lib/format";
import { inFamily, MAX_POWER_PER_SYMBOL, maxLevelFor } from "../../lib/game";
import type { SymbolType } from "../../lib/types";
import { cn, isMaxLevel, isValid } from "../../lib/utils";
import { interpolate, useLocale, useMessages, useNameSet } from "../../i18n";
import { symbolNames } from "../../i18n/gameNames";
import Message from "../../i18n/Message";
import { useAppStore } from "../../state/store";
import { Card, ProgressRing, SegmentedSwitch } from "../ui";

// The caption under a chip whose level is not entered yet.
const UNSET_CAPTION = "–";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * SymbolPicker is the /next calculator's family switch (Arcane · Sacred · Grand) and one chip per
// * symbol of that family, each with a ring filling toward max level, then the family's power.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const SymbolPicker = () => {
  /* ―――――――――――――――――――― Declarations ―――――――――――――――――――― */

  const messages = useMessages();
  const m = messages.next.calculator;
  const locale = useLocale();
  const nameSet = useNameSet();

  const symbols = useAppStore((s) => s.symbols);
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const selectedId = useAppStore((s) => s.selectedId);
  const selectSymbol = useAppStore((s) => s.selectSymbol);

  const { isMobile } = useBreakpoint();

  // Grand Sacred's power counts toward Sacred Power, so the Grand tab shows the Sacred total.
  const powerFamily = mode === "grand" ? "sacred" : mode;
  const power = usePower(symbols, powerFamily);
  const maxPower = symbols
    .filter((symbol) => inFamily(symbol.type, powerFamily))
    .reduce((sum, symbol) => sum + MAX_POWER_PER_SYMBOL[symbol.type], 0);

  const shown = symbols.filter((symbol) => symbol.type === mode);

  const switchMode = (to: SymbolType) => {
    if (to !== mode) track("mode_switch", { to });
    setMode(to);
  };

  /* ―――――――――――――――――――― Output ――――――――――――――――――――――――― */

  return (
    <Card as="section" label={m.pickerLabel}>
      <SegmentedSwitch
        label={m.familyLabel}
        options={[
          { value: "arcane", label: messages.shell.arcane },
          { value: "sacred", label: messages.shell.sacred },
          { value: "grand", label: m.familyGrand },
        ]}
        value={mode}
        onChange={switchMode}
      />

      <div className="mt-4 grid grid-cols-6 gap-1 md:gap-2">
        {shown.map((symbol) => {
          const selected = symbol.id === selectedId;
          const max = maxLevelFor(symbol.type);
          const label = interpolate(
            m.symbolLevel,
            {
              symbol: symbolNames(symbol, nameSet).name,
              level: isValid(symbol.level) ? symbol.level : 0,
              max,
            },
            locale
          );
          return (
            <button
              key={symbol.id}
              type="button"
              aria-pressed={selected}
              aria-label={label}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-xl p-1 transition-colors motion-reduce:transition-none",
                selected
                  ? "bg-secondary shadow-[inset_0_0_0_1px_var(--color-accent)]"
                  : "hover:bg-light"
              )}
              onClick={() => {
                if (!selected) track("symbol_select", { symbol: symbol.name, mode });
                selectSymbol(symbol.id);
              }}
            >
              <ProgressRing value={symbol.level} max={max} label={label} size={isMobile ? 36 : 44}>
                <img
                  src={symbol.img}
                  alt=""
                  width={isMobile ? 24 : 30}
                  height={isMobile ? 24 : 30}
                  className={cn(!isValid(symbol.level) && "grayscale")}
                />
              </ProgressRing>
              <p
                className={cn(
                  "text-xs",
                  isMaxLevel(symbol.level, symbol.type) ? "text-accent" : "text-secondary"
                )}
              >
                {isMaxLevel(symbol.level, symbol.type)
                  ? m.maxShort
                  : isValid(symbol.level)
                    ? formatNumber(symbol.level, locale)
                    : UNSET_CAPTION}
              </p>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-secondary">
        <Message
          text={m.familyPower}
          values={{
            power: messages.graph.power[powerFamily],
            value: formatNumber(power, locale),
            max: formatNumber(maxPower, locale),
          }}
        />
      </p>
    </Card>
  );
};

export default SymbolPicker;
