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
    function handleClose(e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent) {
      if ("key" in e && e.key !== "Escape") return;
      if (onClose) {
        onClose();
      }
    }
    return createPortal(
      <dialog id={id} className="modal text-black" ref={ref}>
        <div className="modal-box relative rounded-md">
          <form method="dialog" className="modal-backdrop">
            <button
              type="submit"
              onClick={handleClose}
              className="btn btn-ghost btn-sm absolute right-0 top-0 rounded-none bg-red-500 text-white"
            >
              ✕
            </button>
          </form>
          {children}
        </div>
        <form
          method="dialog"
          className="modal-backdrop"
          onClick={handleClose}
          onKeyDown={handleClose}
        >
          <button type="submit" />
        </form>
      </dialog>,
      document.body,
    );
  },
);

export default Modal;
