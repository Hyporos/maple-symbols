import { useState } from "react";
import "./Calculator.css";

const Calculator = () => {
  const [vjKillQuest, setVjKillQuest] = useState(false);
  const [vjPartyQuest, setVjPartyQuest] = useState(false);
  const [reverseCity, setReverseCity] = useState(false);

  return (
    <section>
      <div className="h-screen flex justify-center items-center flex-row flex-grow">
        <div className="bg-primary px-6 py-6 space-y-4">
          <div className="flex flex-row justify-center items-center space-x-4">
            <img src="/public/vj-symbol.webp" alt="Vanishing Journey Symbol" />
            <p className="text-2xl font-semibold font-maven-pro">
              Vanishing Journey
            </p>
          </div>
          <div className="space-x-2">
            <input type="number" id="vj-level" placeholder="Level"></input>
            <input
              type="number"
              id="vj-experience"
              placeholder="Experience"
            ></input>
          </div>

          <div className="flex flex-row justify-between">
            <div>
              <button
                onClick={() => {
                  setVjKillQuest(!vjKillQuest);
                  console.log(!vjKillQuest);
                }}
                className={`flex flex-row justify-center bg-secondary rounded border-4 ${
                  vjKillQuest ? "border-checked" : "border-unchecked"
                } py-1.5 w-full`}
              >
                <p className="font-semibold text-text">Kill Quest</p>
              </button>
            </div>
            
            <div>
              <button
                onClick={() => {
                  setVjPartyQuest(!vjPartyQuest);
                  console.log(!vjPartyQuest);
                }}
                className={`flex flex-row justify-center bg-secondary rounded border-4 ${
                  vjPartyQuest ? "border-checked" : "border-unchecked"
                } py-1.5 w-full`}
              >
                <p className="font-semibold text-text">Party Quest</p>
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                setReverseCity(!reverseCity);
                console.log(!reverseCity);
              }}
              className={`flex flex-row justify-center bg-secondary rounded border-4 ${
                reverseCity ? "border-checked" : "border-unchecked"
              } py-1.5 w-full`}
            >
              <p className="font-semibold text-text">Reverse City</p>
            </button>
          </div>
          
          <div className="flex justify-center">
            <p>0 symbols / day</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
