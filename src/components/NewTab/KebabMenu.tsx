import kebabMenu from "./kebab-menu.png";
import kebabMenuBlack from "./kebab-menu-black.png";
interface KebebMenuProps {
  activeLink?: string;
  id: string;
  onOpenPopup: (id: string) => void;
}
const KebabMenu = ({ activeLink, id, onOpenPopup }: KebebMenuProps) => {
  return (
    <button className="absolute right-2 top-6" onClick={() => onOpenPopup(id)}>
      <img
        src={
          activeLink === id || activeLink === "" ? kebabMenuBlack : kebabMenu
        }
        className="h-4 w-4"
      />
    </button>
  );
};

export default KebabMenu;
