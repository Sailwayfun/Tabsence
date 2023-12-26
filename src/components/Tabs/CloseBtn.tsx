import { IconButton, Tooltip } from "../UI";
import Close from "../Icons/Close";

interface CloseBtnProps {
  onCloseTab: (id?: number) => Promise<void>;
  id?: number;
  orderClass?: string;
}
const CloseBtn = ({ id, onCloseTab, orderClass }: CloseBtnProps) => {
  return (
    <Tooltip data-tip="Close Tab" orderClass={orderClass}>
      <IconButton
        onClick={() => onCloseTab(id)}
        icon={<Close className="h-full w-full" />}
      />
    </Tooltip>
  );
};

export default CloseBtn;
