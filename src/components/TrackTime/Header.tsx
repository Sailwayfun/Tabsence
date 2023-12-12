import { useDateStore } from "../../store";

const Header = () => {
  const date = useDateStore((state) => state.date);
  const increaseDate = useDateStore((state) => state.increaseDate);
  const decreaseDate = useDateStore((state) => state.decreaseDate);
  return (
    <div className="flex w-full items-center pb-4">
      <h1 className="text-3xl font-bold">Your Time Spent on Websites</h1>
      <div className="ml-auto flex items-center justify-center gap-2">
        <button
          className="h-8 w-8 text-4xl"
          onClick={decreaseDate}
        >{`<`}</button>
        <p className="grow text-3xl">{date}</p>
        <button
          className="h-8 w-8 text-4xl"
          onClick={increaseDate}
        >{`>`}</button>
      </div>
    </div>
  );
};

export default Header;
