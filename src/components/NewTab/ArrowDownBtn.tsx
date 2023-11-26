interface ArrowDownBtnProps {
  onMoveDown: (tabId: number, direction: "down") => void;
  tabId: number;
  direction: "down";
}
const ArrowDownBtn = ({ onMoveDown, tabId, direction }: ArrowDownBtnProps) => {
  return (
    <button className="ml-4" onClick={() => onMoveDown(tabId, direction)}>
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
  );
};

export default ArrowDownBtn;
