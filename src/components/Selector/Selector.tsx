import { HiArrowsUpDown, HiBars3 } from "react-icons/hi2";
import { Dispatch, SetStateAction } from "react";
import "./Selector.css";

interface Props {
  swapped: boolean;
  setSwapped: Dispatch<SetStateAction<boolean>>;
  selectedArcane: number;
  setSelectedArcane: Dispatch<SetStateAction<Number>>;
  selectedSacredSymbol: number;
  setSelectedSacredSymbol: Dispatch<SetStateAction<Number>>;
  arcaneSymbols: [{}];
  sacredSymbols: [{}];
}

const Selector = ({
  swapped,
  setSwapped,
  selectedArcane,
  setSelectedArcane,
  selectedSacredSymbol,
  setSelectedSacredSymbol,
  arcaneSymbols,
  sacredSymbols
}: Props) => {
  const handleSettings = () => {};

  return (
    <section>
      <div className="flex flex-col justify-center pt-16 mt-40">
        <div className="flex justify-between items-center px-6">
          <div>
            <HiBars3
              size={40}
              cursor="pointer"
              className={"fill-basic hover:fill-hover transition-all"}
              onClick={() => handleSettings()}
            />
          </div>
          <div className={`flex space-x-10 ${swapped ? "hidden" : "block"}`}>
            {arcaneSymbols.map((symbol, index) => (
              <div
                className={`selector-level cursor-pointer ${
                  selectedArcane === index
                    ? "text-primary"
                    : isNaN(symbol.level) && "text-secondary"
                }`}
                onClick={() => setSelectedArcane(index)}
              >
                <img
                  src={symbol.img}
                  alt={symbol.alt}
                  className={`${
                    arcaneSymbols[selectedArcane].name === symbol.name && "translate-y-symbol"
                  }  ${isNaN(symbol.level) && "filter grayscale"}`}
                />
                <p>
                  {isNaN(symbol.level)
                    ? "Lv. 0"
                    : "Lv. " + symbol.level}
                </p>
              </div>
            ))}
          </div>
          <div className={`flex space-x-10 ${swapped ? "block" : "hidden"}`}>
            {sacredSymbols.map((symbol, index) => (
              <div
                className={`selector-level cursor-pointer ${
                  selectedSacredSymbol === index
                    ? "text-primary"
                    : isNaN(symbol.level) && "text-secondary" 
                }`}
                onClick={() => setSelectedSacredSymbol(index)}
              >
                <img
                  src={symbol.img}
                  alt={symbol.alt}
                  className={`${
                    sacredSymbols[selectedSacredSymbol].name === symbol.name && "translate-y-symbol"
                  }  ${isNaN(symbol.level) && "filter grayscale"}`}
                />
                <p>
                  {isNaN(symbol.level)
                    ? "Lv. 0"
                    : "Lv. " + symbol.level}
                </p>
              </div>
            ))}
          </div>
          <div>
            <HiArrowsUpDown
              size={40}
              cursor="pointer"
              className={"fill-basic hover:fill-hover transition-all"}
              onClick={() => setSwapped(!swapped)}
            />
          </div>
        </div>
        <hr className="horizontal-divider" />
      </div>
    </section>
  );
};

export default Selector;
