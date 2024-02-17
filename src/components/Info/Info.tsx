import { useState } from "react";
import "./Info.css";

import CostTable from "./Sections/CostTable";
import Changelog from "./Sections/Changelog";
import Credits from "./Sections/Credits";
import ExpTable from "./Sections/ExpTable";
import Navbar from "./Sections/Navbar";

interface InfoProps {
  symbols: [
    {
      id: number;
      name: string;
      img: string;
      level: number;
      type: string;
      symbolsRequired: Array<number>;
      mesosRequired: Array<number>;
    }
  ];
  selectedSymbol: number;
  swapped: boolean;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Tools component is the section under the Calculator which contains the Selectors and Catalyst.
// * You can preview the functionality of both items by clicking their respective buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Info = ({ symbols, selectedSymbol, swapped }: InfoProps) => {
  const [selectedInfo, setSelectedInfo] = useState(1);

  return (
    <section className="info">
      <div className="bg-gradient-to-t from-card-tool to-card-grad rounded-lg py-10 w-full max-w-[800px] h-[700px]">
        <Navbar selectedInfo={selectedInfo} setSelectedInfo={setSelectedInfo} />

        {selectedInfo === 1 && <ExpTable symbols={symbols} swapped={swapped} />}

        {selectedInfo === 2 && <CostTable symbols={symbols} selectedSymbol={selectedSymbol} />}

        {selectedInfo === 3 && <Changelog />}

        {selectedInfo === 4 && <Credits />}
      </div>
    </section>
  );
};

export default Info;
