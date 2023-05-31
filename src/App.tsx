import { useState } from "react";
import Calculator from "./components/Calculator/Calculator";
import Footer from "./components/Footer/Footer";
import Progress from "./components/Graphs/Progress/Progress";
import Header from "./components/Header/Header";
import Selector from "./components/Selector/Selector";

function App() {
  const [swapped, setSwapped] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [locked, setLocked] = useState(true);

  const arcaneSymbolData = [
    { name: "May 2nd", uv: 120 },
    { name: "Mar 7th", uv: 1330 },
    { name: "May 9th", uv: 1340 },
    { name: "May 14th", uv: 2350 },
  ];

  return (
    <>
      {/*<Header></Header>*/}
      <Selector
        swapped={swapped}
        setSwapped={setSwapped}
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={setSelectedSymbol}
        locked={locked}
      ></Selector>
      <Calculator></Calculator>
      {/*<Progress arcaneSymbolData={arcaneSymbolData}></Progress>*/}
      {/*<Footer></Footer>*/}
    </>
  );
}

export default App;
