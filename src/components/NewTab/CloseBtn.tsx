interface CloseBtnProps {
  onCloseTab: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  id: string | undefined;
}
const CloseBtn = ({ id }: CloseBtnProps) => {
  return (
    <button data-id={id}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="ml-5 block h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
};

export default CloseBtn;
