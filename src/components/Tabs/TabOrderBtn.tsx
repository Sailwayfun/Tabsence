import { cn } from "../../utils";
import TabOrderIcon from "../Icons/TabOrderIcon";
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
    tabId: number,
    direction: Direction,
  ) {
    e.stopPropagation();
    if (direction === "up" || direction === "left") {
      return onMoveUp(tabId, direction);
    }
    return onMoveDown(tabId, direction);
  }
  console.log("tabOrder button", tabId, direction);
  return (
    <button onClick={(e) => handleTabOrderChange(e, tabId, direction)}>
      <TabOrderIcon
        className={cn(
          "h-6 w-6 rotate-0 fill-current",
          { "-rotate-90": direction === "left" },
          { "rotate-90": direction === "right" },
          { "rotate-180": direction === "down" },
        )}
      />
    </button>
  );
};

export default TabOrderBtn;
