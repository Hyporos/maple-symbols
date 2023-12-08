import { useEffect, useState } from "react";
import Disclaimer from "./components/Disclaimer/Disclaimer";
import Header from "./components/Header/Header";
import Selector from "./components/Selector/Selector";
import Calculator from "./components/Calculator/Calculator";
import Tools from "./components/Tools/Tools";
import Levels from "./components/Levels/Levels";
import Footer from "./components/Footer/Footer";
import Graph from "./components/Graph/Graph";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

function App() {
  // TODO: Replace the following with your app's Firebase project configuration
  // See: https://firebase.google.com/docs/web/learn-more#config-object
  const firebaseConfig = {
    apiKey: "AIzaSyB1l_uUNUI5gVkvK6J5Xt9i9N86fqmMin0",
    authDomain: "maple-symbols.firebaseapp.com",
    projectId: "maple-symbols",
    storageBucket: "maple-symbols.appspot.com",
    messagingSenderId: "1034069866026",
    appId: "1:1034069866026:web:f7d7f1d55054339039b553",
    measurementId: "G-5EGQQS4DDK",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Analytics and get a reference to the service
  const analytics = getAnalytics(app);

  if (localStorage.getItem("clearStorage") === null) {
    localStorage.clear();
    localStorage.setItem("clearStorage", "1.1.4");
  }

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
      dailySymbols: 10,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 970000, 1230000, 1660000, 2260000, 3060000, 4040000, 5220000,
        6600000, 8180000, 9990000, 12010000, 14260000, 16740000, 19450000,
        22420000, 25630000, 29100000, 32830000, 36820000,
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
      dailySymbols: 10,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 1210000, 1530000, 2060000, 2800000, 3780000, 4980000, 6420000,
        8100000, 10020000, 12210000, 14650000, 17360000, 20340000, 23590000,
        27140000, 30970000, 35100000, 39530000, 44260000,
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
      dailySymbols: 20,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 1450000, 1830000, 2460000, 3340000, 4500000, 5920000, 7620000,
        9600000, 11860000, 14430000, 17290000, 20460000, 23940000, 27730000,
        31860000, 36310000, 41000000, 46230000, 51700000,
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
      dailySymbols: 20,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 1690000, 2130000, 2860000, 3880000, 5220000, 6860000, 8820000,
        11100000, 13700000, 16650000, 19930000, 23560000, 27540000, 31870000,
        36580000, 41650000, 47100000, 52930000, 59140000,
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
      dailySymbols: 20,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 1930000, 2430000, 3260000, 4420000, 5940000, 7800000, 10020000,
        12600000, 15540000, 18870000, 22570000, 26660000, 31140000, 36010000,
        41300000, 46990000, 53100000, 59630000, 66580000,
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
      dailySymbols: 20,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      mondayCount: 0,
      completion: "",
      locked: true,
      symbolsRequired: arcaneData,
      mesosRequired: [
        0, 2170000, 2730000, 3660000, 4960000, 6660000, 8740000, 11220000,
        14100000, 17380000, 21090000, 25210000, 29760000, 34740000, 40150000,
        46020000, 52330000, 59100000, 66330000, 74020000,
      ],
    },
    {
      id: 7,
      name: "Cernium",
      alt: "Cernium",
      img: "/symbols/cern-symbol.webp",
      type: "sacred",
      dailyName: "Cernium Research",
      level: NaN,
      experience: NaN,
      daily: false,
      dailySymbols: 20,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      locked: true,
      symbolsRequired: sacredData,
      mesosRequired: [
        0, 36500000, 91200000, 160700000, 241900000, 331500000, 426200000,
        522900000, 618200000, 709000000, 792000000,
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
        0, 41700000, 104800000, 186100000, 282200000, 390000000, 506100000,
        627400000, 750700000, 872600000, 990000000,
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
      dailySymbols: 10,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      symbolsRemaining: 0,
      completion: "",
      locked: true,
      symbolsRequired: sacredData,
      mesosRequired: [
        0, 46900000, 118500000, 211500000, 322500000, 448500000, 586000000,
        732000000, 883200000, 1036200000, 1188000000,
      ],
    },
    {
      id: 10,
      name: "Shangri-La",
      alt: "Shangri-La",
      img: "/symbols/shangri-symbol.webp",
      type: "sacred",
      dailyName: "TBA",
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
        0, 52200000, 132200000, 236800000, 362800000, 507000000, 666000000,
        836600000, 1015600000, 1199800000, 1386000000,
      ],
    },
    {
      id: 11,
      name: "Arteria",
      alt: "Arteria",
      img: "/symbols/arteria-symbol.webp",
      type: "sacred",
      dailyName: "TBA",
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
        0, 57400000, 145900000, 262200000, 403200000, 565500000, 745900000,
        941200000, 1148100000, 1363500000, 1584000000,
      ],
    },
    {
      id: 12,
      name: "Carcion",
      alt: "Carcion",
      img: "/symbols/carcion-symbol.webp",
      type: "sacred",
      dailyName: "TBA",
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
        0, 62600000, 159600000, 287600000, 443500000, 624000000, 825800000,
        1045800000, 1280600000, 1527100000, 1782000000,
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
      <Graph
        symbols={symbols}
        swapped={swapped}
      />
      <Footer />
    </>
  );
}

export default App;
