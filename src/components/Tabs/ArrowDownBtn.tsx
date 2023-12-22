import { cn } from "../../utils";
interface ArrowDownBtnProps {
  onMoveDown: (tabId: number, direction: "down") => void;
  tabId: number;
  direction: "down";
  isGrid: boolean;
}
const ArrowDownBtn = ({
  onMoveDown,
  tabId,
  direction,
  isGrid,
}: ArrowDownBtnProps) => {
  return (
    <div
      className="tooltip"
      data-tip={`${isGrid ? "Move right" : "Move down"}`}
    >
      <button
        className={cn("rotate-0", { "-rotate-90": isGrid })}
        onClick={() => onMoveDown(tabId, direction)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default ArrowDownBtn;
