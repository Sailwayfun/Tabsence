import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { UrlDuration } from "./index";

interface ChartProps {
  durationData: UrlDuration[];
}

const Chart = ({ durationData }: ChartProps) => {
  const totalDuration = durationData.reduce((total, current) => {
    return total + current.durationBySecond;
  }, 0);
  const options = {
    chart: {
      type: "pie",
    },
    title: {
      text: "Time Spent on Websites",
    },
    tooltip: {
      valueSuffix: "%",
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: [
          {
            enabled: true,
            distance: 20,
          },
          {
            enabled: true,
            distance: -40,
            format: "{point.percentage:.1f}%",
            style: {
              fontSize: "1.2em",
              textOutline: "none",
              opacity: 0.7,
            },
            filter: {
              operator: ">",
              property: "percentage",
              value: 6,
            },
          },
        ],
      },
    },
    series: [
      {
        name: "Percentage",
        colorByPoint: true,
        data: durationData.map((urlDuration) => ({
          name: urlDuration.id,
          y:
            Math.round(
              (urlDuration.durationBySecond / totalDuration) * 100 * 100,
            ) / 100,
          url: urlDuration.id,
        })),
      },
    ],
  };
  return (
    <div className="mt-6">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        className="mt-10"
      />
    </div>
  );
};

export default Chart;
