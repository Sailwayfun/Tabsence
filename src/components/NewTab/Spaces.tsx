import { forwardRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSpaceStore } from "../../store";
import { Space } from ".";
import AddSpaceBtn from "./AddSpaceBtn";
import SpaceTab from "./SpaceTab";
import logo from "../../assets/logo.png";
import tabs from "../../assets/tabs.png";
import Folder from "../icons/Folder";
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
    const [activePopup, setActivePopup] = useState<string>("");
    // const [archivedSpaces, setArchivedSpaces] = useState<string[]>([]);
    const archivedSpaces = useSpaceStore((state) => state.archivedSpaces);
    const setArchivedSpaces = useSpaceStore((state) => state.setArchivedSpaces);
    const navigate = useNavigate();
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
      <div className="fixed left-0 top-0 z-10 flex h-full w-72 flex-col bg-blue-600">
        <div className="h-16">
          <Link
            className="group/logo btn btn-ghost h-full justify-start rounded-sm pl-0 text-xl"
            to="/"
          >
            <img src={logo} className="w-1/2 object-contain" />
            <img src={tabs} className="hidden h-8 w-8 group-hover/logo:block" />
          </Link>
        </div>
        <div className="flex max-h-full w-full flex-col [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-3 pl-4 pt-10">
            <div className="h-4 w-4">
              <Folder />
            </div>
            <h2 className="text-xl font-bold tracking-widest text-white">
              SPACES
            </h2>
          </div>
          <AddSpaceBtn onAddSpace={onOpenAddSpacePopup} />
          <AddSpace ref={ref} onAddNewSpace={handleAddNewSpace} />
          <ul className="flex flex-col">
            {spaces.map(({ id, title }) => {
              const linkClasses: string = `${
                currentSpaceId === id
                  ? "text-yellow-400"
                  : "bg-blue-600 text-white"
              }`;
              return (
                <SpaceTab
                  key={id}
                  linkClasses={linkClasses}
                  id={id}
                  title={title}
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
      </div>
    );
  },
);

export default Spaces;
