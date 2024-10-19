import { cn } from "@/utils/cn";
import Pin from "../Icons/Pin";
import { Tooltip, IconButton } from "../UI";
interface PinBtnProps {
  id?: number;
  isPinned: boolean;
  isGrid: boolean;
  onToggleTabPin: (tabId: number, isPinned: boolean) => void;
}
const PinBtn = ({ onToggleTabPin, id, isPinned, isGrid }: PinBtnProps) => {
  return (
    <Tooltip
      className={cn("tooltip", { "absolute left-2 top-2": isGrid })}
      data-tip="Pin Tab"
    >
      <IconButton
        onClick={() => onToggleTabPin(id!, isPinned)}
        customClasses="text-gray-800"
        icon={
          <Pin
            className={cn(
              "h-full w-full fill-transparent stroke-current stroke-1",
              {
                "fill-orange-700 opacity-80": isPinned,
              },
            )}
          />
        }
      />
    </Tooltip>
  );
};

export default PinBtn;
