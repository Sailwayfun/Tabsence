import { useMemo } from "react";
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
  const { link, icon, text } = useMemo(() => {
    const iconClasses = "mr-3 h-6 w-6 stroke-current";
    if (isWebtimePage) {
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
  }, [isWebtimePage]);

  return (
    <div
      className={cn("navbar top-0 flex justify-end bg-base-200", {
        "justify-between pl-0 pt-0": isWebtimePage,
      })}
    >
      {isWebtimePage && <Logo isWebtimePage={isWebtimePage} />}
      <div className="pr-4">
        <HeaderLink
          className="flex gap-4"
          to={link}
          icon={icon}
          content={text}
        />
      </div>
    </div>
  );
};

export default Header;
