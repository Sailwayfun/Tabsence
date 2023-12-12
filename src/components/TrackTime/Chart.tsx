import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { UrlDuration } from "./index";

interface ChartProps {
  durationData: UrlDuration[];
}

interface CustomPointOptions extends Highcharts.PointOptionsObject {
  url: string;
  faviconUrl: string;
}
const Chart = ({ durationData }: ChartProps) => {
  const totalDuration = durationData.reduce((total, current) => {
    return total + current.durationBySecond;
  }, 0);
  const options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
    },
    title: {
      text: "Time Spent on Websites",
    },
    tooltip: {
      valueSuffix: "%",
      style: {
        fontSize: "1.2em",
      },
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: [
          {
            enabled: true,
            useHTML: true,
            connectorPadding: -5,
            connectorWidth: 2,
            formatter: function (this: Highcharts.PointLabelObject) {
              const { faviconUrl } = this.point.options as CustomPointOptions;
              return `<span style="background:url(${faviconUrl}) no-repeat left center; padding: 20px 40px;display: inline-block;" width="16px" height="16px" />
              <span style="font-size: 2em; text-outline: none; opacity: 0.6;">${this.point.name}</span>`;
            },
            distance: 30,
          },
          {
            enabled: true,
            distance: -25,
            format: "{point.percentage:.1f}%",
            style: {
              fontSize: "1em",
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
          faviconUrl: urlDuration.faviconUrl,
        })),
      },
    ],
  };
  return (
    <div className="w-full pt-24">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default Chart;
