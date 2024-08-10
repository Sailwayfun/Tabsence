interface AddSpaceBtnProps {
  onAddSpace: () => void;
}
const AddSpaceBtn = ({ onAddSpace }: AddSpaceBtnProps) => {
  return (
    <button
      type="button"
      className="flex cursor-pointer items-center gap-3 py-4 pl-3"
      onClick={onAddSpace}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        className="h-6 w-6 fill-slate-300 stroke-slate-300"
      >
        <title>New Space</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
      <span className="text-lg tracking-wider text-slate-300 text-opacity-70">
        New Space
      </span>
    </button>
  );
};

export default AddSpaceBtn;
