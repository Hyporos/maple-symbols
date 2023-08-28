import { useEffect, useState } from "react";
import Disclaimer from "./components/Disclaimer/Disclaimer";
import Header from "./components/Header/Header";
import Selector from "./components/Selector/Selector";
import Calculator from "./components/Calculator/Calculator";
import Tools from "./components/Tools/Tools";
import Levels from "./components/Levels/Levels";
import Footer from "./components/Footer/Footer";

function App() {
  const [swapped, setSwapped] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(0);

  const arcaneData = [
    0, 12, 15, 20, 27, 36, 47, 60, 75, 92, 111, 132, 155, 180, 207, 236, 267,
    300, 335, 372,
  ];

  const sacredData = [0, 29, 76, 141, 224, 325, 444, 581, 736, 909, 1100];

  const [symbols, setSymbols] = useState([
    {
      id: 1,
      name: "Vanishing Journey",
      alt: "Vanishing Journey",
      img: "/symbols/vj-symbol.webp",
      type: "arcane",
      dailyName: "Vanishing Journey Research",
      weeklyName: "Erda Spectrum",
      extraName: "Reverse City",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      extra: false,
      dailySymbols: 9,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 7070000, 11030000, 14990000, 18950000, 22910000, 26870000, 30830000,
        34790000, 38750000, 42710000, 46670000, 50630000, 54590000, 62510000,
        66470000, 70430000, 74390000, 74390000, 78350000,
      ],
    },
    {
      id: 2,
      name: "Chu Chu Island",
      alt: "Chu Chu Island",
      img: "/symbols/chuchu-symbol.webp",
      type: "arcane",
      dailyName: "Chu Chu's Finest Cuisine",
      weeklyName: "Hungry Muto",
      extraName: "Yum Yum Island",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      extra: false,
      dailySymbols: 8,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 10840000, 15460000, 20080000, 24700000, 35730000, 33940000, 38560000,
        43180000, 47800000, 52420000, 57040000, 61660000, 66280000, 70900000,
        75520000, 80140000, 84760000, 89380000, 94000000,
      ],
    },
    {
      id: 3,
      name: "Lachelein",
      alt: "Lachelein",
      img: "/symbols/lach-symbol.webp",
      type: "arcane",
      dailyName: "A Night's Peace in Lachelein",
      weeklyName: "Midnight Chaser",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 11,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 14610000, 19890000, 25170000, 30450000, 35730000, 41010000, 46290000,
        51570000, 56850000, 62130000, 67410000, 72690000, 77970000, 83250000,
        88530000, 93810000, 99090000, 104370000, 109650000,
      ],
    },
    {
      id: 4,
      name: "Arcana",
      alt: "Arcana",
      img: "/symbols/arcana-symbol.webp",
      type: "arcane",
      dailyName: "Peace in Arcana",
      weeklyName: "Spirit Savior",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 9,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 17136000, 23076000, 29016000, 34956000, 40896000, 46836000, 52776000,
        58716000, 64656000, 70596000, 76536000, 82476000, 88416000, 94356000,
        100296000, 106236000, 112176000, 118116000, 124056000,
      ],
    },
    {
      id: 5,
      name: "Morass",
      alt: "Morass",
      img: "/symbols/morass-symbol.webp",
      type: "arcane",
      dailyName: "Save the Morass",
      weeklyName: "Ranheim Defense",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 8,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 17136000, 23076000, 29016000, 34956000, 40896000, 46836000, 52776000,
        58716000, 64656000, 70596000, 76536000, 82476000, 88416000, 94356000,
        100296000, 106236000, 112176000, 118116000, 124056000,
      ],
    },
    {
      id: 6,
      name: "Esfera",
      alt: "Esfera",
      img: "/symbols/esfera-symbol.webp",
      type: "arcane",
      dailyName: "Esfera Research Orders",
      weeklyName: "Esfera Guardian",
      level: NaN,
      experience: NaN,
      daily: false,
      weekly: false,
      dailySymbols: 8,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 17136000, 23076000, 29016000, 34956000, 40896000, 46836000, 52776000,
        58716000, 64656000, 70596000, 76536000, 82476000, 88416000, 94356000,
        100296000, 106236000, 112176000, 118116000, 124056000,
      ],
    },
    {
      id: 7,
      name: "Cernium",
      alt: "Cernium",
      img: "/symbols/cern-symbol.webp",
      type: "sacred",
      dailyName: "Cernium Research",
      extraName: "Burning Cernium",
      level: NaN,
      experience: NaN,
      daily: false,
      extra: false,
      dailySymbols: 10,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      locked: true,
      symbolsRequired: sacredData,
      mesosRequired: [
        0, 185400000, 273900000, 362400000, 450900000, 539400000, 627900000,
        716400000, 804900000, 893400000, 981900000,
      ],
    },
    {
      id: 8,
      name: "Hotel Arcus",
      alt: "Hotel Arcus",
      img: "/symbols/arcus-symbol.webp",
      type: "sacred",
      dailyName: "Clean Up Around Hotel Arcus",
      level: NaN,
      experience: NaN,
      daily: false,
      dailySymbols: 10,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      locked: true,
      symbolsRequired: sacredData,
      mesosRequired: [
        0, 203900000, 301200000, 398500000, 495800000, 593100000, 690400000,
        787700000, 885000000, 982300000, 1079600000,
      ],
    },
    {
      id: 9,
      name: "Odium",
      alt: "Odium",
      img: "/symbols/odium-symbol.webp",
      type: "sacred",
      dailyName: "Odium Area Expedition",
      level: NaN,
      experience: NaN,
      daily: false,
      dailySymbols: 5,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      locked: true,
      symbolsRequired: sacredData,
      mesosRequired: [
        0, 224500000, 331600000, 438700000, 545800000, 652900000, 760000000,
        867100000, 974200000, 1081300000, 1188400000,
      ],
    },
  ]);

  // If using Samsung Internet, display an alert. The built in dark theme will mess with the colors.
  useEffect(() => {
    if (navigator.userAgent.match(/samsung/i)) {
      alert(
        "Your browser (Samsung Internet) may not show this website " +
          "correctly. Please consider using a standards-compliant " +
          "browser instead. \n\n" +
          "We recommend Firefox, Microsoft Edge, or Google Chrome."
      );
    }
  }, []);

  return (
    <>
      <Disclaimer />
      <Header />
      <Selector
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={setSelectedSymbol}
        swapped={swapped}
        setSwapped={setSwapped}
      />
      <Calculator
        symbols={symbols}
        setSymbols={setSymbols}
        selectedSymbol={selectedSymbol}
        swapped={swapped}
      />
      <Tools
        symbols={symbols}
        setSymbols={setSymbols}
        selectedSymbol={selectedSymbol}
        swapped={swapped}
      />
      <Levels
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        swapped={swapped}
      />
      <Footer />
    </>
  );
}

export default App;
