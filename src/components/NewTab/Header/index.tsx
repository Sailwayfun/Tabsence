import { Link } from "react-router-dom";
import Clock from "../../icons/Clock";
const Header = () => {
  return (
    <div className="navbar bg-base-200 sticky top-0 flex justify-end">
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
