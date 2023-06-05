import { useState } from "react";
import { HiChevronDown, HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import "./Levels.css";

interface Props {
  symbols: [
    {
      name: string;
      level: number;
      symbolsRemaining: number;
    }
  ];
}

const Levels = ({ symbols }: Props) => {
  const [selectedSymbol, setSelectedSymbol] = useState(0);

  return (
    <section className="levels">
      <div className="flex justify-center items-center">
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
            {symbols.map((symbol, index) => (
              <div onClick={() => setSelectedSymbol(index)}>
                <div className="flex items-center text-center hover:bg-dark rounded-3xl cursor-pointer transition-all py-5">
                  <HiChevronDown size={30} className="w-1/4 fill-accent" />
                  <p className="w-1/4 tracking-wider">{symbol.name}</p>
                  <p className="w-1/4">{symbol.level}</p>
                  <p className="w-1/4">2023-20-04 (117 days)</p>
                  <p className="w-1/4">{symbol.symbolsRemaining}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Levels;
