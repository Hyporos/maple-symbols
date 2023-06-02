import { HiArrowsUpDown, HiBars3 } from "react-icons/hi2";
import { Dispatch, SetStateAction } from "react";
import "./Selector.css";

interface Props {
  swapped: boolean;
  setSwapped: Dispatch<SetStateAction<boolean>>;
  selectedArcaneSymbol: string;
  setSelectedArcaneSymbol: Dispatch<SetStateAction<string>>;
  selectedSacredSymbol: string;
  setSelectedSacredSymbol: Dispatch<SetStateAction<string>>;
  vjLevel: number;
}

const Selector = ({
  swapped,
  setSwapped,
  selectedArcaneSymbol,
  setSelectedArcaneSymbol,
  selectedSacredSymbol,
  setSelectedSacredSymbol,
  vjLevel,
}: Props) => {
  const handleSettings = () => {};

  const arcaneSymbols = [
    {
      name: "VJ",
      alt: "Vanishing Journey Symbol",
      img: "/symbols/vj-symbol.webp",
      level: vjLevel,
    },
    {
      name: "ChuChu",
      alt: "Chu Chu Symbol",
      img: "/symbols/chuchu-symbol.webp",
      level: vjLevel,
    },
    {
      name: "Lachelein",
      alt: "Lachelein Symbol",
      img: "/symbols/lach-symbol.webp",
      level: vjLevel,
    },
    {
      name: "Arcana",
      alt: "Arcana Symbol",
      img: "/symbols/arcana-symbol.webp",
      level: vjLevel,
    },
    {
      name: "Morass",
      alt: "Morass Symbol",
      img: "/symbols/morass-symbol.webp",
      level: vjLevel,
    },
    {
      name: "Esfera",
      alt: "Esfera Symbol",
      img: "/symbols/esfera-symbol.webp",
      level: vjLevel,
    },
  ];

  const sacredSymbols = [
    {
      name: "Cernium",
      alt: "Cernium Symbol",
      img: "/symbols/cern-symbol.webp",
      level: vjLevel,
    },
    {
      name: "Arcus",
      alt: "Arcus Symbol",
      img: "/symbols/arcus-symbol.webp",
      level: vjLevel,
    },
    {
      name: "Odium",
      alt: "Odium Symbol",
      img: "/symbols/odium-symbol.webp",
      level: vjLevel,
    },
  ];

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
            {arcaneSymbols.map((symbol) => (
              <div
                className={`selector-level cursor-pointer ${
                  selectedArcaneSymbol === symbol.name
                    ? "text-primary"
                    : isNaN(symbol.level) && "text-secondary"
                }`}
                onClick={() => setSelectedArcaneSymbol(symbol.name)}
              >
                <img
                  src={symbol.img}
                  alt={symbol.alt}
                  className={`${
                    selectedArcaneSymbol === symbol.name && "translate-y-symbol"
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
            {sacredSymbols.map((symbol) => (
              <div
                className={`selector-level cursor-pointer ${
                  selectedSacredSymbol === symbol.name
                    ? "text-primary"
                    : isNaN(symbol.level) && "text-secondary" 
                }`}
                onClick={() => setSelectedSacredSymbol(symbol.name)}
              >
                <img
                  src={symbol.img}
                  alt={symbol.alt}
                  className={`${
                    selectedSacredSymbol === symbol.name && "translate-y-symbol"
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
