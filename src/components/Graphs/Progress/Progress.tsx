import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

interface Props {
  arcaneSymbolData: [{}];
}

const Progress = ({arcaneSymbolData} : Props) => {

  return (
    <section>
      <div className="h-screen flex justify-center items-center">
        <LineChart width={600} height={400} data={arcaneSymbolData} margin={{ top: 5, right: 25, bottom: 5, left: 0}} >
          <Line type="monotone" dataKey="uv" stroke="#8884d8" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </div>
    </section>
  );
};

export default Progress;
