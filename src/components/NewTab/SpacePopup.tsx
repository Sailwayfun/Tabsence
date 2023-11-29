interface SpacePopupProps {
  isOpen: boolean;
  onArchiveSpace: (id: string) => void;
  onClose: () => void;
  id: string;
}
const SpacePopup = ({
  isOpen,
  onArchiveSpace,
  id,
  onClose,
}: SpacePopupProps) => {
  return (
    <div
      className={`absolute -right-36 top-7 z-10 h-16 w-36 rounded border-gray-500 bg-white text-gray-800 shadow ${
        isOpen ? "block" : "hidden"
      } flex items-center justify-center hover:bg-white hover:text-gray-800`}
    >
      <button
        onClick={() => onClose()}
        className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-sm bg-red-500 text-white"
      >
        X
      </button>
      <button onClick={() => onArchiveSpace(id)}>Archive</button>
    </div>
  );
};

export default SpacePopup;
