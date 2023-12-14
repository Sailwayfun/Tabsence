interface ArrowUpBtnProps {
  onMoveUp: (tabId: number, direction: "up") => void;
  tabId: number;
  direction: "up";
  isGrid: boolean;
}
const ArrowUpBtn = ({
  onMoveUp,
  tabId,
  direction,
  isGrid,
}: ArrowUpBtnProps) => {
  return (
    <div className="tooltip" data-tip={`${isGrid ? "Move left" : "Move up"}`}>
      <button
        className={`ml-4 ${isGrid ? "-rotate-90" : "rotate-0"}`}
        onClick={() => onMoveUp(tabId, direction)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M11.47 2.47a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06l-6.22-6.22V21a.75.75 0 01-1.5 0V4.81l-6.22 6.22a.75.75 0 11-1.06-1.06l7.5-7.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default ArrowUpBtn;
