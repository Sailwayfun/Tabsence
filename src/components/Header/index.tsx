import Clock from "../Icons/Clock";
import Home from "../Icons/Home";
import Logo from "./Logo";
import HeaderLink from "./HeaderLink";
import { cn } from "../../utils";
import { getCurrentDate } from "../../utils/trackTime";

interface HeaderProps {
  isWebtimePage: boolean;
}
const Header = ({ isWebtimePage }: HeaderProps) => {
  function getHeaderLinkConfig(isPathIncludesWebtime: boolean) {
    const iconClasses = "mr-3 h-6 w-6 stroke-current";
    if (isPathIncludesWebtime) {
      return {
        link: "/",
        icon: <Home className={iconClasses} />,
        text: "Home",
      };
    }
    return {
      link: `/webtime/${getCurrentDate()}`,
      icon: <Clock className={iconClasses} />,
      text: "Website Time Tracker",
    };
  }

  const { link, icon, text } = getHeaderLinkConfig(isWebtimePage);

  const generateHeaderLink = () => {
    return (
      <HeaderLink className="flex gap-4" to={link} icon={icon} content={text} />
    );
  };

  return (
    <div
      className={cn("navbar top-0 flex justify-end bg-base-200", {
        "justify-between pl-0 pt-0": isWebtimePage,
      })}
    >
      {isWebtimePage && <Logo isWebtimePage={isWebtimePage} />}
      <div className="pr-4">{generateHeaderLink()}</div>
    </div>
  );
};

export default Header;
