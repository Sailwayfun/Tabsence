interface SpacePopupProps {
  isOpen: boolean;
  onClose: (id: string) => void;
  id: string;
}
const SpacePopup = ({ isOpen, onClose, id }: SpacePopupProps) => {
  return (
    <div
      className={`absolute -right-36 top-7 z-10 h-16 w-36 rounded border-gray-500 bg-white text-gray-800 shadow ${
        isOpen ? "block" : "hidden"
      } flex items-center justify-center hover:bg-white hover:text-gray-800`}
    >
      <button onClick={() => onClose(id)}>Archive</button>
    </div>
  );
};

export default SpacePopup;
