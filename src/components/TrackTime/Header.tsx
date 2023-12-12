import { useDateStore } from "../../store";
import ArrowLeft from "../Icons/ArrowLeft";
import ArrowRight from "../Icons/ArrowRight";

const Header = () => {
  const date = useDateStore((state) => state.date);
  const increaseDate = useDateStore((state) => state.increaseDate);
  const decreaseDate = useDateStore((state) => state.decreaseDate);
  return (
    <div className="flex w-full items-center justify-between pb-4">
      <h1 className="text-3xl font-bold">Your Time Spent on Websites</h1>
      <div className="flex items-center justify-center gap-2">
        <button
          className="h-8 w-8 cursor-pointer text-4xl"
          onClick={decreaseDate}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <p className="grow text-3xl">{date}</p>
        <button
          className="h-8 w-8 cursor-pointer text-4xl"
          onClick={increaseDate}
        >
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Header;
