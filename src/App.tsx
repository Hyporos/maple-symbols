import { useState } from "react";
import Calculator from "./components/Calculator/Calculator";
import Footer from "./components/Footer/Footer";
import Progress from "./components/Graphs/Progress/Progress";
import Header from "./components/Header/Header";
import Selector from "./components/Selector/Selector";
import Tools from "./components/Tools/Tools";
import Levels from "./components/Levels/Levels";

function App() {
  const [swapped, setSwapped] = useState(false);
  const [selectedArcane, setSelectedArcane] = useState(0);
  const [selectedSacredSymbol, setSelectedSacredSymbol] = useState(0);
  const [selectedClass, setSelectedClass] = useState(2);

  const [arcaneSymbols, setArcaneSymbols] = useState([
    {
      id: 1,
      name: "Vanishing Journey",
      alt: "Vanishing Journey Symbol",
      img: "/symbols/vj-symbol.webp",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      extra: false,
      dailySymbols: 0,
      weeklySymbols: 0,
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 7070000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 11030000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 14990000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 18950000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 22910000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 26870000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 30830000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 34790000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 38750000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 42710000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 46670000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 50630000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 54590000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 58550000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 62510000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 66470000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 70430000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 74390000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 78350000 },
      ]
    },
    {
      id: 2,
      name: "Chu Chu Island",
      alt: "Chu Chu Symbol",
      img: "/symbols/chuchu-symbol.webp",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      extra: false,
      dailySymbols: 0,
      weeklySymbols: 0,
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 7070000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 11030000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 14990000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 18950000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 22910000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 26870000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 30830000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 34790000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 38750000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 42710000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 46670000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 50630000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 54590000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 58550000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 62510000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 66470000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 70430000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 74390000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 78350000 },
      ]
    },
    {
      id: 3,
      name: "Lachelein",
      alt: "Lachelein Symbol",
      img: "/symbols/lach-symbol.webp",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 0,
      weeklySymbols: 0,
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 7070000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 11030000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 14990000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 18950000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 22910000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 26870000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 30830000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 34790000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 38750000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 42710000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 46670000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 50630000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 54590000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 58550000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 62510000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 66470000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 70430000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 74390000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 78350000 },
      ]
    },
    {
      id: 4,
      name: "Arcana",
      alt: "Arcana Symbol",
      img: "/symbols/arcana-symbol.webp",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 0,
      weeklySymbols: 0,
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 7070000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 11030000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 14990000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 18950000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 22910000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 26870000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 30830000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 34790000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 38750000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 42710000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 46670000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 50630000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 54590000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 58550000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 62510000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 66470000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 70430000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 74390000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 78350000 },
      ]
    },
    {
      id: 5,
      name: "Morass",
      alt: "Morass Symbol",
      img: "/symbols/morass-symbol.webp",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 0,
      weeklySymbols: 0,
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 7070000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 11030000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 14990000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 18950000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 22910000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 26870000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 30830000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 34790000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 38750000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 42710000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 46670000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 50630000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 54590000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 58550000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 62510000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 66470000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 70430000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 74390000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 78350000 },
      ]
    },
    {
      id: 6,
      name: "Esfera",
      alt: "Esfera Symbol",
      img: "/symbols/esfera-symbol.webp",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 0,
      weeklySymbols: 0,
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 7070000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 11030000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 14990000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 18950000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 22910000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 26870000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 30830000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 34790000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 38750000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 42710000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 46670000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 50630000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 54590000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 58550000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 62510000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 66470000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 70430000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 74390000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 78350000 },
      ]
    },
  ]);

  const sacredSymbols = [
    {
      name: "Cernium",
      alt: "Cernium Symbol",
      img: "/symbols/cern-symbol.webp",
      level: NaN,
      experience: NaN,
      daily: false,
      dailySymbols: 0,
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 7070000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 11030000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 14990000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 18950000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 22910000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 26870000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 30830000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 34790000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 38750000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 42710000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 46670000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 50630000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 54590000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 58550000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 62510000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 66470000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 70430000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 74390000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 78350000 },
      ]
    },
    {
      name: "Arcus",
      alt: "Arcus Symbol",
      img: "/symbols/arcus-symbol.webp",
      level: NaN,
      experience: NaN,
      daily: false,
      dailySymbols: 0,
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 7070000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 11030000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 14990000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 18950000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 22910000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 26870000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 30830000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 34790000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 38750000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 42710000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 46670000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 50630000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 54590000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 58550000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 62510000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 66470000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 70430000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 74390000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 78350000 },
      ]
    },
    {
      name: "Odium",
      alt: "Odium Symbol",
      img: "/symbols/odium-symbol.webp",
      level: NaN,
      experience: NaN,
      daily: false,
      dailySymbols: 0,
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 7070000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 11030000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 14990000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 18950000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 22910000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 26870000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 30830000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 34790000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 38750000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 42710000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 46670000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 50630000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 54590000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 58550000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 62510000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 66470000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 70430000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 74390000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 78350000 },
      ]
    },
  ];

  const classData = [
    { class: "Demon Avenger", statForm: "HP", statGain: 2100 },
    { class: "Xenon", statForm: "all stat", statGain: 48 },
    { class: "Other", statForm: "main stat", statGain: 100 },
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
      <Calculator
        arcaneSymbols={arcaneSymbols}
        setArcaneSymbols={setArcaneSymbols}
        selectedArcane={selectedArcane}
        classData={classData}
        selectedClass={selectedClass}
      ></Calculator>
      <Tools
        selectedArcane={selectedArcane}
        selectedSacredSymbol={selectedSacredSymbol}
        arcaneSymbols={arcaneSymbols}
        sacredSymbols={sacredSymbols}
      ></Tools>
      <Levels arcaneSymbols={arcaneSymbols} />
      <Progress arcaneSymbols={arcaneSymbols}></Progress>
      <Footer></Footer>
    </>
  );
}

export default App;
