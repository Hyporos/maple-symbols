import { useState } from "react";
import { HiChevronDown, HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import "./Levels.css";

interface Props {
  symbols: [
    {
      name: string;
      img: string;
      alt: string;
      type: string;
      level: number;
      symbolsRemaining: number;
      daysRemaining: number;
      completion: string;
    }
  ];
  swapped: boolean;
}

const Levels = ({ symbols, swapped }: Props) => {
  const [selectedSymbol, setSelectedSymbol] = useState(0);

  const today = new Date();
  const currentDay = String(today.getDate()).padStart(2, "0");
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
  const currentYear = today.getFullYear();
  const currentDate = `${currentYear}-${currentMonth}-${currentDay}`;

  return (
    <section className="levels">
        <div className="flex justify-center items-center bg-card rounded-lg w-[1050px] p-10 mt-16">
          <div className="flex flex-col w-[1050px]">
            <div className="flex items-center text-center text-tertiary">
              <HiOutlineQuestionMarkCircle size={30} className="w-1/4" />
              <p className="w-1/4 tracking-wider">Symbol</p>
              <p className="w-1/4 tracking-wider">Level</p>
              <p className="w-1/4 tracking-wider">Completion Date</p>
              <p className="w-1/4 tracking-wider">Symbols Remaining</p>
            </div>
            <hr className="horizontal-divider" />
            {symbols.map((symbol, index) =>
              !swapped
                ? symbol.type === "arcane" && (
                    <div onClick={() => setSelectedSymbol(index)}>
                      <div
                        className={`flex items-center text-center rounded-3xl transition-all hover:bg-dark cursor-pointer py-4 ${
                          isNaN(symbol.level) &&
                          "opacity-25 hover:bg-transparent cursor-default"
                        } ${
                          symbol.level === 20 &&
                          "cursor-default hover:bg-transparent"
                        }`}
                      >
                        <div className="w-1/4 flex justify-center">
                          <img
                            src={symbol.img}
                            alt={symbol.alt}
                            width={40}
                            className={`${
                              isNaN(symbol.level) && "filter grayscale"
                            }`}
                          ></img>
                        </div>
                        <p className="w-1/4 tracking-wider">{symbol.name}</p>
                        <p
                          className={`w-1/4 ${
                            isNaN(symbol.level)
                              ? "filter grayscale"
                              : "text-accent"
                          }`}
                        >
                          {symbol.level === 20
                            ? "MAX"
                            : isNaN(symbol.level)
                            ? "0"
                            : symbol.level}
                        </p>
                        <div className="w-1/4">
                          <p>
                            {symbol.level === 20 || isNaN(symbol.level)
                              ? "‎"
                              : symbol.completion === "NaN-NaN-NaN"
                              ? "Indefinite"
                              : symbol.daysRemaining === 0
                              ? "Complete"
                              : symbol.completion}{" "}
                          </p>
                          <p className="text-tertiary">
                            {symbol.level === 20 || isNaN(symbol.level)
                              ? "‎"
                              : String(symbol.daysRemaining) === "Infinity" ||
                                isNaN(symbol.daysRemaining)
                              ? "? days"
                              : symbol.daysRemaining === 0
                              ? "Ready for upgrade"
                              : symbol.daysRemaining > 1
                              ? symbol.daysRemaining + " days"
                              : symbol.daysRemaining + " day"}
                          </p>
                        </div>
                        <p className="w-1/4">
                          {symbol.level === 20 || isNaN(symbol.level)
                            ? "‎"
                            : isNaN(symbol.symbolsRemaining)
                            ? "?"
                            : symbol.symbolsRemaining === 0
                            ? "‎"
                            : symbol.symbolsRemaining}
                        </p>
                      </div>
                    </div>
                  )
                : symbol.type === "sacred" && (
                    <div onClick={() => setSelectedSymbol(index)}>
                      <div
                        className={`flex items-center text-center rounded-3xl transition-all hover:bg-dark cursor-pointer py-4 ${
                          isNaN(symbol.level) &&
                          "opacity-25 hover:bg-transparent cursor-default"
                        } ${
                          symbol.level === 20 &&
                          "cursor-default hover:bg-transparent"
                        }`}
                      >
                        <div className="w-1/4 flex justify-center">
                          <img
                            src={symbol.img}
                            alt={symbol.alt}
                            width={40}
                            className={`${
                              isNaN(symbol.level) && "filter grayscale"
                            }`}
                          ></img>
                        </div>
                        <p className="w-1/4 tracking-wider">{symbol.name}</p>
                        <p
                          className={`w-1/4 ${
                            isNaN(symbol.level)
                              ? "filter grayscale"
                              : "text-accent"
                          }`}
                        >
                          {symbol.level === 20
                            ? "MAX"
                            : isNaN(symbol.level)
                            ? "0"
                            : symbol.level}
                        </p>
                        <div className="w-1/4">
                          <p>
                            {symbol.level === 20 || isNaN(symbol.level)
                              ? "‎"
                              : symbol.completion === "NaN-NaN-NaN"
                              ? "Indefinite"
                              : symbol.daysRemaining === 0
                              ? "Complete"
                              : symbol.completion}{" "}
                          </p>
                          <p className="text-tertiary">
                            {symbol.level === 20 || isNaN(symbol.level)
                              ? "‎"
                              : String(symbol.daysRemaining) === "Infinity" ||
                                isNaN(symbol.daysRemaining)
                              ? "? days"
                              : symbol.daysRemaining === 0
                              ? "Ready for upgrade"
                              : symbol.daysRemaining > 1
                              ? symbol.daysRemaining + " days"
                              : symbol.daysRemaining + " day"}
                          </p>
                        </div>
                        <p className="w-1/4">
                          {symbol.level === 20 || isNaN(symbol.level)
                            ? "‎"
                            : isNaN(symbol.symbolsRemaining)
                            ? "?"
                            : symbol.symbolsRemaining === 0
                            ? "‎"
                            : symbol.symbolsRemaining}
                        </p>
                      </div>
                    </div>
                  )
            )}
          </div>
        </div>
    </section>
  );
};

export default Levels;
