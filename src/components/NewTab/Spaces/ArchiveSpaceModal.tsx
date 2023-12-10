import Modal from "../../UI/Modal";
interface ArchiveSpaceModalProps {
  id: string;
  onArchiveSpace: (id: string) => void;
}

import { useRef } from "react";

const ArchiveSpaceModal = ({ id, onArchiveSpace }: ArchiveSpaceModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  return (
    <Modal id={`archive_space_${id}`} ref={modalRef}>
      <h3 className="text-lg font-bold">
        Are you going to archive this space?
      </h3>
      <p className="py-4">Press ESC key or click on ✕ button to close</p>
      <div className="flex gap-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            onArchiveSpace(id);
            console.log("Archived space", id);
            modalRef.current?.close();
          }}
          className="rounded-md border bg-orange-700 px-4 py-2 text-white shadow-md hover:bg-orange-900"
        >
          Archive Space
        </button>
        <button className="rounded-md border bg-orange-700 px-4 py-2 text-white shadow-md hover:bg-orange-900">
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ArchiveSpaceModal;
