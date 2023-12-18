import { Link } from "react-router-dom";
import ArrowLeft from "../Icons/ArrowLeft";
import ArrowRight from "../Icons/ArrowRight";
import { useParams } from "react-router-dom";
import {
  getCurrentDate,
  getPrevDate,
  getNextDate,
} from "../../utils/trackTime";

interface HeaderProps {
  onResetOrder: () => void;
}

const Header = ({ onResetOrder }: HeaderProps) => {
  const { date } = useParams<{ date: string }>();
  const today = getCurrentDate();
  return (
    <div className="flex w-full items-center justify-between pb-4">
      <h1 className="text-3xl font-bold">Your Time Spent on Websites</h1>
      <div className="flex items-center justify-center gap-2">
        {date && date !== today && (
          <Link to={today} className="contents w-full" onClick={onResetOrder}>
            <button className="mr-8 h-8 w-32 rounded-md bg-orange-700 bg-opacity-70 px-3 text-lg text-white shadow hover:bg-orange-900">
              View Today
            </button>
          </Link>
        )}
        {date && (
          <Link
            to={getPrevDate(date)}
            className="contents w-full"
            onClick={onResetOrder}
          >
            <button
              className="h-8 w-8 cursor-pointer text-4xl"
              onClick={() => getPrevDate(date)}
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          </Link>
        )}
        <p className="grow text-3xl">{date}</p>
        {date && date !== today && (
          <Link
            to={getNextDate(date)}
            className="contents w-full"
            onClick={onResetOrder}
          >
            <button
              className="h-8 w-8 cursor-pointer text-4xl"
              onClick={() => getNextDate(date)}
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
