import Archive from "../../Icons/Archive";
import Restore from "../../Icons/Restore";
interface ToggleArchiveBtnProps {
  id: string;
  onOpenModal: (id: string, action: string) => void;
  action: string;
  isArchived: boolean;
}
const ToggleArchiveBtn = ({
  id,
  onOpenModal,
  action,
  isArchived,
}: ToggleArchiveBtnProps) => {
  return (
    <div className="tooltip" data-tip={`${isArchived ? "Restore" : "Archive"}`}>
      <button
        className="hidden group-hover/space-tab:block"
        onClick={() => onOpenModal(id, action)}
      >
        {!isArchived ? (
          <Archive className="h-6 w-6 stroke-white" />
        ) : (
          <Restore className="h-6 w-6 fill-white" />
        )}
      </button>
    </div>
  );
};

export default ToggleArchiveBtn;
