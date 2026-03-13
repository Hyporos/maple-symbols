import { useEffect } from "react";
import { isValid, cn } from "../lib/utils";
import RadioButton from "./ui/RadioButton";
import { useAppStore } from "../state/store";
import { useBreakpoint } from "../hooks/useBreakpoint";

// Static map of selectedSymbol index → indicator-bar Tailwind translation class.
// Defined outside the component so it is never reallocated on re-renders.
const BAR_POSITIONS: Record<number, string> = {
  0: "translate-x-[-5px]",
  6: "translate-x-[-5px]",
  1: "translate-x-[75px]",
  7: "translate-x-[75px]",
  2: "translate-x-[155px]",
  8: "translate-x-[155px]",
  3: "translate-x-[235px]",
  9: "translate-x-[235px]",
  4: "translate-x-[315px]",
  10: "translate-x-[315px]",
  5: "translate-x-[395px]",
  11: "translate-x-[395px]",
};

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Selector component is the top bar which contains the list of symbols.
// * You can select a symbol by clicking on it, or swap symbol types using the radio buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Selector = () => {
  /* ―――――――――――――――――――― Declarations ―――――――――――――――――――― */

  const symbols = useAppStore((s) => s.symbols);
  const selectedSymbol = useAppStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useAppStore((s) => s.setSelectedSymbol);
  const swapped = useAppStore((s) => s.swapped);
  const setSwapped = useAppStore((s) => s.setSwapped);

  const { isMobile } = useBreakpoint();

  const selectedArcane = useAppStore((s) => s.selectedArcane);
  const setSelectedArcane = useAppStore((s) => s.setSelectedArcane);
  const selectedSacred = useAppStore((s) => s.selectedSacred);
  const setSelectedSacred = useAppStore((s) => s.setSelectedSacred);

  /* ―――――――――――――――――――― Functions ―――――――――――――――――――――― */

  // Select a symbol
  const handleSelect = (index: number) => {
    setSelectedSymbol(index);
    !swapped ? setSelectedArcane(index) : setSelectedSacred(index); // Remember which symbol was selected prior to swapping
  };

  // Set to the symbol selected prior to swapping
  useEffect(() => {
    setSelectedSymbol(swapped ? selectedSacred : selectedArcane);
  }, [swapped, selectedArcane, selectedSacred]);

  /* ―――――――――――――――――――― Output ――――――――――――――――――――――――― */

  return (
    <section className={cn("mx-4 flex justify-center")}>
      <div className="mb-6 flex w-[360px] max-w-[700px] flex-row items-center justify-between rounded-3xl bg-gradient-to-t from-card to-card-grad px-8 py-8 md:w-full md:items-stretch md:justify-center md:gap-11 md:py-6">
        {/* SWAP BUTTONS */}
        <div className="mb-1 flex flex-col justify-center gap-14 md:mb-0 md:justify-around md:gap-5">
          <RadioButton label="Arcane" selected={!swapped} onClick={() => setSwapped(false)} />
          <RadioButton label="Sacred" selected={swapped} onClick={() => setSwapped(true)} />
        </div>

        {/* DIVIDER */}
        <div className={cn("w-px bg-white/10", isMobile && "mx-4 h-[138px]")} />

        {/* SYMBOL LIST */}
        <div className="flex flex-col justify-center">
          <div className="flex w-[151px] flex-wrap justify-between gap-4 md:w-full md:gap-10">
            {symbols.map((symbol, index) => {
              const isSelected = selectedSymbol === index;
              return (
                symbol.type === (!swapped ? "arcane" : "sacred") && (
                  <button
                    key={index}
                    className={cn(
                      "flex cursor-pointer select-none flex-col items-center font-semibold text-accent transition-all hover:text-primary",
                      !isValid(symbol.level) && "text-secondary",
                      isSelected && "text-primary transition-none"
                    )}
                    onClick={() => handleSelect(index)}
                  >
                    <img
                      src={symbol.img}
                      alt={symbol.name}
                      width={!isMobile ? 40 : 35}
                      height={!isMobile ? 40 : 35}
                      className={cn("mb-1.5 scale-[103.5%]", !isValid(symbol.level) && "grayscale")}
                    />
                    <p className="text-[11px] leading-[15px] md:text-xs md:leading-[16px]">
                      Lv. {isValid(symbol.level) ? symbol.level : "0"}
                    </p>
                  </button>
                )
              );
            })}
          </div>

          {/* SELECTION BAR */}
          {!isMobile && (
            <div
              className={`mt-1 h-[3px] w-[40px] rounded-full bg-accent transition-all duration-[350ms] md:mt-3 md:w-[50px] ${BAR_POSITIONS[swapped ? selectedSacred : selectedArcane]}`}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Selector;
