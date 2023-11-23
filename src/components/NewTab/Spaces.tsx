import { Link } from "react-router-dom";
import { Space } from ".";
import AddSpaceBtn from "./AddSpaceBtn";
interface SpacesProps {
  spaces: Space[];
  onOpenAddSpacePopup: () => void;
  onCloseAddSpacePopup: () => void;
  isAddSpacePopupOpen: boolean;
}
const Spaces = ({
  spaces,
  onOpenAddSpacePopup,
  onCloseAddSpacePopup,
  isAddSpacePopupOpen,
}: SpacesProps) => {
  return (
    <div className="flex min-h-screen w-40 flex-col bg-red-800">
      <AddSpaceBtn onAddSpace={onOpenAddSpacePopup} />
      <div
        className={`absolute left-20 top-40 flex h-36 w-60 flex-col gap-3 border bg-white p-4 shadow ${
          isAddSpacePopupOpen ? "block" : "hidden"
        }`}
      >
        <button
          onClick={onCloseAddSpacePopup}
          className="absolute right-0 top-0 rounded-sm bg-red-500 p-2 text-white"
        >
          X
        </button>
        <label className="text-xl">New Space:</label>
        <input className="h-4 w-full rounded-lg border p-4" />
        <button className="flex h-8 w-full items-center justify-center rounded-md border px-4 py-2 text-gray-500 hover:bg-gray-500 hover:text-white">
          Add a new space
        </button>
      </div>
      <ul className="flex w-full flex-col">
        {spaces.map(({ id, title }) => {
          return (
            <li className="border px-2 py-4 text-white">
              <Link to={`/${id}`}>{title.toLowerCase()}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Spaces;
