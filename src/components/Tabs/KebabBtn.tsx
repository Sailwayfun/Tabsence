import { forwardRef } from "react";
import Kebab from "../Icons/Kebab";
interface KebabBtnProps {
  onClick: () => void;
}
type Ref = HTMLButtonElement;
const KebabBtn = forwardRef<Ref, KebabBtnProps>(({ onClick }, ref) => {
  return (
    <button
      className="absolute right-2 top-2 h-5 w-5"
      onClick={onClick}
      ref={ref}
    >
      <Kebab className="h-full w-full" />
    </button>
  );
});

export default KebabBtn;
