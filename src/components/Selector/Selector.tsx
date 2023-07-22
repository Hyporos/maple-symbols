import { Dispatch, SetStateAction, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip/Tooltip";
import {
  HiArrowsUpDown,
  HiBars3,
  HiChevronLeft,
  HiChevronRight,
  HiChevronDown,
} from "react-icons/hi2";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
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
        <div className="flex justify-center tablet:justify-between items-center px-8 space-x-10 tablet:space-x-0">
          <HiChevronLeft
            size={40}
            className={"icon-button"}
            onClick={() => {
              setSwapped(!swapped);
              !swapped
                ? setSelectedSymbol(selectedSacred)
                : setSelectedSymbol(selectedArcane);
            }}
          />
          <div className="hidden space-x-10 tablet:flex">
            {symbols.map(
              (symbol, index) =>
                symbol.type === (!swapped ? "arcane" : "sacred") && (
                  <div key={index} className="group">
                    <div
                      className={`selector-level ${
                        selectedSymbol === index
                          ? "text-primary"
                          : (isNaN(symbol.level) || symbol.level === null) &&
                            "text-secondary"
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
                        }  ${
                          (isNaN(symbol.level) || symbol.level === null) &&
                          "filter grayscale"
                        }`}
                      />
                      <p>
                        {isNaN(symbol.level) || symbol.level === null
                          ? "Lv. 0"
                          : "Lv. " + symbol.level}
                      </p>
                    </div>
                  </div>
                )
            )}
          </div>
          <div className="flex flex-row tablet:hidden cursor-pointer space-x-8 p-2 justify-center items-center shadow-accent shadow-level bg-card rounded-2xl" onClick={() => console.log("tes")}>
              <img
                src={symbols[selectedSymbol].img}
                alt={symbols[selectedSymbol].alt}
              ></img>
              <HiChevronDown size={40} />
          </div>
          <HiChevronRight
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
