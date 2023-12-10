import Pin from "../../Icons/Pin";
interface PinBtnProps {
  id?: number;
  isPinned: boolean;
  onToggleTabPin: (tabId?: number, isPinned?: boolean) => void;
}
const PinBtn = ({ onToggleTabPin, id, isPinned }: PinBtnProps) => {
  return (
    <button
      onClick={() => onToggleTabPin(id, isPinned)}
      className="ml-4 text-gray-800"
    >
      <Pin
        className={`h-6 w-6 stroke-1 ${
          isPinned ? "fill-orange-700 opacity-80" : "fill-white"
        } stroke-current`}
      />
    </button>
  );
};

export default PinBtn;
