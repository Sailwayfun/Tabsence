import Modal from "../../UI/Modal";
interface RemoveSpaceModalProps {
  id: string;
  onRemoveSpace: (id: string) => void;
}

import { useRef } from "react";

const RemoveSpaceModal = ({ id, onRemoveSpace }: RemoveSpaceModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  return (
    <Modal id={`remove_space_${id}`} ref={modalRef}>
      <h3 className="text-lg font-bold">Are you going to remove this space?</h3>
      <p className="py-4">Press ESC key or click on ✕ button to close</p>
      <div className="flex gap-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemoveSpace(id);
            modalRef.current?.close();
          }}
          className="rounded-md border bg-orange-700 px-4 py-2 text-white shadow-md hover:bg-orange-900"
        >
          Remove Space
        </button>
        <button className="rounded-md border bg-orange-700 px-4 py-2 text-white shadow-md hover:bg-orange-900">
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default RemoveSpaceModal;
