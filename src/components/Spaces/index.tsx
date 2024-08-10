import { useRef } from "react";
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
import { cn, getToastVariant, validateSpaceTitle } from "../../utils";
import { useSpacesStore } from "../../store";
interface SpacesProps {
  // onAddNewSpace: () => Promise<void>;
  onRemoveSpace: (id: string) => void;
  currentSpaceId?: string;
  currentUserId?: string;
  isWebtimePage: boolean;
}
const Spaces = (props: SpacesProps) => {
  const {
    onRemoveSpace,
    isWebtimePage,
    currentUserId,
    currentSpaceId,
  }: SpacesProps = props;
  const archivedSpaces = useArchivedSpaceStore((state) => state.archivedSpaces);
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

  const inputRef = useRef<HTMLInputElement>(null);

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

  async function addNewSpace() {
    const newSpaceTitle: string | undefined = inputRef.current?.value.trim();
    const errorToastId: string | null = validateSpaceTitle(
      spaces,
      undefined,
      newSpaceTitle,
    );
    if (errorToastId && inputRef.current) {
      inputRef.current.value = "";
      return;
    }
    const response = await chrome.runtime.sendMessage({
      action: "addSpace",
      newSpaceTitle,
      userId: currentUserId,
    });
    // console.log("response from add space", response);
    if (!response.success) return;
    toast.success("Space added", getToastVariant("small"));
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleAddNewSpace(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ref: React.Ref<HTMLDialogElement>,
  ) {
    e.preventDefault();
    await addNewSpace();
    const modalRef = ref as React.RefObject<HTMLDialogElement>;
    modalRef.current?.close();
  }

  function handleClearModalInput(ref: React.Ref<HTMLInputElement>) {
    const inputRef = ref as React.RefObject<HTMLInputElement>;
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }
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

  function renderSpaceTab(id: string, isArchived: boolean) {
    const space = spaces.find((space) => space.id === id);
    if (!space) return null;
    const { title, isEditing } = space;
    const isSpaceActive = id === currentSpaceId;
    return (
      <SpaceTab
        key={id}
        linkClasses={cn(
          "bg-orange-700 opacity-80 text-white",
          isSpaceActive && "text-yellow-300",
        )}
        id={id}
        title={title}
        onToggleArchive={isArchived ? restoreSpace : archiveSpace}
        onRemoveSpace={onRemoveSpace}
        modalText={`Are you going to ${
          isArchived ? "restore" : "archive"
        } this space?`}
        modalBtnText={isArchived ? "Restore" : "Archive"}
        isArchived={isArchived}
        isEditing={isEditing}
        onSpaceTitleBlur={handleSpaceEditBlur}
        onSpaceTitleChange={handleSpaceTitleChange}
        onEditSpace={handleEditSpace}
      />
    );
  }

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
          ref={inputRef}
          onAddNewSpace={handleAddNewSpace}
          onModalClose={handleClearModalInput}
        />
        <ul className="flex flex-col">
          {spaces.map(
            ({ id, isArchived }) => !isArchived && renderSpaceTab(id, false),
          )}
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
            {archivedSpaces.map((id) => renderSpaceTab(id, true))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Spaces;
