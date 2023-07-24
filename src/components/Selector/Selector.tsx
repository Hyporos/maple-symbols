import { Dispatch, SetStateAction, useState } from "react";
import {
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
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
      <div className="flex flex-col items-center justify-center pt-8">
        <div className="flex tablet:items-center px-8">
          <HiChevronLeft
            size={40}
            className={"icon-button mt-2.5 tablet:mt-0"}
            onClick={() => {
              setSwapped(!swapped);
              !swapped
                ? setSelectedSymbol(selectedSacred)
                : setSelectedSymbol(selectedArcane);
            }}
          />
                             <div className="block tablet:hidden">
                      <hr className={`${!swapped && "ml-[-20px] translate-y-[55px] h-[57px] border-x border-white border-opacity-5 absolute"}`}></hr>
                      <hr className={`${!swapped && "ml-[-20px] translate-y-[112px] w-[40px] border-y border-white border-opacity-5 absolute"}`}></hr>
                      <hr className={`${!swapped && "ml-[-20px] translate-y-[55px] translate-x-[290px] h-[57px] border-x border-white border-opacity-5 absolute"}`}></hr>
                      <hr className={`${!swapped && "ml-[-20px] translate-y-[112px] translate-x-[252px] w-[40px] border-y border-white border-opacity-5 absolute"}`}></hr>
                    </div>
          <div className="tablet:space-x-10 flex flex-wrap justify-center w-[250px] tablet:w-full ">
            {symbols.map(
              (symbol, index) =>
                symbol.type === (!swapped ? "arcane" : "sacred") && (
                  <div key={index} className={`group ${symbol.id < 3 && "mb-8 tablet:mb-0"} mx-4 tablet:mx-0`}>
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
          <HiChevronRight
            size={40}
            className={"icon-button mt-2.5 tablet:mt-0"}
            onClick={() => {
              setSwapped(!swapped);
              !swapped
                ? setSelectedSymbol(selectedSacred)
                : setSelectedSymbol(selectedArcane);
            }}
          />
        </div>
        <hr className="horizontal-divider flex justify-center" />
      </div>
    </section>
  );
};

export default Selector;
