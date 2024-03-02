import { useState } from "react";
import SlideButton from "../SlideButton";
import Changelog from "./Changelog";
import Credits from "./Credits";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Extras component acts as a page for the Changelog and Credits components.
// * Navigate through both using the buttons provided at the top of the container.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Extras = () => {
  const [selectedInfo, setSelectedInfo] = useState(1);

  return (
    <section className="flex justify-center mx-4 md:mx-8">
      <div className="bg-gradient-to-t from-card-tool to-card-grad rounded-lg py-8 md:py-10 h-[650px] md:h-[700px] w-[360px] md:w-full max-w-[800px]">
        {/* NAVBAR */}
        <nav className="flex text-center bg-dark shadow-input transition-all">
          <SlideButton
            label="Changelog"
            selectedInfo={selectedInfo}
            setSelectedInfo={setSelectedInfo}
            targetInfo={1}
          />
          <SlideButton
            label="Credits"
            selectedInfo={selectedInfo}
            setSelectedInfo={setSelectedInfo}
            targetInfo={2}
          />
        </nav>

        {/* CONTENT */}
        {selectedInfo === 1 && <Changelog />}

        {selectedInfo === 2 && <Credits />}
      </div>
    </section>
  );
};

export default Extras;
