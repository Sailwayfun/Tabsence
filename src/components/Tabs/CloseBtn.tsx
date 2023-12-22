interface CloseBtnProps {
  onCloseTab: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  id: string | undefined;
  order: string;
}
const CloseBtn = ({ id, onCloseTab, order }: CloseBtnProps) => {
  return (
    <div className={`tooltip ${order}`} data-tip="Close tab">
      <button data-id={id} onClick={onCloseTab}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="block h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default CloseBtn;
