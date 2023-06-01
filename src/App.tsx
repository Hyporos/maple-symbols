import { useState } from "react";
import Calculator from "./components/Calculator/Calculator";
import Footer from "./components/Footer/Footer";
import Progress from "./components/Graphs/Progress/Progress";
import Header from "./components/Header/Header";
import Selector from "./components/Selector/Selector";

function App() {
  const [swapped, setSwapped] = useState(false);
  const [selectedArcaneSymbol, setSelectedArcaneSymbol] = useState("VJ");
  const [selectedSacredSymbol, setSelectedSacredSymbol] = useState("Cernium");
  const [selectedClass, setSelectedClass] = useState("");

  const [vjLevel, setVjLevel] = useState(1);
  const [vjUpgradeReady, setVjUpgradeReady] = useState(false);

  return (
    <>
      {/*<Header></Header>*/}
      <Selector
        swapped={swapped}
        setSwapped={setSwapped}
        selectedArcaneSymbol={selectedArcaneSymbol}
        setSelectedArcaneSymbol={setSelectedArcaneSymbol}
        selectedSacredSymbol={selectedSacredSymbol}
        setSelectedSacredSymbol={setSelectedSacredSymbol}
        vjLevel={vjLevel}
        vjUpgradeReady={vjUpgradeReady}
      ></Selector>
      <Calculator vjLevel={vjLevel} setVjLevel={setVjLevel} vjUpgradeReady={vjUpgradeReady} setVjUpgradeReady={setVjUpgradeReady}></Calculator>
      {/*<Progress arcaneSymbolData={arcaneSymbolData}></Progress>*/}
      {/*<Footer></Footer>*/}
    </>
  );
}

export default App;
