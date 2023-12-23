import { IconButton } from "../UI";
import Close from "../Icons/Close";

interface CloseBtnProps {
  onCloseTab: (id?: number) => Promise<void>;
  id?: number;
}
const CloseBtn = ({ id, onCloseTab }: CloseBtnProps) => {
  return (
    <IconButton
      onClick={() => onCloseTab(id)}
      icon={<Close className="h-full w-full" />}
    />
  );
};

export default CloseBtn;
