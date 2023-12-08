import { useEffect, useMemo, useState } from "react";
import { isValid, getRemainingSymbols, getDailySymbols } from "../../lib/utils";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

interface Props {
  symbols: [
    {
      name: string;
      img: string;
      alt: string;
      type: string;
      level: number;
      extra: boolean;
      daily: ConstrainBooleanParameters;
      dailySymbols: number;
      weekly: boolean;
      experience: number;
      symbolsRemaining: number;
      daysRemaining: number;
      completion: string;
      symbolsRequired: Array<number>;
    }
  ];
  swapped: boolean;
}

interface GraphSymbols {
  name: string;
  progress: [{ level: number; date: string }];
}

const Graph = ({ symbols, swapped }: Props) => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  const [graphSymbols, setGraphSymbols] = useState<GraphSymbols[]>([]);
  const [basePower, setBasePower] = useState(0);
  const [targetPower, setTargetPower] = useState(0);
  const [dateToPower, setDateToPower] = useState("");

  /* ―――――――――――――――――――― Functions ―――――――――――――――――――――― */

  // Calculate the base arcane power of the character
  useEffect(() => {
    let tempBasePower = 0;

    for (const symbol of symbols) {
      if (!isValid(symbol.level)) continue;
      tempBasePower += symbol.level * 10 + 20;
    }

    setBasePower(tempBasePower);
  }, [symbols]);

  // Calculate the date in which the target power will be reached
  useEffect(() => {
    // Merge all symbol level up dates into one array and sort them
    const mergedDates = [];

    for (const symbol of graphSymbols) {
      for (const level of symbol.progress) {
        mergedDates.push(level.date);
      }
    }

    mergedDates.sort((a: string, b: string) => dayjs(a).diff(dayjs(b)));

    // Add 10 to the character's power until they reach the target power
    let tempDate = "";
    let tempPower = basePower;

    for (const date of mergedDates) {
      if (tempPower <= targetPower) {
        tempDate = date;
        tempPower += 10;
      }
    }

    setDateToPower(tempDate);
  }, [targetPower, basePower, graphSymbols]);

  // Calculate and store every symbol's date needed to reach future levels
  useMemo(() => {
    try {
      const tempGraphSymbols = symbols
        .filter((currentSymbol) =>
          !swapped
            ? currentSymbol.type === "arcane"
            : currentSymbol.type === "sacred"
        )
        .map((currentSymbol) => {
          const progress = [];
          let days = 0;
          let count = 0;
          let resets = 0;
          let mondayReached = false;

          const dailySymbols = getDailySymbols(currentSymbol);

          for (
            let symbolLevel = 0;
            symbolLevel <= (!swapped ? 20 : 11);
            symbolLevel++
          ) {
            for (let i = 0; i < 1000; i++) {
              const remainingSymbols = getRemainingSymbols(
                symbolLevel,
                currentSymbol
              );

              if (
                days * dailySymbols + (currentSymbol.weekly ? resets * 45 : 0) <
                remainingSymbols
              ) {
                if (
                  mondayReached === false &&
                  dayjs().add(count, "day").isBefore(dayjs().day(8))
                ) {
                  count++;
                  if (dayjs().add(count, "day").isSame(dayjs().day(8))) {
                    mondayReached = true;
                  }
                } else if ((days - count) % 7 === 0) {
                  resets++;
                }
                days++;
              }
            }

            // Only push data for levels that have not yet been reached
            if (days > 0) {
              progress.push({
                level: symbolLevel,
                date: dayjs().add(days, "day").format("YYYY-MM-DD"),
              });
            }
          }

          return { name: currentSymbol.name, progress };
        });

      console.log(tempGraphSymbols);
      setGraphSymbols(tempGraphSymbols);
    } catch (e) {
      console.error(e);
      setGraphSymbols([]);
    }
  }, [symbols, swapped]);

  /* ―――――――――――――――――――― Render Logic ――――――――――――――――――― */

  return (
    <section className="levels">
      <div className="flex justify-center items-center bg-gradient-to-t from-card to-card-grad rounded-lg w-[350px] tablet:w-[700px] laptop:w-[1050px] p-10 mt-16 tablet:mt-28">
        <div className="flex flex-col w-[350px] tablet:w-[700px] laptop:w-[1050px]">
          <input
            type="number"
            className="text-black text-2xl"
            onChange={(e) => setTargetPower(Number(e.target.value))}
          ></input>
          <p>
            Your current base arcane power is {basePower}. <br></br> You will
            reach {targetPower} arcane power on {dateToPower} <br></br>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Graph;
