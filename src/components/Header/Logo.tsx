import logo from "./logo.png";
import { Link } from "react-router-dom";

interface LogoProps {
  isWebtimePage: boolean;
}

const Logo = ({ isWebtimePage }: LogoProps) => {
  return (
    <div className="h-16">
      <Link
        className="btn btn-ghost h-full justify-start rounded-sm pl-0 text-xl"
        to="/"
      >
        <img
          src={logo}
          className={
            isWebtimePage
              ? "max-w-[150px] object-contain invert filter"
              : `w-1/2 object-contain`
          }
        />
        <img src="/icons/tabs.png" className="block h-12 w-12" />
      </Link>
    </div>
  );
};

export default Logo;
