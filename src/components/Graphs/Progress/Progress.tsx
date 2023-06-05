import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import "./Progress.css";
import { useState } from "react";

interface Props {
  symbols: [{}];
}

const Progress = ({ symbols }: Props) => {

  const [selectedGraph, setSelectedGraph] = useState(1);

  return (
    <section className="graphs">
      <div className="flex justify-center items-center">
        <div className="flex justify-center items-center bg-card rounded-lg w-[1050px] p-10 mt-16">
          <div>
            <div className="flex justify-center text-secondary space-x-52 mb-10">
              <button
                className={`tool-select flex items-center space-x-2 rounded-3xl ${
                  selectedGraph === 1 && "bg-secondary text-primary"
                }`}
                onClick={() => setSelectedGraph(1)}
              >
                <img src="/symbols/selector.webp"></img>
                <p>Arcane Force</p>
              </button>
              <button
                className={`tool-select flex items-center space-x-2 rounded-3xl ${
                  selectedGraph === 2 && "bg-secondary text-primary"
                }`}
                onClick={() => setSelectedGraph(2)}
              >
                <img src="/symbols/catalyst.webp"></img>
                <p>Symbol Level</p>
              </button>
            </div>
            <LineChart
              width={950}
              height={400}
              data={symbols}
              margin={{ top: 5, right: 25, bottom: 5, left: 10 }}
            >
              <Line type="monotone" dataKey="img" stroke="#8884d8" />
              <XAxis dataKey="name" />
              <YAxis dataKey="alt"/>
              <Tooltip />
            </LineChart>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Progress;
