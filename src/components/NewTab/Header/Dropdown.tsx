import { Link } from "react-router-dom";
interface DropdownProps {
  onCopySpaceLink: () => void;
}

const Dropdown = ({ onCopySpaceLink }: DropdownProps) => {
  const handleClick = () => {
    const elem = document.activeElement as HTMLElement;
    elem?.blur();
  };
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost rounded-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="inline-block h-5 w-5 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="menu dropdown-content bg-base-100 rounded-box z-[1] mt-4 w-52 p-2 shadow"
      >
        <li onClick={handleClick}>
          <Link to="/webtime">Website Time Tracker</Link>
        </li>
        <li onClick={handleClick}>
          <a onClick={onCopySpaceLink}>Copy Space Link</a>
        </li>
      </ul>
    </div>
  );
};

export default Dropdown;
