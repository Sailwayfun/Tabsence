import { Link } from "react-router-dom";
import Clock from "../../Icons/Clock";
import Logo from "../Logo";
interface HeaderProps {
  isWebtimePage: boolean;
}
const Header = ({ isWebtimePage }: HeaderProps) => {
  return (
    <div
      className={`navbar top-0 flex ${
        isWebtimePage ? "justify-between pl-0 pt-0" : "sticky justify-end"
      } bg-base-200`}
    >
      {isWebtimePage && <Logo isWebtimePage={isWebtimePage} />}
      <div className="pr-4">
        <button className="btn btn-ghost">
          <Link to="/webtime">
            <div className="flex items-center">
              <Clock />
              <span className="text-lg">Website Time Tracker</span>
            </div>
          </Link>
        </button>
      </div>
    </div>
  );
};

export default Header;
