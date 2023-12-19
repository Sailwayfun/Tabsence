import { forwardRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  id: string;
  children: React.ReactNode;
  onClose?: () => void;
}

type ModalRef = HTMLDialogElement;

const Modal = forwardRef<ModalRef, ModalProps>(
  ({ id, children, onClose }, ref) => {
    function handleClose() {
      if (onClose) {
        onClose();
      }
    }
    return createPortal(
      <dialog id={id} className="modal text-black" ref={ref}>
        <div className="modal-box relative rounded-md">
          <form method="dialog" className="modal-backdrop">
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-sm absolute right-0 top-0 rounded-none bg-red-500 text-white"
            >
              ✕
            </button>
          </form>
          {children}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button></button>
        </form>
      </dialog>,
      document.body,
    );
  },
);

export default Modal;
