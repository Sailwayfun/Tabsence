import { useDateStore } from "../../store";
import { Link } from "react-router-dom";
import ArrowLeft from "../Icons/ArrowLeft";
import ArrowRight from "../Icons/ArrowRight";
import { useParams } from "react-router-dom";
import { getCurrentDate } from "../../utils/trackTime";

const Header = () => {
  const { date } = useParams<{ date: string }>();
  const increaseDate = useDateStore((state) => state.increaseDate);
  const decreaseDate = useDateStore((state) => state.decreaseDate);
  const getPrevDate = useDateStore((state) => state.getPrevDate);
  const getNextDate = useDateStore((state) => state.getNextDate);
  const today = getCurrentDate();
  console.log(today, "today", date, "date");
  return (
    <div className="flex w-full items-center justify-between pb-4">
      <h1 className="text-3xl font-bold">Your Time Spent on Websites</h1>
      <div className="flex items-center justify-center gap-2">
        {!(date && date === today) && (
          <Link to={today} className="contents w-full">
            <button className="mr-8 h-8 w-20 rounded-md bg-orange-700 bg-opacity-70 px-3 text-lg text-white shadow hover:bg-orange-900">
              Today
            </button>
          </Link>
        )}
        <Link to={getPrevDate()} className="contents w-full">
          <button
            className="h-8 w-8 cursor-pointer text-4xl"
            onClick={decreaseDate}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </Link>
        <p className="grow text-3xl">{date}</p>
        {!(date && date === today) && (
          <Link to={getNextDate()} className="contents w-full">
            <button
              className="h-8 w-8 cursor-pointer text-4xl"
              onClick={increaseDate}
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
