import { useDateStore } from "../../store";
import { Link } from "react-router-dom";
import ArrowLeft from "../Icons/ArrowLeft";
import ArrowRight from "../Icons/ArrowRight";
import { useParams } from "react-router-dom";

const Header = () => {
  const { date } = useParams<{ date: string }>();
  const increaseDate = useDateStore((state) => state.increaseDate);
  const decreaseDate = useDateStore((state) => state.decreaseDate);
  const getPrevDate = useDateStore((state) => state.getPrevDate);
  const getNextDate = useDateStore((state) => state.getNextDate);
  return (
    <div className="flex w-full items-center justify-between pb-4">
      <h1 className="text-3xl font-bold">Your Time Spent on Websites</h1>
      <div className="flex items-center justify-center gap-2">
        <Link to={getPrevDate()} className="contents w-full">
          <button
            className="h-8 w-8 cursor-pointer text-4xl"
            onClick={decreaseDate}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </Link>
        <p className="grow text-3xl">{date}</p>
        <Link to={getNextDate()} className="contents w-full">
          <button
            className="h-8 w-8 cursor-pointer text-4xl"
            onClick={increaseDate}
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Header;
