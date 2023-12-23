import { forwardRef } from "react";
import Kebab from "../Icons/Kebab";
import { IconButton } from "../UI";
interface KebabBtnProps {
  onClick: () => void;
}
type Ref = HTMLButtonElement;
const KebabBtn = forwardRef<Ref, KebabBtnProps>(({ onClick }, ref) => {
  return (
    <IconButton
      customClasses="absolute right-2 top-2 h-5 w-5"
      onClick={onClick}
      ref={ref}
      icon={<Kebab className="h-full w-full" />}
    />
  );
});

export default KebabBtn;
