import { forwardRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useSpaceStore } from "../../../store";
import { Space } from "..";
import AddSpaceBtn from "./AddSpaceBtn";
import SpaceTab from "./SpaceTab";
import logo from "../../../assets/logo.png";
import tabs from "../../../assets/tabs.png";
import Folder from "../../Icons/Folder";
import AddSpace from "./AddSpace";
import Heading from "../../UI/Heading";
import Box from "../../Icons/Box";
interface SpacesProps {
  spaces: Space[];
  onOpenAddSpacePopup: () => void;
  onAddNewSpace: () => void;
  onRemoveSpace: (id: string) => void;
  currentSpaceId?: string;
}
const Spaces = forwardRef(
  (props: SpacesProps, ref: React.Ref<HTMLInputElement>) => {
    const {
      spaces,
      onOpenAddSpacePopup,
      onAddNewSpace,
      onRemoveSpace,
      currentSpaceId,
    }: SpacesProps = props;
    console.log({ currentSpaceId });
    // const [archivedSpaces, setArchivedSpaces] = useState<string[]>([]);
    const archivedSpaces = useSpaceStore((state) => state.archivedSpaces);
    const addArchived = useSpaceStore((state) => state.addArchived);
    const restoreArchived = useSpaceStore((state) => state.restoreArchived);
    const navigate = useNavigate();
    async function archiveSpace(id: string) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: "archiveSpace", spaceId: id },
          (res) => {
            if (res) {
              addArchived(id);
              toast.success("Space archived", {
                className: "w-52 text-lg rounded-md shadow",
                duration: 2000,
              });
              navigate("/");
              resolve(res);
            } else {
              reject();
            }
          },
        );
      });
    }
    async function restoreSpace(id: string) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: "restoreSpace", spaceId: id },
          (res) => {
            if (res) {
              restoreArchived(id);
              toast.success("Space restored", {
                className: "w-52 text-lg rounded-md shadow",
                duration: 2000,
              });
              navigate(`/${id}`);
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
      <div className="fixed left-0 top-0 z-10 flex h-full w-72 flex-col bg-orange-700 opacity-80">
        <div className="h-16">
          <Link
            className="btn btn-ghost h-full justify-start rounded-sm pl-0 text-xl"
            to="/"
          >
            <img src={logo} className="w-1/2 object-contain" />
            <img src={tabs} className="block h-12 w-12" />
          </Link>
        </div>
        <div className="flex max-h-full w-full flex-col [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-3 pl-4 pt-10">
            <div className="h-4 w-4">
              <Folder />
            </div>
            <Heading text="Spaces" />
          </div>
          <span className="mx-auto mt-10 h-[1px] w-full bg-white opacity-60" />
          <AddSpaceBtn onAddSpace={onOpenAddSpacePopup} />
          <AddSpace ref={ref} onAddNewSpace={handleAddNewSpace} />
          <Toaster />
          <ul className="flex flex-col">
            {spaces.map(({ id, title }) => {
              const linkClasses: string = `${
                currentSpaceId === id
                  ? "text-yellow-400"
                  : "bg-orange-700 opacity-80 text-white"
              }`;
              const isSpaceArchived = archivedSpaces.includes(id);
              if (isSpaceArchived) return null;
              return (
                <SpaceTab
                  key={id}
                  linkClasses={linkClasses}
                  id={id}
                  title={title}
                  onToggleArchive={archiveSpace}
                  onRemoveSpace={onRemoveSpace}
                  modalText="Are you going to archive this space?"
                  modalBtnText="Archive"
                ></SpaceTab>
              );
            })}
          </ul>
          <div className="flex w-full flex-col gap-3 pt-10">
            <div className="flex items-center gap-3 pl-4">
              <Box className="h-4 w-4 stroke-white" />
              <Heading text="Archived" />
            </div>
            {archivedSpaces.length === 0 && (
              <span className="mt-5 h-[1px] w-full bg-white opacity-60" />
            )}
            <ul className="flex flex-col">
              {archivedSpaces.length > 0 &&
                archivedSpaces.map((id) => {
                  const space = spaces.find((space) => space.id === id);
                  if (!space) return null;
                  const title = space.title;
                  return (
                    <SpaceTab
                      key={id}
                      linkClasses="bg-orange-700 opacity-80 text-white"
                      id={id}
                      title={title}
                      onToggleArchive={restoreSpace}
                      onRemoveSpace={onRemoveSpace}
                      modalText="Are you going to restore this space?"
                      modalBtnText="Restore"
                    ></SpaceTab>
                  );
                })}
            </ul>
          </div>
        </div>
      </div>
    );
  },
);

export default Spaces;
