import { HiArrowsUpDown, HiBars3 } from "react-icons/hi2";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./Selector.css";

interface Props {
  symbols: [
    {
      name: string;
      alt: string;
      img: string;
      type: string;
      level: number;
    }
  ];
  swapped: boolean;
  setSwapped: Dispatch<SetStateAction<boolean>>;
  selectedSymbol: number;
  setSelectedSymbol: Dispatch<SetStateAction<number>>;
}

const Selector = ({
  symbols,
  swapped,
  setSwapped,
  selectedSymbol,
  setSelectedSymbol,
}: Props) => {
  const [selectedArcane, setSelectedArcane] = useState(0);
  const [selectedSacred, setSelectedSacred] = useState(6);

  return (
    <section className="selector">
      <div className="flex flex-col justify-center pt-12">
        <div className="flex justify-between items-center px-8">
          <HiBars3
            size={40}
            className={"icon-button opacity-25 cursor-default hover:fill-basic"}
            onClick={() => console.log("Settings Clicked")}
          />
          <div className="flex space-x-10">
            {symbols.map(
              (symbol, index) =>
                symbol.type === (!swapped ? "arcane" : "sacred") && (
                  <div className="group">
                    <div
                      className={`selector-level ${
                        selectedSymbol === index
                          ? "text-primary"
                          : isNaN(symbol.level) && "text-secondary"
                      }`}
                      onClick={() => {
                        setSelectedSymbol(index);
                        !swapped
                          ? setSelectedArcane(index)
                          : setSelectedSacred(index);
                      }}
                    >
                      <img
                        src={symbol.img}
                        alt={symbol.alt}
                        className={`${
                          symbols[selectedSymbol].name === symbol.name &&
                          "translate-y-symbol"
                        }  ${isNaN(symbol.level) && "filter grayscale"}`}
                      />
                      <p>
                        {isNaN(symbol.level) ? "Lv. 0" : "Lv. " + symbol.level}
                      </p>
                    </div>
                  </div>
                )
            )}
          </div>
          <HiArrowsUpDown
            size={40}
            className={"icon-button"}
            onClick={() => {
              setSwapped(!swapped);
              !swapped
                ? setSelectedSymbol(selectedSacred)
                : setSelectedSymbol(selectedArcane);
            }}
          />
        </div>
        <hr className="horizontal-divider" />
      </div>
    </section>
  );
};

export default Selector;
