import { Line } from "@nivo/line";
import { useEffect, useState } from "react";
import "./Graph.css";

interface Props {
  symbols: [
    {
      name: string;
      level: number;
      completion: string;
    }
  ];
  arcanePower: [{}];
  swapped: boolean;
}

const Progress = ({ symbols, arcanePower, swapped }: Props) => {

  const data = [
    {
      id: "arcane-power",
      data: arcanePower,
    },
  ];

  const theme = {
    axis: {
      domain: {
        stroke: "#b18bd0",
      },
      ticks: {
        line: {
          stroke: "#ffffff",
        },
        text: {
          fill: "#ffffff",
        },
      },
    },
    tooltip: {
      container: {
        background: "black",
      },
    },
  };

  return (
    <section className="graph">
      <div className="flex justify-center items-center flex-col bg-card rounded-lg w-[1050px] p-10 mt-16">
        <h1 className="text-primary tracking-wider font-semibold text-2xl mb-10">
          {!swapped ? "Arcane Power" : "Sacred Power"}
        </h1>
        <Line
          data={data}
          width={1050}
          height={500}
          margin={{ top: 25, right: 60, bottom: 25, left: 60 }}
          theme={theme}
          colors={"#b18bd0"}
          enableGridX={false}
          enableGridY={false}
          pointSize={7.5}
          useMesh={true}
        />
      </div>
    </section>
  );
};

export default Progress;
