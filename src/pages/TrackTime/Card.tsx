interface TrackTimeCardProps {
  id: string;
  faviconUrl: string;
  durationBySecond: number;
  visitCounts: number;
  percentage: number;
}

const Card = ({
  id,
  faviconUrl,
  durationBySecond,
  visitCounts,
  percentage,
}: TrackTimeCardProps) => {
  function generateWebtimeFigures(figures: number[]) {
    return figures.map((figure, index) => {
      return (
        <div className="mx-auto my-0 text-xl" key={index}>
          {figure}
        </div>
      );
    });
  }

  return (
    <li className="grid w-full grid-cols-4 rounded-md border border-gray-300 p-3 shadow transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-105 hover:bg-slate-300 hover:shadow-lg xl:text-2xl">
      <div className="flex gap-2 text-xl">
        <img className="h-8 w-8" src={faviconUrl} alt={id} />
        <span>{id}</span>
      </div>
      {generateWebtimeFigures([durationBySecond, visitCounts, percentage])}
    </li>
  );
};

export default Card;
