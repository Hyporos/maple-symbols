import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { isValid } from "../lib/utils";
import { cn } from "../lib/utils";
import { useDispatch, useSelector } from "react-redux";
import RadioButton from "./RadioButton";
import { RootState } from "../state/store";
import { setSwapped } from "../state/selector/selectorSlice";

interface Props {
  symbols: [
    {
      id: number;
      alt: string;
      img: string;
      type: string;
      level: number;
    }
  ];
  selectedSymbol: number;
  setSelectedSymbol: Dispatch<SetStateAction<number>>;
  selectedPage: number;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Selector component is the top bar which contains the list of symbols.
// * You can select a symbol by clicking on it, or swap symbol types using the radio buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Selector = ({
  symbols,
  selectedSymbol,
  setSelectedSymbol,
  selectedPage,
}: Props) => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  const dispatch = useDispatch();

  const swapped = useSelector((state: RootState) => state.selector.swapped);

  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });

  const [selectedArcane, setSelectedArcane] = useState(0);
  const [selectedSacred, setSelectedSacred] = useState(6);

  // Possible positions for the selection bar to hover under symbol icons
  const barPositions: { [index: number]: string } = {
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

  /* ―――――――――――――――――――― Functions ―――――――――――――――――――――― */

  // Select a symbol
  const handleSelect = (index: number) => {
    console.log("Symbol selected");
    setSelectedSymbol(index);
    !swapped ? setSelectedArcane(index) : setSelectedSacred(index); // Remember which symbol was selected prior to swapping
  };

  // Set to the symbol selected prior to swapping
  useEffect(() => {
    console.log(selectedSacred, selectedArcane);
    setSelectedSymbol(swapped ? selectedSacred : selectedArcane);
    console.log("Symbol set");
  }, [swapped]);

  /* ―――――――――――――――――――― Output ――――――――――――――――――――――――― */

  return (
    <section
      className={cn("flex justify-center mx-4", selectedPage === 3 && "hidden")}
    >
      <div className="flex flex-row justify-between md:justify-center items-center md:items-stretch bg-gradient-to-t from-card to-card-grad rounded-3xl md:gap-11 px-8 py-8 md:py-6 mb-6 w-[360px] md:w-full max-w-[700px]">
        {/* SWAP BUTTONS */}
        <div className="flex flex-col justify-center md:justify-around gap-14 md:gap-5 mb-1 md:mb-0">
          <RadioButton
            label="Arcane"
            selected={!swapped}
            setValue={setSwapped(false)}
          />
          <RadioButton
            label="Sacred"
            selected={swapped}
            setValue={setSwapped(true)}
          />
        </div>

        {/* DIVIDER */}
        <div className={cn("bg-white/10 w-px", isMobile && "h-[138px] mx-4")} />

        {/* SYMBOL LIST */}
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap justify-between gap-4 md:gap-10 w-[151px] md:w-full">
            {symbols.map((symbol, index) => {
              const isSelected = selectedSymbol === index;
              return (
                symbol.type === (!swapped ? "arcane" : "sacred") && (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col items-center text-accent hover:text-primary font-semibold cursor-pointer select-none transition-all",
                      !isValid(symbol.level) && "text-secondary",
                      isSelected && "text-primary transition-none"
                    )}
                    onClick={() => handleSelect(index)}
                  >
                    <img
                      src={symbol.img}
                      alt={symbol.alt}
                      width={!isMobile ? 40 : 35}
                      height={!isMobile ? 40 : 35}
                      className={cn(
                        "scale-[103.5%] mb-1.5",
                        !isValid(symbol.level) && "grayscale"
                      )}
                    />
                    <p className="text-[11px] md:text-xs leading-[15px] md:leading-[16px]">
                      Lv. {isValid(symbol.level) ? symbol.level : "0"}
                    </p>
                  </div>
                )
              );
            })}
          </div>

          {/* SELECTION BAR */}
          {!isMobile && !swapped && (
            <div
              className={`bg-accent w-[40px] md:w-[50px] h-[3px] rounded-full mt-1 md:mt-3 transition-all duration-[350ms] ${barPositions[selectedArcane]}`}
            />
          )}
          {!isMobile && swapped && (
            <div
              className={`bg-accent w-[40px] md:w-[50px] h-[3px] rounded-full mt-1 md:mt-3 transition-all duration-[350ms] ${barPositions[selectedSacred]}`}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Selector;
