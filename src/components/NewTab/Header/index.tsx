import { Link } from "react-router-dom";
import logo from "../../../assets/logo.png";
import Clock from "./Clock";
const Header = () => {
  return (
    <div className="navbar bg-base-200 flex">
      <div className="h-12 flex-1">
        <Link className="btn btn-ghost text-xl" to="/">
          <img src={logo} className="h-12 w-28 rounded-md" />
        </Link>
      </div>
      <div className="flex-none pr-4">
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
