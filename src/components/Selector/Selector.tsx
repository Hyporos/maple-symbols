import { Dispatch, SetStateAction, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip/Tooltip";
import { HiArrowsUpDown, HiBars3 } from "react-icons/hi2";
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
          <Tooltip placement="left">
            <TooltipTrigger>
              <HiBars3
                size={40}
                className={
                  "icon-button opacity-25 hover:opacity-100 cursor-default hover:fill-basic"
                }
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              />
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              <span className="text-red-500">[Unavailable]</span>
              <br></br>The information & settings section <br></br> will be
              added in a future update <br></br> <br></br>
              <hr></hr>
              <br></br> <span className="text-red-500">TEST BUILD</span> ━ Click
              to clear data
            </TooltipContent>
          </Tooltip>
          <div className="flex space-x-10">
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
