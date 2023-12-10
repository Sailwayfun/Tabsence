import { Link } from "react-router-dom";
import RemoveSpaceBtn from "./RemoveSpaceBtn";
import RemoveSpaceModal from "./RemoveSpaceModal";
import ToggleArchiveBtn from "./ToggleArchiveBtn";
import ToggleArchiveModal from "./ToggleArchiveModal";
interface SpaceTabProps {
  linkClasses: string;
  id: string;
  title: string;
  onRemoveSpace: (id: string) => void;
  onToggleArchive: (id: string) => void;
  modalText: string;
  modalBtnText: string;
  isArchived: boolean;
}

const SpaceTab = ({
  linkClasses,
  title,
  id,
  onToggleArchive,
  onRemoveSpace,
  modalText,
  modalBtnText,
  isArchived,
}: SpaceTabProps) => {
  function openModal(id: string, action: string) {
    const modal = document.getElementById(
      `${action}_${id}`,
    ) as HTMLDialogElement;
    modal.showModal();
  }
  return (
    <li
      className={`relative border border-l-0 border-white p-4 text-xl ${linkClasses} group/space-tab flex justify-between hover:bg-orange-900`}
    >
      <Link to={`/${id}`}>{title.toLowerCase()}</Link>
      <RemoveSpaceModal id={id} onRemoveSpace={onRemoveSpace} />
      <ToggleArchiveModal
        id={id}
        onAction={onToggleArchive}
        text={modalText}
        btnText={modalBtnText}
      />
      <div className="absolute right-4 flex gap-4">
        <RemoveSpaceBtn id={id} onOpenModal={openModal} action="remove_space" />
        <ToggleArchiveBtn
          id={id}
          onOpenModal={openModal}
          action="archive_space"
          isArchived={isArchived}
        />
      </div>
    </li>
  );
};

export default SpaceTab;
