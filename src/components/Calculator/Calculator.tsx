import { useState } from "react";
import "./Calculator.css";

const Calculator = () => {
  const [vjKillQuest, setVjKillQuest] = useState(false);
  const [vjPartyQuest, setVjPartyQuest] = useState(false);
  const [reverseCity, setReverseCity] = useState(false);

  const vjSymbols = () => {
    
  }

  return (
    <section>
      <div className="h-screen flex justify-center items-center flex-row">
        <div className="bg-transparent px-6 py-6 space-y-4 w-1/6 shadow-card">
          <div className="flex flex-row justify-center items-center space-x-4">
            <img src="/public/vj-symbol.webp" alt="Vanishing Journey Symbol" />
            <p className="text-xl text-text font-semibold font-maven-pro uppercase">
              Vanishing Journey
            </p>
          </div>

          <div className="flex justify-center align-center space-x-3">
            <input type="number" id="vj-level" placeholder="Level" className="bg-secondary text-text text-center text-sm rounded-lg block w-full p-2.5"></input>
            <input type="number" id="vj-level" placeholder="Experience" className="bg-secondary text-text text-center text-sm rounded-lg block w-full p-2.5"></input>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setVjKillQuest(!vjKillQuest);
                console.log(!vjKillQuest);
              }}
              className={`flex flex-row justify-center bg-secondary rounded border-2 shadow-input ${
                vjKillQuest ? "shadow-checked" : "shadow-unchecked"
              } py-1.5 w-full`}
            >
              <p className="font-semibold text-text">Kill Quest</p>
            </button>

            <button
              onClick={() => {
                setVjPartyQuest(!vjPartyQuest);
                console.log(!vjPartyQuest);
              }}
              className={`flex flex-row justify-center bg-secondary rounded border-2 shadow-input ${
                vjPartyQuest ? "shadow-checked" : "shadow-unchecked"
              } py-1.5 w-full`}
            >
              <p className="font-semibold text-text">Party Quest</p>
            </button>
          </div>

          <div>
            <button
              onClick={() => {
                setReverseCity(!reverseCity);
                console.log(!reverseCity);
              }}
              className={`flex flex-row justify-center bg-secondary rounded border-2 shadow-input ${
                reverseCity ? "shadow-checked" : "shadow-unchecked"
              } py-1.5 w-full`}
            >
              <p className="font-semibold text-text">Reverse City</p>
            </button>
          </div>

          <div className="flex justify-center text-text">
            <p>0 symbols / day</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
