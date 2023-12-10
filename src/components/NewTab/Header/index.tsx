import { Link } from "react-router-dom";
import Clock from "../../Icons/Clock";
const Header = () => {
  return (
    <div className="navbar sticky top-0 flex justify-end bg-base-200">
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
