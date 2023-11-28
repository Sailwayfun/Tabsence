interface SpacePopupProps {
  isOpen: boolean;
}
const SpacePopup = ({ isOpen }: SpacePopupProps) => {
  return (
    <div
      className={`absolute -right-36 top-7 z-10 h-16 w-36 rounded border-gray-500 bg-white text-gray-800 shadow ${
        isOpen ? "block" : "hidden"
      } flex items-center justify-center hover:bg-white hover:text-gray-800`}
    >
      <h1>SpacePopup</h1>
    </div>
  );
};

export default SpacePopup;
