import logo from "./logo.png";
import { Link } from "react-router-dom";
import { cn } from "../../utils";

interface LogoProps {
  isWebtimePage: boolean;
}

const Logo = ({ isWebtimePage }: LogoProps) => {
  return (
    <Link
      className="btn btn-ghost h-16 justify-start rounded-sm pl-0 text-xl"
      to="/"
    >
      <img
        src={logo}
        alt="logo"
        className={cn("w-1/2 object-contain", {
          "max-w-[200px] invert filter": isWebtimePage,
        })}
      />
      <img src="/assets/icons/tabs.png" className="block h-12 w-12" />
    </Link>
  );
};

export default Logo;
