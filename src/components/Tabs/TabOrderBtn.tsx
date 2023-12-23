import { cn } from "../../utils";
import TabOrderIcon from "../Icons/TabOrderIcon";
import IconButton from "../UI/IconButton";
import { Direction } from "../../types";

interface TabOrderBtnProps {
  onMoveUp: (tabId: number, direction: "up" | "left") => Promise<void>;
  onMoveDown: (tabId: number, direction: "down" | "right") => Promise<void>;
  tabId: number;
  direction: Direction;
}

const TabOrderBtn = ({
  onMoveUp,
  onMoveDown,
  tabId,
  direction,
}: TabOrderBtnProps) => {
  function handleTabOrderChange(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    { tabId, direction }: { tabId: number; direction: Direction },
  ) {
    e.stopPropagation();
    if (direction === "up" || direction === "left") {
      return onMoveUp(tabId, direction);
    }
    return onMoveDown(tabId, direction);
  }

  return (
    <IconButton
      onClick={(e) => handleTabOrderChange(e, { tabId, direction })}
      customClasses={cn(
        "rotate-0",
        { "-rotate-90": direction === "left" },
        { "rotate-90": direction === "right" },
        { "rotate-180": direction === "down" },
      )}
      icon={<TabOrderIcon className="h-full w-full fill-current" />}
    />
  );
};

export default TabOrderBtn;
