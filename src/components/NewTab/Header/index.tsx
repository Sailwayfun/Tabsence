import { Link } from "react-router-dom";
import logo from "../../../assets/logo.png";
import Dropdown from "./Dropdown";
const Header = () => {
  async function copySpaceLink() {
    try {
      const link = window.location.href;
      await navigator.clipboard.writeText(link);
      alert("Link copied!");
    } catch (err) {
      console.error(err);
      alert("Failed to copy link. Please try again.");
    }
  }
  return (
    <div className="navbar bg-base-200 flex">
      <div className="h-12 flex-1">
        <Link className="btn btn-ghost text-xl" to="/">
          <img src={logo} className="h-12 w-28 rounded-md" />
        </Link>
      </div>
      <div className="flex-none">
        <Dropdown onCopySpaceLink={copySpaceLink} />
      </div>
    </div>
  );
};

export default Header;
