import { Modal } from "../UI";
interface ToggleArchiveModalProps {
  id: string;
  onAction: (id: string) => void;
  text: string;
  btnText: string;
}

import { useRef } from "react";

const ToggleArchiveModal = ({
  id,
  onAction,
  text,
  btnText,
}: ToggleArchiveModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  function closeDialog(dialog: HTMLDialogElement | null) {
    if (dialog) {
      dialog.close();
    }
  }
  return (
    <Modal id={`archive_space_${id}`} ref={modalRef}>
      <h3 className="text-xl font-bold">{text}</h3>
      <p className="py-4">Press ESC key or click on ✕ button to close</p>
      <div className="flex w-full gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onAction(id);
            closeDialog(modalRef.current);
          }}
          className="grow rounded-md border bg-orange-700 px-4 py-2 text-white shadow-md hover:bg-orange-900"
        >
          {`${btnText} Space`}
        </button>
        <button
          type="button"
          onClick={() => closeDialog(modalRef.current)}
          className="grow rounded-md border bg-orange-700 px-4 py-2 text-white shadow-md hover:bg-orange-900"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ToggleArchiveModal;
