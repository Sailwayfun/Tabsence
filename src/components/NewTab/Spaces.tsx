import { forwardRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSpaceStore } from "../../store";
import { Space } from ".";
import AddSpaceBtn from "./AddSpaceBtn";
import SpaceTab from "./SpaceTab";
import logo from "../../assets/logo.png";
import AddSpace from "./AddSpace";
interface SpacesProps {
  spaces: Space[];
  onOpenAddSpacePopup: () => void;
  onAddNewSpace: () => void;
  currentSpaceId?: string;
}
const Spaces = forwardRef(
  (props: SpacesProps, ref: React.Ref<HTMLInputElement>) => {
    const {
      spaces,
      onOpenAddSpacePopup,
      onAddNewSpace,
      currentSpaceId,
    }: SpacesProps = props;
    console.log({ currentSpaceId });
    const [activeLink, setActiveLink] = useState<string>("");
    const [activePopup, setActivePopup] = useState<string>("");
    // const [archivedSpaces, setArchivedSpaces] = useState<string[]>([]);
    const archivedSpaces = useSpaceStore((state) => state.archivedSpaces);
    const setArchivedSpaces = useSpaceStore((state) => state.setArchivedSpaces);
    const navigate = useNavigate();
    function handleLinkClick(linkId: string) {
      const targetLink = spaces.find(({ id }) => id === linkId);
      setActiveLink(targetLink?.id || "");
    }
    function openSpacePopup(id: string) {
      const target = spaces.find(({ id: spaceId }) => spaceId === id);
      setActivePopup(target?.id || "");
    }
    function closeSpacePopup() {
      setActivePopup("");
    }
    async function archiveSpace(id: string) {
      setActivePopup("");
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: "archiveSpace", spaceId: id },
          (res) => {
            if (res) {
              setArchivedSpaces(id);
              alert("Space archived");
              navigate("/");
              resolve(res);
            } else {
              reject();
            }
          },
        );
      });
    }
    function handleAddNewSpace(
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      ref: React.Ref<HTMLDialogElement>,
    ) {
      e.preventDefault();
      onAddNewSpace();
      const modalRef = ref as React.RefObject<HTMLDialogElement>;
      modalRef.current?.close();
    }
    return (
      <div className="fixed left-0 top-0 z-10 flex min-h-screen w-72 flex-col overflow-hidden bg-blue-600">
        <div className="h-12">
          <Link className="btn btn-ghost text-xl" to="/">
            <img src={logo} className="h-12 w-28 rounded-md" />
          </Link>
        </div>
        <h2 className="self-end pr-4 pt-12 text-xl text-white">Spaces</h2>
        <AddSpaceBtn onAddSpace={onOpenAddSpacePopup} />
        <AddSpace ref={ref} onAddNewSpace={handleAddNewSpace} />
        <ul className="flex w-full flex-col">
          {spaces.map(({ id, title }) => {
            const linkClasses: string = `${
              currentSpaceId === id ? "bg-white text-red-800" : "text-white"
            }`;
            return (
              <SpaceTab
                key={id}
                linkClasses={linkClasses}
                id={id}
                title={title}
                onLinkClick={handleLinkClick}
                activeLink={activeLink}
                onOpenPopup={openSpacePopup}
                onClosePopup={closeSpacePopup}
                isPopupOpen={activePopup === id}
                onArchiveSpace={archiveSpace}
                isArchived={archivedSpaces.includes(id)}
              ></SpaceTab>
            );
          })}
        </ul>
      </div>
    );
  },
);

export default Spaces;
