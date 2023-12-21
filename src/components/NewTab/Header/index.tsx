import { Link } from "react-router-dom";
import Clock from "../../Icons/Clock";
import Home from "../../Icons/Home";
import Logo from "../Logo";
import { getCurrentDate } from "../../../utils/trackTime";
import { cn } from "../../../utils";
interface HeaderProps {
  isWebtimePage: boolean;
}
const Header = ({ isWebtimePage }: HeaderProps) => {
  return (
    <div
      className={cn("navbar top-0 flex justify-end bg-base-200", {
        "justify-between pl-0 pt-0": isWebtimePage,
      })}
    >
      {isWebtimePage && <Logo isWebtimePage={isWebtimePage} />}
      <div className="pr-4">
        {!isWebtimePage ? (
          <Link to={`/webtime/${getCurrentDate()}`}>
            <button className="btn btn-ghost">
              <div className="flex items-center">
                <Clock />
                <span className="text-lg">Website Time Tracker</span>
              </div>
            </button>
          </Link>
        ) : (
          <Link to="/" className="flex gap-4">
            <button className="btn btn-ghost">
              <Home className="h-6 w-6 stroke-current" />
              <span className="text-lg">Home</span>
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
