import Pin from "../../Icons/Pin";
interface PinBtnProps {
  id?: number;
  isPinned: boolean;
  isGrid: boolean;
  onToggleTabPin: (tabId?: number, isPinned?: boolean) => void;
}
const PinBtn = ({ onToggleTabPin, id, isPinned, isGrid }: PinBtnProps) => {
  return (
    <div
      className={`tooltip  ${isGrid ? "absolute left-2 top-2" : ""}`}
      data-tip="Pin Tab"
    >
      <button
        onClick={() => onToggleTabPin(id, isPinned)}
        className="text-gray-800"
      >
        <Pin
          className={`h-6 w-6 stroke-1 ${
            isPinned ? "fill-orange-700 opacity-80" : "fill-transparent"
          } stroke-current`}
        />
      </button>
    </div>
  );
};

export default PinBtn;
