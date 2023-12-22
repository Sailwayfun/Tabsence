import ToggleOrder from "../../components/Icons/ToggleOrder";
interface ToggleOrderBtnProps {
  isAscending: boolean;
  onToggleOrder: () => void;
}

const ToggleOrderBtn = ({
  onToggleOrder,
  isAscending,
}: ToggleOrderBtnProps) => {
  return (
    <div
      className="tooltip flex items-center justify-center"
      data-tip={isAscending ? "descending" : "ascending"}
    >
      <button onClick={onToggleOrder}>
        <ToggleOrder
          className="h-6 w-6"
          direction={isAscending ? "ascend" : "descend"}
        />
      </button>
    </div>
  );
};

export default ToggleOrderBtn;
