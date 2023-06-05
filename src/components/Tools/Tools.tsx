import { useState } from "react";
import { HiArrowSmRight } from "react-icons/hi";
import "./Tools.css";

interface Props {
  symbols: [{
    img: string;
    level: number;
    experience: number;
  }];
  selectedSymbol: number;
}

const Tools = ({ symbols, selectedSymbol }: Props) => {
  const [selectedTool, setSelectedTool] = useState(1);
  const [selectorCount, setSelectorCount] = useState(0);

  return (
    <section className="flex justify-center">
      <div className="flex flex-col bg-card rounded-b-lg h-[250px] w-[700px]">
        <hr className="horizontal-divider" />
        <div className={`flex justify-between mx-20 text-secondary transition-all space-x-4 mb-10 ${isNaN(symbols[selectedSymbol].level) && "opacity-25"}`}>
          <button
            className={`tool-select flex items-center space-x-2 rounded-3xl ${
              selectedTool === 1 && "bg-secondary text-primary"
            }`}
            onClick={() => setSelectedTool(1)}
          >
            <img src="/symbols/selector.webp"></img>
            <p>Symbol Selector</p>
          </button>
          <button
            className={`tool-select flex items-center space-x-2 rounded-3xl ${
              selectedTool === 2 && "bg-secondary text-primary"
            }`}
            onClick={() => setSelectedTool(2)}
          >
            <img src="/symbols/catalyst.webp"></img>
            <p>Arcane Catalyst</p>
          </button>
        </div>
        <div
          className={`flex justify-center items-center bg-dark rounded-3xl transition-all mx-10 py-3 space-x-14 ${
            selectedTool === 1 ? "block" : "hidden"
          } ${isNaN(symbols[selectedSymbol].level) && "opacity-25"}`}
        >
          <div className="flex items-center space-x-4">
            <img src={symbols[selectedSymbol].img}></img>
            <input
              placeholder="Count"
              className="tool-input w-[100px]"
              onChange={(e) => setSelectorCount(parseInt(e.target.value))}
            ></input>
          </div>
          <div className="flex space-x-4">
            <p className="text-secondary">
              {symbols[selectedSymbol].level} /{" "}
              {symbols[selectedSymbol].experience}
            </p>
            <HiArrowSmRight size={25} className="fill-basic" />
            <p className="text-secondary">
              <span>
                {symbols[selectedSymbol].level} /{" "}
                {symbols[selectedSymbol].experience + selectorCount}
              </span>
            </p>
          </div>
          <button
            className={`tool-select text-secondary hover:text-primary hover:bg-hover ${
              selectedTool === 1 && "bg-secondary text-primary"
            }`}
            onClick={() => setSelectedTool(1)}
          >
            <p>Apply</p>
          </button>
        </div>
        <div
          className={`flex justify-center items-center rounded-3xl mx-10 py-3 bg-dark space-x-16 ${
            selectedTool === 2 ? "block" : "hidden"
          }`}
        >
          <img src={symbols[selectedSymbol].img}></img>
          <div className="flex space-x-4">
            <p className="text-secondary">
              {symbols[selectedSymbol].level} /{" "}
              {symbols[selectedSymbol].experience}
            </p>
            <HiArrowSmRight size={25} className="fill-basic" />
            <p className="text-secondary">
              <span>
                {symbols[selectedSymbol].level} /{" "}
                {symbols[selectedSymbol].experience -
                  symbols[selectedSymbol].experience * 0.2}
              </span>
            </p>
          </div>
          <button
            className={`tool-select text-secondary hover:text-primary hover:bg-hover ${
              selectedTool === 1 && "bg-secondary text-primary"
            }`}
            onClick={() => setSelectedTool(1)}
          >
            Apply
          </button>
        </div>
      </div>
    </section>
  );
};

export default Tools;
