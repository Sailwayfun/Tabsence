import { cn } from "../../utils";
import Pin from "../Icons/Pin";
interface PinBtnProps {
  id?: number;
  isPinned: boolean;
  isGrid: boolean;
  onToggleTabPin: (tabId?: number, isPinned?: boolean) => void;
}
const PinBtn = ({ onToggleTabPin, id, isPinned, isGrid }: PinBtnProps) => {
  return (
    <div
      className={cn("tooltip", { "absolute left-2 top-2": isGrid })}
      data-tip="Pin Tab"
    >
      <button
        onClick={() => onToggleTabPin(id, isPinned)}
        className="text-gray-800"
      >
        <Pin
          className={cn("h-6 w-6 fill-transparent stroke-current stroke-1", {
            "fill-orange-700 opacity-80": isPinned,
          })}
        />
      </button>
    </div>
  );
};

export default PinBtn;
