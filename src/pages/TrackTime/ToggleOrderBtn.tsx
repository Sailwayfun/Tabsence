import ToggleOrder from "../../components/Icons/ToggleOrder";
import { Tooltip, IconButton } from "../../components/UI";

interface ToggleOrderBtnProps {
  isAscending: boolean;
  onToggleOrder: () => void;
}

const ToggleOrderBtn = ({
  onToggleOrder,
  isAscending,
}: ToggleOrderBtnProps) => {
  return (
    <Tooltip
      className="flex items-center justify-center"
      data-tip={isAscending ? "descending" : "ascending"}
    >
      <IconButton
        onClick={onToggleOrder}
        icon={
          <ToggleOrder
            className="h-full w-full"
            direction={isAscending ? "ascend" : "descend"}
          />
        }
      />
    </Tooltip>
  );
};

export default ToggleOrderBtn;
