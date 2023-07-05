import { useState } from "react";
import Calculator from "./components/Calculator/Calculator";
import Footer from "./components/Footer/Footer";
import Graph from "./components/Graph/Graph";
import Disclaimer from "./components/Disclaimer/Disclaimer";
import Header from "./components/Header/Header";
import Selector from "./components/Selector/Selector";
import Tools from "./components/Tools/Tools";
import Levels from "./components/Levels/Levels";
function App() {
  const [swapped, setSwapped] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(0);

  const [symbols, setSymbols] = useState([
    {
      id: 1,
      name: "Vanishing Journey",
      alt: "Vanishing Journey Symbol",
      img: "/symbols/vj-symbol.webp",
      type: "arcane",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      extra: false,
      dailySymbols: 9,
      daysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
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
      ],
    },
    {
      id: 2,
      name: "Chu Chu Island",
      alt: "Chu Chu Symbol",
      img: "/symbols/chuchu-symbol.webp",
      type: "arcane",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      extra: false,
      dailySymbols: 8,
      daysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 10840000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 15460000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 20080000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 24700000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 29320000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 33940000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 38560000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 43180000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 47800000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 52420000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 57040000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 61660000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 66280000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 70900000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 75520000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 80140000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 84760000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 89380000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 94000000 },
      ],
    },
    {
      id: 3,
      name: "Lachelein",
      alt: "Lachelein Symbol",
      img: "/symbols/lach-symbol.webp",
      type: "arcane",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 11,
      daysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 14610000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 19890000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 25170000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 30450000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 35730000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 41010000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 46290000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 51570000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 56850000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 62130000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 67410000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 72690000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 77970000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 83250000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 88530000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 93810000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 99090000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 104370000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 109650000 },
      ],
    },
    {
      id: 4,
      name: "Arcana",
      alt: "Arcana Symbol",
      img: "/symbols/arcana-symbol.webp",
      type: "arcane",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 9,
      daysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 17136000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 23076000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 29016000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 34956000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 40896000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 46836000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 52776000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 58716000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 64656000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 70596000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 76536000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 82476000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 88416000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 94356000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 100296000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 106236000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 112176000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 118116000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 124056000 },
      ],
    },
    {
      id: 5,
      name: "Morass",
      alt: "Morass Symbol",
      img: "/symbols/morass-symbol.webp",
      type: "arcane",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 8,
      daysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 17136000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 23076000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 29016000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 34956000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 40896000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 46836000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 52776000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 58716000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 64656000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 70596000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 76536000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 82476000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 88416000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 94356000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 100296000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 106236000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 112176000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 118116000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 124056000 },
      ],
    },
    {
      id: 6,
      name: "Esfera",
      alt: "Esfera Symbol",
      img: "/symbols/esfera-symbol.webp",
      type: "arcane",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 8,
      daysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 12, mesosRequired: 17136000 },
        { level: 3, symbolsRequired: 15, mesosRequired: 23076000 },
        { level: 4, symbolsRequired: 20, mesosRequired: 29016000 },
        { level: 5, symbolsRequired: 27, mesosRequired: 34956000 },
        { level: 6, symbolsRequired: 36, mesosRequired: 40896000 },
        { level: 7, symbolsRequired: 47, mesosRequired: 46836000 },
        { level: 8, symbolsRequired: 60, mesosRequired: 52776000 },
        { level: 9, symbolsRequired: 75, mesosRequired: 58716000 },
        { level: 10, symbolsRequired: 92, mesosRequired: 64656000 },
        { level: 11, symbolsRequired: 111, mesosRequired: 70596000 },
        { level: 12, symbolsRequired: 132, mesosRequired: 76536000 },
        { level: 13, symbolsRequired: 155, mesosRequired: 82476000 },
        { level: 14, symbolsRequired: 180, mesosRequired: 88416000 },
        { level: 15, symbolsRequired: 207, mesosRequired: 94356000 },
        { level: 16, symbolsRequired: 236, mesosRequired: 100296000 },
        { level: 17, symbolsRequired: 267, mesosRequired: 106236000 },
        { level: 18, symbolsRequired: 300, mesosRequired: 112176000 },
        { level: 19, symbolsRequired: 335, mesosRequired: 118116000 },
        { level: 20, symbolsRequired: 372, mesosRequired: 124056000 },
      ],
    },
    {
      id: 7,
      name: "Cernium",
      alt: "Cernium Symbol",
      img: "/symbols/cern-symbol.webp",
      type: "sacred",
      level: NaN,
      experience: NaN,
      daily: false,
      extra: false,
      dailySymbols: 10,
      daysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 29, mesosRequired: 185400000 },
        { level: 3, symbolsRequired: 76, mesosRequired: 273900000 },
        { level: 4, symbolsRequired: 141, mesosRequired: 362400000 },
        { level: 5, symbolsRequired: 224, mesosRequired: 450900000 },
        { level: 6, symbolsRequired: 325, mesosRequired: 539400000 },
        { level: 7, symbolsRequired: 444, mesosRequired: 627900000 },
        { level: 8, symbolsRequired: 581, mesosRequired: 716400000 },
        { level: 9, symbolsRequired: 736, mesosRequired: 804900000 },
        { level: 10, symbolsRequired: 909, mesosRequired: 893400000 },
        { level: 11, symbolsRequired: 1100, mesosRequired: 981900000 },
      ],
    },
    {
      id: 8,
      name: "Hotel Arcus",
      alt: "Hotel Arcus Symbol",
      img: "/symbols/arcus-symbol.webp",
      type: "sacred",
      level: NaN,
      experience: NaN,
      daily: false,
      dailySymbols: 10,
      daysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 29, mesosRequired: 203900000 },
        { level: 3, symbolsRequired: 76, mesosRequired: 301200000 },
        { level: 4, symbolsRequired: 141, mesosRequired: 398500000 },
        { level: 5, symbolsRequired: 224, mesosRequired: 495800000 },
        { level: 6, symbolsRequired: 325, mesosRequired: 593100000 },
        { level: 7, symbolsRequired: 444, mesosRequired: 690400000 },
        { level: 8, symbolsRequired: 581, mesosRequired: 787700000 },
        { level: 9, symbolsRequired: 736, mesosRequired: 885000000 },
        { level: 10, symbolsRequired: 909, mesosRequired: 982300000 },
        { level: 11, symbolsRequired: 1100, mesosRequired: 1079600000 },
      ],
    },
    {
      id: 9,
      name: "Odium",
      alt: "Odium Symbol",
      img: "/symbols/odium-symbol.webp",
      type: "sacred",
      level: NaN,
      experience: NaN,
      daily: false,
      dailySymbols: 5,
      daysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      data: [
        { level: 1, symbolsRequired: 0, mesosRequired: 0 },
        { level: 2, symbolsRequired: 29, mesosRequired: 224500000 },
        { level: 3, symbolsRequired: 76, mesosRequired: 331600000 },
        { level: 4, symbolsRequired: 141, mesosRequired: 438700000 },
        { level: 5, symbolsRequired: 224, mesosRequired: 545800000 },
        { level: 6, symbolsRequired: 325, mesosRequired: 652900000 },
        { level: 7, symbolsRequired: 444, mesosRequired: 760000000 },
        { level: 8, symbolsRequired: 581, mesosRequired: 867100000 },
        { level: 9, symbolsRequired: 736, mesosRequired: 974200000 },
        { level: 10, symbolsRequired: 909, mesosRequired: 1081300000 },
        { level: 11, symbolsRequired: 1100, mesosRequired: 1188400000 },
      ],
    },
  ]);

  const date = new Date();
  const currentDay = String(date.getDate()).padStart(2, "0");
  const currentMonth = String(date.getMonth() + 1).padStart(2, "0");
  const currentYear = date.getFullYear();
  const currentDate = `${currentYear}-${currentMonth}-${currentDay}`;

  const [arcanePower, setArcanePower] = useState([{ x: currentDate, y: 0 }]);

  return (
    <>
      <Disclaimer />
      <Header />
      <Selector
        swapped={swapped}
        setSwapped={setSwapped}
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={setSelectedSymbol}
        symbols={symbols}
      />
      <Calculator
        symbols={symbols}
        setSymbols={setSymbols}
        selectedSymbol={selectedSymbol}
        arcanePower={arcanePower}
        setArcanePower={setArcanePower}
        swapped={swapped}
      />
      <Tools
        symbols={symbols}
        setSymbols={setSymbols}
        selectedSymbol={selectedSymbol}
        swapped={swapped}
      />
      <Levels symbols={symbols} swapped={swapped} />
      {/*<Graph symbols={symbols} arcanePower={arcanePower} swapped={swapped}/>*/}
      <Footer />
    </>
  );
}

export default App;
