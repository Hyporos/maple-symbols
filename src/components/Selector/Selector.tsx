import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { isValid } from "../../lib/utils";
import { cn } from "../../lib/utils";
import "./Selector.css";

import RadioButton from "../RadioButton";

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
  swapped: boolean;
  setSwapped: Dispatch<SetStateAction<boolean>>;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Selector component is the top bar which contains the list of symbols.
// * You can select a symbol by clicking on it, or swap symbol types using the radio buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Selector = ({
  symbols,
  swapped,
  setSwapped,
  selectedSymbol,
  setSelectedSymbol,
}: Props) => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  const isMobile = useMediaQuery({ query: `(max-width: 799px)` });

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
    setSelectedSymbol(index);
    !swapped ? setSelectedArcane(index) : setSelectedSacred(index); // Remember which symbol was selected prior to swapping
  };

  // Set to the symbol selected prior to swapping
  useEffect(() => {
    setSelectedSymbol(swapped ? selectedSacred : selectedArcane);
  }, [swapped]);

  /* ―――――――――――――――――――― Output ――――――――――――――――――――――――― */

  return (
    <section className="selector">
      <div className="flex flex-col justify-center items-center tablet:items-stretch w-[350px] tablet:w-[700px]">
        <div className="flex bg-gradient-to-t from-card to-card-grad rounded-3xl py-8 tablet:pt-6 tablet:pb-[22px] mb-6">
          <div className="flex flex-col tablet:flex-row justify-center items-center tablet:items-stretch tablet:gap-11 w-[350px] tablet:w-full">
            {/* SWAP BUTTONS */}
            <div className="flex tablet:flex-col gap-12 tablet:gap-0 tablet:gap-5 mb-6 tablet:mb-0">
              <RadioButton
                label="Arcane"
                value={false}
                toggled={!swapped}
                setValue={setSwapped}
              />
              <RadioButton
                label="Sacred"
                value={true}
                toggled={swapped}
                setValue={setSwapped}
              />
            </div>

            {/* DIVIDERS */}
            {isMobile ? (
              <div className="bg-white/10 h-px w-[250px] mb-6" />
            ) : (
              <div className="bg-white/10 w-px" />
            )}

            {/* SYMBOL LIST */}
            <div className="flex flex-col">
              <div className="flex flex-wrap justify-center tablet:gap-10 w-[250px] tablet:w-full">
                {symbols.map((symbol, index) => {
                  const isSelected = selectedSymbol === index;
                  return (
                    symbol.type === (!swapped ? "arcane" : "sacred") && (
                      <div
                        key={index}
                        className={cn(
                          "group mx-4 tablet:mx-0", // Add spacing around symbols if on mobile
                          symbol.id === (!swapped ? 1 : 7) && "mb-8 tablet:mb-0"
                        )}
                      >
                        <div
                          className={cn(
                            "flex flex-col items-center text-accent hover:text-primary font-semibold cursor-pointer select-none transition-all",
                            !isValid(symbol.level) && "text-secondary",
                            isSelected && "text-primary"
                          )}
                          onClick={() => handleSelect(index)}
                        >
                          <img
                            src={symbol.img}
                            alt={symbol.alt}
                            width={40}
                            height={40}
                            className={cn(
                              "scale-[103.5%] duration-300 mb-1.5",
                              !isValid(symbol.level) && "grayscale",
                              isSelected && ""
                            )}
                          />
                          <p className={`text-xs`}>
                            Lv. {isValid(symbol.level) ? symbol.level : "0"}
                          </p>
                        </div>
                      </div>
                    )
                  );
                })}
              </div>

              {/* SELECTION BAR */}
              {!isMobile && (
                <div
                  className={`bg-accent w-[40px] tablet:w-[50px] h-[3px] rounded-full mt-1 tablet:mt-3 transition-all duration-[350ms] ${barPositions[selectedSymbol]}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Selector;
