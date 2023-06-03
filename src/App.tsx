import { useState } from "react";
import Calculator from "./components/Calculator/Calculator";
import Footer from "./components/Footer/Footer";
import Progress from "./components/Graphs/Progress/Progress";
import Header from "./components/Header/Header";
import Selector from "./components/Selector/Selector";
import Tools from "./components/Tools/Tools";

function App() {
  const [swapped, setSwapped] = useState(false);
  const [selectedArcane, setSelectedArcane] = useState(0);
  const [selectedSacredSymbol, setSelectedSacredSymbol] = useState(0);
  const [selectedClass, setSelectedClass] = useState("");

  const [vjLevel, setVjLevel] = useState(NaN);
  const [vjExperience, setVjExperience] = useState(NaN);

  const arcaneSymbols = [
    {
      name: "Vanishing Journey",
      alt: "Vanishing Journey Symbol",
      img: "/symbols/vj-symbol.webp",
      level: vjLevel,
      experience: vjExperience,
    },
    {
      name: "Chu Chu Island",
      alt: "Chu Chu Symbol",
      img: "/symbols/chuchu-symbol.webp",
      level: vjLevel,
      experience: vjExperience,
    },
    {
      name: "Lachelein",
      alt: "Lachelein Symbol",
      img: "/symbols/lach-symbol.webp",
      level: vjLevel,
      experience: vjExperience,
    },
    {
      name: "Arcana",
      alt: "Arcana Symbol",
      img: "/symbols/arcana-symbol.webp",
      level: vjLevel,
      experience: vjExperience,
    },
    {
      name: "Morass",
      alt: "Morass Symbol",
      img: "/symbols/morass-symbol.webp",
      level: vjLevel,
      experience: vjExperience,
    },
    {
      name: "Esfera",
      alt: "Esfera Symbol",
      img: "/symbols/esfera-symbol.webp",
      level: vjLevel,
      experience: vjExperience,
    },
  ];

  const sacredSymbols = [
    {
      name: "Cernium",
      alt: "Cernium Symbol",
      img: "/symbols/cern-symbol.webp",
      level: vjLevel,
      experience: vjExperience,
    },
    {
      name: "Arcus",
      alt: "Arcus Symbol",
      img: "/symbols/arcus-symbol.webp",
      level: vjLevel,
      experience: vjExperience,
    },
    {
      name: "Odium",
      alt: "Odium Symbol",
      img: "/symbols/odium-symbol.webp",
      level: vjLevel,
      experience: vjExperience,
    },
  ];

  return (
    <>
      <Header></Header>
      <Selector
        swapped={swapped}
        setSwapped={setSwapped}
        selectedArcane={selectedArcane}
        setSelectedArcane={setSelectedArcane}
        selectedSacredSymbol={selectedSacredSymbol}
        setSelectedSacredSymbol={setSelectedSacredSymbol}
        arcaneSymbols={arcaneSymbols}
        sacredSymbols={sacredSymbols}
      ></Selector>
      <Calculator arcaneSymbols={arcaneSymbols} selectedArcane={selectedArcane} vjLevel={vjLevel} setVjLevel={setVjLevel} vjExperience={vjExperience} setVjExperience={setVjExperience}></Calculator>
      <Tools
        selectedArcane={selectedArcane}
        selectedSacredSymbol={selectedSacredSymbol}
        arcaneSymbols={arcaneSymbols}
        sacredSymbols={sacredSymbols}
      ></Tools>
      {/*<Progress arcaneSymbolData={arcaneSymbolData}></Progress>*/}
      <Footer></Footer>
    </>
  );
}

export default App;
