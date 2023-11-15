import { Dispatch, SetStateAction, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import "./Selector.css";

interface Props {
  symbols: [
    {
      id: number;
      name: string;
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
// * You can select a symbol by clicking on it, or swap from Arcane to Sacred using the arrows.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Selector = ({
  symbols,
  swapped,
  setSwapped,
  selectedSymbol,
  setSelectedSymbol,
}: Props) => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  const [selectedArcane, setSelectedArcane] = useState(0);
  const [selectedSacred, setSelectedSacred] = useState(6);

  /* ―――――――――――――――――――― Functions ―――――――――――――――――――――― */

  // Check if the specified value is valid (not empty)
  const isValid = (value: number) => {
    return !isNaN(value) && value !== null;
  };

  // Select a symbol
  const handleSelect = (index: number) => {
    setSelectedSymbol(index);
    !swapped ? setSelectedArcane(index) : setSelectedSacred(index);
  };

  // Swap from Arcane to Sacred symbols
  const handleSwap = () => {
    setSwapped(!swapped);
    setSelectedSymbol(!swapped ? selectedSacred : selectedArcane);
  };

  return (
    <section className="selector">
      <div className="flex flex-col justify-center items-center tablet:items-stretch w-[350px] tablet:w-[700px]">
        <div className="flex tablet:items-center mx-8">
          <HiChevronLeft
            size={40}
            className={"swap-icon"}
            onClick={() => handleSwap()}
          />
          <div className={`block tablet:hidden`}>
            <hr className="mobile-lines-x"></hr>
            <hr className="mobile-lines-y"></hr>
            <hr className="mobile-lines-x translate-x-[290px]"></hr>
            <hr className="mobile-lines-y translate-x-[252px]"></hr>
          </div>
          <div className="flex flex-wrap justify-center tablet:space-x-10 w-[250px] tablet:w-full">
            {symbols.map(
              (symbol, index) =>
                symbol.type === (!swapped ? "arcane" : "sacred") && (
                  <div
                    key={index}
                    className={`group mx-4 tablet:mx-0 ${
                      // TODO: Use logic that is more self explanatory
                      // Add spacing between top and bottom symbols if on mobile
                      symbol.id === (!swapped ? 1 : 7)&& "mb-8 tablet:mb-0"
                    }`}
                  >
                    <div
                      className={`selector-level ${
                        selectedSymbol === index
                          ? "text-primary"
                          : !isValid(symbol.level) && "text-secondary"
                      }`}
                      onClick={() => handleSelect(index)}
                    >
                      <img
                        src={symbol.img}
                        alt={symbol.alt}
                        className={`${
                          selectedSymbol === index && "translate-y-[-7.5px]"
                        }  ${!isValid(symbol.level) && "filter grayscale"}`}
                      />
                      <p className={`text-xs`}>
                        {isValid(symbol.level)
                          ? "Lv. " + symbol.level
                          : "Lv. 0"}
                      </p>
                    </div>
                  </div>
                )
            )}
          </div>
          <HiChevronRight
            size={40}
            className={"swap-icon"}
            onClick={() => handleSwap()}
          />
        </div>
        <hr className="horizontal-divider" />
      </div>
    </section>
  );
};

export default Selector;
