import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useArchivedSpaceStore } from "../../store/archiveSpace";
import AddSpaceBtn from "./AddSpaceBtn";
import SpaceTab from "./SpaceTab";
import Logo from "../Header/Logo";
import Folder from "../Icons/Folder";
import AddSpace from "./AddSpace";
import { Heading } from "../UI";
import Box from "../Icons/Box";
import { cn, getToastVariant } from "../../utils";
import { useSpacesStore } from "../../store";
interface SpacesProps {
  onAddNewSpace: () => Promise<void>;
  onRemoveSpace: (id: string) => void;
  currentSpaceId?: string;
  currentUserId?: string;
  isWebtimePage: boolean;
}
const Spaces = forwardRef(
  (props: SpacesProps, ref: React.Ref<HTMLInputElement>) => {
    const {
      onAddNewSpace,
      onRemoveSpace,
      currentSpaceId,
      isWebtimePage,
      currentUserId,
    }: SpacesProps = props;
    const archivedSpaces = useArchivedSpaceStore(
      (state) => state.archivedSpaces,
    );
    const addArchived = useArchivedSpaceStore((state) => state.addArchived);
    const restoreArchived = useArchivedSpaceStore(
      (state) => state.restoreArchived,
    );
    const navigate = useNavigate();

    const spaces = useSpacesStore((state) => state.spaces);
    const inputSpaceTitle = useSpacesStore((state) => state.inputSpaceTitle);
    const startEditingSpaceTitle = useSpacesStore(
      (state) => state.startEditingSpaceTitle,
    );
    const changeSpaceTitle = useSpacesStore((state) => state.changeSpaceTitle);

    async function archiveSpace(id: string) {
      try {
        const response = await chrome.runtime.sendMessage({
          action: "archiveSpace",
          spaceId: id,
        });
        if (response) {
          addArchived(id);
          toast.success("Space archived", getToastVariant("normal"));
          navigate("/");
          return;
        }
        throw new Error("Failed to archive space");
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message, getToastVariant("large"));
        }
      }
    }
    async function restoreSpace(id: string) {
      try {
        const response = await chrome.runtime.sendMessage({
          action: "restoreSpace",
          spaceId: id,
        });
        if (response) {
          restoreArchived(id);
          toast.success("Space restored", getToastVariant("normal"));
          navigate(`/${id}`);
          return;
        }
        throw new Error("Failed to restore space");
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message, getToastVariant("large"));
        }
      }
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
    function handleClearModalInput() {
      const inputRef = ref as React.RefObject<HTMLInputElement>;
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
    // function handleSpaceEditBlur(
    //   e: React.FocusEvent<HTMLInputElement>,
    //   id: string,
    // ) {
    //   const space = spaces.find((space) => space.id === id);
    //   if (!space) return;
    //   if (space.isEditing) {
    //     onSpaceEditBlur(e, id);
    //   }
    // }
    // function handleSpaceTitleChange(
    //   e: React.ChangeEvent<HTMLInputElement>,
    //   id: string,
    // ) {
    //   const space = spaces.find((space) => space.id === id);
    //   if (!space) return;
    //   onSpaceTitleChange(e, id);
    // }
    // function handleEditSpace(id: string) {
    //   onEditSpace(id);
    // }

    function handleSpaceTitleChange(
      e: React.ChangeEvent<HTMLInputElement>,
      id: string,
    ) {
      const newTitle = e.target.value;
      inputSpaceTitle(newTitle, id);
    }

    function handleEditSpace(id: string) {
      startEditingSpaceTitle(id);
    }

    async function handleSpaceEditBlur(
      e: React.FocusEvent<HTMLInputElement, Element>,
      id: string,
    ) {
      const newTitle = e.target.value.trim();
      changeSpaceTitle(newTitle, id);
      await updateSpaceTitleInFirestore(id, newTitle, currentUserId);
    }

    async function updateSpaceTitleInFirestore(
      spaceId: string,
      newSpaceTitle: string | undefined,
      userId?: string,
    ) {
      if (!userId) return;
      try {
        const response = await chrome.runtime.sendMessage({
          action: "updateSpaceTitle",
          spaceId,
          newSpaceTitle,
          userId,
        });
        if (!response.success) {
          throw new Error("Failed to update space title in Firestore");
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }
    }
    function openAddSpaceModal() {
      const targetModal = document.getElementById(
        "add_space",
      ) as HTMLDialogElement | null;
      if (targetModal) targetModal.showModal();
    }
    const sideBarAnimation = "transition duration-300 ease-in-out";
    return (
      <div
        className={cn(
          "fixed left-0 top-0 z-10 flex h-full w-72 translate-x-0 transform flex-col bg-orange-700 opacity-80",
          { "absolute h-0 -translate-x-[500px]": isWebtimePage },
          sideBarAnimation,
        )}
      >
        <Logo isWebtimePage={isWebtimePage} />
        <div className="flex max-h-full w-full flex-col">
          <div className="flex items-center gap-3 pl-4 pt-10">
            <Folder className="h-4 w-4 stroke-white" />
            <Heading text="Spaces" />
          </div>
          <span className="mx-auto mt-10 h-[1px] w-full bg-white opacity-60" />
          <AddSpaceBtn onAddSpace={openAddSpaceModal} />
          <AddSpace
            ref={ref}
            onAddNewSpace={handleAddNewSpace}
            onModalClose={handleClearModalInput}
          />
          <ul className="flex flex-col">
            {spaces.map(({ id, title, isEditing }) => {
              const linkClasses: string = cn({
                "bg-orange-700 opacity-80 text-white": currentSpaceId !== id,
                "text-yellow-400": currentSpaceId === id,
              });
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
                  isArchived={false}
                  isEditing={isEditing}
                  onSpaceTitleBlur={handleSpaceEditBlur}
                  onSpaceTitleChange={handleSpaceTitleChange}
                  onEditSpace={handleEditSpace}
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
                      isArchived={true}
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
