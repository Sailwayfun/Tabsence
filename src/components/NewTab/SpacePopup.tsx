interface SpacePopupProps {
  isOpen: boolean;
  onClose: () => void;
}
const SpacePopup = ({ isOpen, onClose }: SpacePopupProps) => {
  return (
    <div
      className={`absolute -right-36 top-7 z-10 h-16 w-36 rounded border-gray-500 bg-white text-gray-800 shadow ${
        isOpen ? "block" : "hidden"
      } flex items-center justify-center hover:bg-white hover:text-gray-800`}
    >
      <button onClick={onClose}>Archive</button>
    </div>
  );
};

export default SpacePopup;
