import Kebab from "../../Icons/Kebab";
interface KebabBtnProps {
  onClick: () => void;
}
const KebabBtn = ({ onClick }: KebabBtnProps) => {
  return (
    <button className="absolute right-2 top-2 h-4 w-4" onClick={onClick}>
      <Kebab className="h-full w-full" />
    </button>
  );
};

export default KebabBtn;
