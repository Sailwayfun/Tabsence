import { Link } from "react-router-dom";
import SpacePopup from "./SpacePopup";
import RemoveSpaceBtn from "./RemoveSpaceBtn";
import RemoveSpaceModal from "./RemoveSpaceModal";
import ArchiveSpaceBtn from "./ArchiveSpaceBtn";
interface SpaceTabProps {
  linkClasses: string;
  id: string;
  title: string;
  onOpenPopup: (id: string) => void;
  onArchiveSpace: (id: string) => void;
  onClosePopup: () => void;
  onRemoveSpace: (id: string) => void;
  isPopupOpen: boolean;
  isArchived: boolean;
}

const SpaceTab = ({
  linkClasses,
  title,
  id,
  onOpenPopup,
  onClosePopup,
  onArchiveSpace,
  onRemoveSpace,
  isPopupOpen,
  isArchived,
}: SpaceTabProps) => {
  function openModal(id: string) {
    const modal = document.getElementById(
      `remove_space_${id}`,
    ) as HTMLDialogElement;
    modal.showModal();
  }
  return (
    !isArchived && (
      <li
        className={`relative p-4 text-xl  ${linkClasses} group/space-tab flex justify-between hover:bg-blue-800`}
      >
        <Link to={`/${id}`}>{title.toLowerCase()}</Link>
        <RemoveSpaceModal id={id} onRemoveSpace={onRemoveSpace} />
        <div className="absolute right-4 flex gap-4">
          <RemoveSpaceBtn id={id} onOpenModal={openModal} />
          <ArchiveSpaceBtn id={id} onOpenPopup={onOpenPopup} />
        </div>
        <SpacePopup
          id={id}
          isOpen={isPopupOpen}
          onArchiveSpace={onArchiveSpace}
          onClose={onClosePopup}
        />
      </li>
    )
  );
};

export default SpaceTab;
