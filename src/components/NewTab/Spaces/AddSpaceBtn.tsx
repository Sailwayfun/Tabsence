interface AddSpaceBtnProps {
  onAddSpace: () => void;
}
const AddSpaceBtn = ({ onAddSpace }: AddSpaceBtnProps) => {
  return (
    <button
      className="flex cursor-pointer justify-end py-6 pr-3"
      onClick={onAddSpace}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="white"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    </button>
  );
};

export default AddSpaceBtn;
