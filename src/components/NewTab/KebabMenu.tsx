import kebabMenu from "./kebab-menu.png";
import kebabMenuBlack from "./kebab-menu-black.png";
interface KebebMenuProps {
  activeLink?: string;
  id: string;
}
const KebabMenu = ({ activeLink, id }: KebebMenuProps) => {
  return (
    <button className="absolute right-2 top-6">
      <img
        src={activeLink === id ? kebabMenuBlack : kebabMenu}
        className="h-4 w-4"
      />
    </button>
  );
};

export default KebabMenu;
