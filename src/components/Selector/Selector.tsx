import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
  const handleSwap = (state: boolean) => {
    setSwapped(state);
    setSelectedSymbol(state === true ? selectedSacred : selectedArcane);
  };

  const [barTranslation, setBarTranslation] = useState("translate-x-[-5px]");

  useEffect(() => {
    switch (selectedSymbol) {
      case 0:
        case 6:
        setBarTranslation("translate-x-[-5px]");
        break;
      case 1:
        case 7:
        setBarTranslation("translate-x-[75px]");
        break;
      case 2:
        case 8:
        setBarTranslation("translate-x-[155px]");
        break;
      case 3:
        case 9:
        setBarTranslation("translate-x-[235px]");
        break;
      case 4:
        case 10:
        setBarTranslation("translate-x-[315px]");
        break;
      case 5:
        case 11:
        setBarTranslation("translate-x-[395px]");
        break;
    }
  }, [selectedSymbol]);

  return (
    <section className="selector">
      <div className="flex flex-col justify-center items-center tablet:items-stretch w-[350px]  tablet:w-[700px]">
        <div className="flex tablet:items-center bg-card py-6 rounded-3xl mb-6">
          <div className="flex flex-wrap justify-center tablet:space-x-11 w-[250px] tablet:w-full">
            <div className="flex flex-col space-y-5">
              <div
                className="flex items-center space-x-4 cursor-pointer"
                onClick={() => handleSwap(false)}
              >
                <div
                  className={`${
                    swapped ? "" : "bg-accent"
                  } border-[3px] border-secondary rounded-full h-[20px] w-[20px] transition-all`}
                ></div>
                <p>Arcane</p>
              </div>
              <div
                className="flex items-center space-x-4 cursor-pointer"
                onClick={() => handleSwap(true)}
              >
                <div
                  className={`${
                    swapped ? "bg-accent" : ""
                  } border-[3px] border-secondary rounded-full h-[20px] w-[20px] transition-all`}
                ></div>
                <p>Sacred</p>
              </div>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="flex flex-col">
              <div className="flex flex-wrap justify-center tablet:space-x-10 w-[250px] tablet:w-full">
                {symbols.map(
                  (symbol, index) =>
                    symbol.type === (!swapped ? "arcane" : "sacred") && (
                      <div
                        key={index}
                        className={`group mx-4 tablet:mx-0 ${
                          // TODO: Use logic that is more self explanatory
                          // Add spacing between top and bottom symbols if on mobile
                          symbol.id === (!swapped ? 1 : 7) && "mb-8 tablet:mb-0"
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
                              selectedSymbol === index && "scale-105"
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
              <div
                className={`h-[3px] rounded-full mt-3 w-[50px] bg-accent transition-all duration-[300ms] ${barTranslation}`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Selector;
