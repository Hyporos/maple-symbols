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
  const [selectedGraph, setSelectedGraph] = useState(1);

  return (
    <section className="graphs">
      <div className="">
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
            <ResponsiveLine
              data={symbols}
              margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
              valueScale={{ type: "linear" }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
                stacked: true,
                reverse: false,
              }}
              yFormat=" >-.2f"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "transportation",
                legendOffset: 36,
                legendPosition: "middle",
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "count",
                legendOffset: -40,
                legendPosition: "middle",
              }}
              lineWidth={3}
              pointSize={2}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              pointLabelYOffset={-12}
              useMesh={true}
              legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1
                            }
                        }
                    ]
                  }
                ]}
            ></ResponsiveLine>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Progress;
