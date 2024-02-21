import { useState } from "react";

import Navbar from "./Sections/Navbar";
import Changelog from "./Sections/Changelog";
import Credits from "./Sections/Credits";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Tools component is the section under the Calculator which contains the Selectors and Catalyst.
// * You can preview the functionality of both items by clicking their respective buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Extras = () => {
  const [selectedInfo, setSelectedInfo] = useState(1);

  return (
    <section className="flex justify-center mx-12">
      <div className="bg-gradient-to-t from-card-tool to-card-grad rounded-lg py-10 w-full max-w-[800px] h-[700px]">
        <Navbar selectedInfo={selectedInfo} setSelectedInfo={setSelectedInfo} />

        {selectedInfo === 1 && <Changelog />}

        {selectedInfo === 2 && <Changelog />}

        {selectedInfo === 3 && <Credits />}

        {selectedInfo === 4 && <Credits />}
      </div>
    </section>
  );
};

export default Extras;
