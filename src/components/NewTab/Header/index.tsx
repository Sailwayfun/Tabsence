import { Link } from "react-router-dom";
import logo from "../../../assets/logo.png";
// import Dropdown from "./Dropdown";
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
              <span className="text-lg">Website Time Checker</span>
            </div>
          </Link>
        </button>
        {/* <Dropdown onCopySpaceLink={copySpaceLink} /> */}
      </div>
    </div>
  );
};

export default Header;
