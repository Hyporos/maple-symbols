import { HiArrowsUpDown, HiBars3 } from "react-icons/hi2";
import { Dispatch, SetStateAction } from "react";
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
  const handleSettings = () => {};

  return (
    <section className="selector">
      <div className="flex flex-col justify-center pt-16">
        <div className="flex justify-between items-center px-8">
          <div>
            <HiBars3
              size={40}
              cursor="pointer"
              className={"fill-basic hover:fill-hover transition-all"}
              onClick={() => handleSettings()}
            />
          </div>
          <div className="flex space-x-10">
            {symbols.map((symbol, index) =>
              !swapped
                ? symbol.type === "arcane" && (
                    <div
                      className={`selector-level cursor-pointer ${
                        selectedSymbol === index
                          ? "text-primary"
                          : isNaN(symbol.level) && "text-secondary"
                      }`}
                      onClick={() => setSelectedSymbol(index)}
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
                  )
                : symbol.type === "sacred" && (
                    <div
                      className={`selector-level cursor-pointer ${
                        selectedSymbol === index
                          ? "text-primary"
                          : isNaN(symbol.level) && "text-secondary"
                      }`}
                      onClick={() => setSelectedSymbol(index)}
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
                  )
            )}
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
