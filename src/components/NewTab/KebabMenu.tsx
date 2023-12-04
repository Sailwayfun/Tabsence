import kebabMenu from "./kebab-menu.png";
interface KebebMenuProps {
  id: string;
  onOpenPopup: (id: string) => void;
}
const KebabMenu = ({ id, onOpenPopup }: KebebMenuProps) => {
  return (
    <button className="absolute right-2 top-6" onClick={() => onOpenPopup(id)}>
      <img src={kebabMenu} className="h-4 w-4" />
    </button>
  );
};

export default KebabMenu;
