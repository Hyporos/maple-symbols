import { isValid, cn } from "../lib/utils";
import RadioButton from "./ui/RadioButton";
import { useAppStore, useMode } from "../state/store";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { track } from "../lib/analytics";
import type { Mode } from "../lib/types";
import { interpolate, useNameSet, useMessages } from "../i18n";
import { symbolNames } from "../i18n/gameNames";

// Indicator-bar translation per position within the six symbols of a type
// (80 px pitch = 40 px icon + md:gap-10). Static so Tailwind can see the classes.
const BAR_POSITIONS = [
  "translate-x-[-5px]",
  "translate-x-[75px]",
  "translate-x-[155px]",
  "translate-x-[235px]",
  "translate-x-[315px]",
  "translate-x-[395px]",
];

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Selector component is the top bar which contains the list of symbols.
// * You can select a symbol by clicking on it, or switch symbol types using the radio buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Selector = () => {
  /* ―――――――――――――――――――― Declarations ―――――――――――――――――――― */

  const m = useMessages().shell;
  const nameSet = useNameSet();

  const symbols = useAppStore((s) => s.symbols);
  const mode = useMode();
  const setMode = useAppStore((s) => s.setMode);
  const selectedId = useAppStore((s) => s.selectedId);
  const selectSymbol = useAppStore((s) => s.selectSymbol);

  const { isMobile } = useBreakpoint();

  const switchMode = (to: Mode) => {
    if (to !== mode) track("mode_switch", { to });
    setMode(to);
  };

  const shown = symbols.filter((symbol) => symbol.type === mode);
  const selectedPosition = Math.max(
    0,
    shown.findIndex((symbol) => symbol.id === selectedId)
  );

  /* ―――――――――――――――――――― Output ――――――――――――――――――――――――― */

  return (
    <section className="mx-4 flex justify-center">
      <div className="mb-6 flex w-[360px] max-w-[700px] flex-row items-center justify-between rounded-3xl bg-linear-to-t from-card to-card-grad px-8 py-8 md:w-full md:items-stretch md:justify-center md:gap-11 md:py-6">
        {/* MODE BUTTONS */}
        <div
          role="radiogroup"
          aria-label={m.symbolType}
          className="mb-1 flex flex-col justify-center gap-14 md:mb-0 md:justify-around md:gap-5"
        >
          <RadioButton
            label={m.arcane}
            selected={mode === "arcane"}
            onClick={() => switchMode("arcane")}
          />
          <RadioButton
            label={m.sacred}
            selected={mode === "sacred"}
            onClick={() => switchMode("sacred")}
          />
        </div>

        {/* DIVIDER */}
        <div className={cn("w-px bg-white/10", isMobile && "mx-4 h-[138px]")} />

        {/* SYMBOL LIST */}
        <div className="flex flex-col justify-center">
          <div className="flex w-[151px] flex-wrap justify-between gap-4 md:w-full md:gap-10">
            {shown.map((symbol) => {
              const isSelected = selectedId === symbol.id;
              return (
                <button
                  key={symbol.id}
                  className={cn(
                    "flex cursor-pointer flex-col items-center font-semibold text-accent transition-all select-none hover:text-primary",
                    !isValid(symbol.level) && "text-secondary",
                    isSelected && "text-primary transition-none"
                  )}
                  onClick={() => {
                    if (!isSelected) track("symbol_select", { symbol: symbol.name, mode });
                    selectSymbol(symbol.id);
                  }}
                >
                  <img
                    src={symbol.img}
                    alt={symbolNames(symbol, nameSet).name}
                    width={!isMobile ? 40 : 35}
                    height={!isMobile ? 40 : 35}
                    className={cn("mb-1.5 scale-[103.5%]", !isValid(symbol.level) && "grayscale")}
                  />
                  <p className="text-[11px] leading-[15px] md:text-xs md:leading-[16px]">
                    {interpolate(m.symbolLevel, {
                      level: isValid(symbol.level) ? symbol.level : 0,
                    })}
                  </p>
                </button>
              );
            })}
          </div>

          {/* SELECTION BAR */}
          {!isMobile && (
            <div
              className={cn(
                "mt-1 h-[3px] w-[40px] rounded-full bg-accent transition-all duration-350 md:mt-3 md:w-[50px]",
                BAR_POSITIONS[selectedPosition]
              )}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Selector;
