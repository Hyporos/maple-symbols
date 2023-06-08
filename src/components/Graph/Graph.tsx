import { ResponsiveLine } from "@nivo/line";
import { useState } from "react";
import "./Graph.css";

interface Props {
  symbols: [
    {
      name: string;
      level: number;
      data: [
        {
          level: number;
        }
      ];
    }
  ];
}

const Progress = ({ symbols }: Props) => {
  return (
    <section className="graphs">
      <div className="">
        <div className="flex justify-center items-center bg-card rounded-lg w-[1050px] p-10 mt-16">
          <h1 className="text-primary tracking-wider font-semibold text-2xl mb-10">Arcane Force</h1>
        </div>
      </div>
    </section>
  );
};

export default Progress;
