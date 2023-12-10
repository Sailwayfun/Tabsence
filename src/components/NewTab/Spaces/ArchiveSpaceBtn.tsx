import Archive from "../../Icons/Archive";
interface ArchiveSpaceBtnProps {
  id: string;
  onOpenModal: (id: string, action: string) => void;
  action: string;
}
const ArchiveSpaceBtn = ({ id, onOpenModal, action }: ArchiveSpaceBtnProps) => {
  return (
    <button
      className="hidden group-hover/space-tab:block"
      onClick={() => onOpenModal(id, action)}
    >
      <Archive className="h-6 w-6 stroke-white" />
    </button>
  );
};

export default ArchiveSpaceBtn;
