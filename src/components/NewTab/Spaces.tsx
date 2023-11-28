import { Link } from "react-router-dom";
import { forwardRef, useState } from "react";
import { Space } from ".";
import AddSpaceBtn from "./AddSpaceBtn";
import KebabMenu from "./KebabMenu";
import SpacePopup from "./SpacePopup";
interface SpacesProps {
  spaces: Space[];
  onOpenAddSpacePopup: () => void;
  onCloseAddSpacePopup: () => void;
  isAddSpacePopupOpen: boolean;
  onAddNewSpace: () => void;
  currentSpaceId?: string;
}
const Spaces = forwardRef(
  (props: SpacesProps, ref: React.Ref<HTMLInputElement>) => {
    const {
      spaces,
      onOpenAddSpacePopup,
      onCloseAddSpacePopup,
      onAddNewSpace,
      isAddSpacePopupOpen,
      currentSpaceId,
    }: SpacesProps = props;
    console.log({ currentSpaceId });
    const [activeLink, setActiveLink] = useState<string>("");
    const [activePopup, setActivePopup] = useState<string>("");
    function handleLinkClick(linkId: string) {
      const targetLink = spaces.find(({ id }) => id === linkId);
      setActiveLink(targetLink?.id || "");
    }
    function openSpacePopup(id: string) {
      const target = spaces.find(({ id: spaceId }) => spaceId === id);
      setActivePopup(target?.id || "");
    }
    return (
      <div className="flex min-h-screen w-40 flex-col bg-red-800">
        <h2 className="self-end pr-4 pt-4 text-xl text-white">Spaces</h2>
        <AddSpaceBtn onAddSpace={onOpenAddSpacePopup} />
        <div
          className={`absolute left-20 top-40 z-10 flex h-36 w-60 flex-col gap-3 border bg-white p-4 shadow ${
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
          <input className="h-4 w-full rounded-lg border p-4" ref={ref} />
          <button
            onClick={onAddNewSpace}
            className="flex h-8 w-full items-center justify-center rounded-md border px-4 py-2 text-gray-500 hover:bg-gray-500 hover:text-white"
          >
            Add a new space
          </button>
        </div>
        <ul className="flex w-full flex-col">
          {spaces.map(({ id, title }) => {
            const linkClasses: string = `${
              currentSpaceId === id ? "bg-white text-red-800" : "text-white"
            }`;
            return (
              <li
                key={id}
                className={`relative border px-2 py-4 text-xl  ${linkClasses} hover:bg-white hover:text-red-800`}
              >
                <Link to={`/${id}`} onClick={() => handleLinkClick(id)}>
                  {title.toLowerCase()}
                </Link>
                <KebabMenu
                  activeLink={activeLink}
                  id={id}
                  onOpenPopup={openSpacePopup}
                />
                <SpacePopup isOpen={activePopup === id} />
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);

export default Spaces;
