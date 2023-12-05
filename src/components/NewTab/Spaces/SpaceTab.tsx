import { Link } from "react-router-dom";
import RemoveSpaceBtn from "./RemoveSpaceBtn";
import RemoveSpaceModal from "./RemoveSpaceModal";
import ArchiveSpaceBtn from "./ArchiveSpaceBtn";
import ArchiveSpaceModal from "./ArchiveSpaceModal";
interface SpaceTabProps {
  linkClasses: string;
  id: string;
  title: string;
  onArchiveSpace: (id: string) => void;
  onRemoveSpace: (id: string) => void;
  isPopupOpen: boolean;
  isArchived: boolean;
}

const SpaceTab = ({
  linkClasses,
  title,
  id,
  onArchiveSpace,
  onRemoveSpace,
  isArchived,
}: SpaceTabProps) => {
  function openModal(id: string, action: string) {
    const modal = document.getElementById(
      `${action}_${id}`,
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
        <ArchiveSpaceModal id={id} onArchiveSpace={onArchiveSpace} />
        <div className="absolute right-4 flex gap-4">
          <RemoveSpaceBtn
            id={id}
            onOpenModal={openModal}
            action="remove_space"
          />
          <ArchiveSpaceBtn
            id={id}
            onOpenModal={openModal}
            action="archive_space"
          />
        </div>
      </li>
    )
  );
};

export default SpaceTab;
