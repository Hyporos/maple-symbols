import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import ExpTable from "./ExpTable";
import CostTable from "./CostTable";
import RatioTable from "./RatioTable";
import SlideButton from "../SlideButton";

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
// * The Info component acts as a page for the Experience, Meso Cost, and Damage Ratio Tables.
// * Navigate through both using the buttons provided at the top of the container.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Info = ({ symbols, selectedSymbol, swapped }: InfoProps) => {
  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });

  const [selectedInfo, setSelectedInfo] = useState(1);

  return (
    <section className="flex justify-center mx-4 md:mx-8">
      <div className="bg-gradient-to-t from-card-tool to-card-grad rounded-lg py-8 md:py-10 w-[360px] md:w-full h-[650px] md:h-[700px] max-w-[800px]">
        {/* NAVBAR */}
        <nav className="flex text-center bg-dark shadow-input transition-all">
          <SlideButton
            label={!isMobile ? "Experience Table" : "Exp Table" }
            selectedInfo={selectedInfo}
            setSelectedInfo={setSelectedInfo}
            targetInfo={1}
          />
          <SlideButton
            label={!isMobile ? "Meso Cost Table" : "Cost Table" }
            selectedInfo={selectedInfo}
            setSelectedInfo={setSelectedInfo}
            targetInfo={2}
          />
          <SlideButton
            label={!isMobile ? "Damage Ratio Table" : "Dmg Table" }
            selectedInfo={selectedInfo}
            setSelectedInfo={setSelectedInfo}
            targetInfo={3}
          />
        </nav>

        {/* CONTENT */}
        {selectedInfo === 1 && <ExpTable symbols={symbols} swapped={swapped} />}

        {selectedInfo === 2 && (
          <CostTable symbols={symbols} selectedSymbol={selectedSymbol} />
        )}

        {selectedInfo === 3 && <RatioTable swapped={swapped} />}
      </div>
    </section>
  );
};

export default Info;
