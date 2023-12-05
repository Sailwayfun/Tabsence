import { forwardRef } from "react";

interface ModalProps {
  id: string;
  children: React.ReactNode;
}

type ModalRef = HTMLDialogElement;

const Modal = forwardRef<ModalRef, ModalProps>(({ id, children }) => {
  return (
    <dialog id={id} className="modal text-black">
      <div className="modal-box relative rounded-md">
        <form method="dialog">
          <button className="btn btn-ghost btn-sm absolute right-0 top-0 rounded-none bg-red-500 text-white">
            ✕
          </button>
          {children}
        </form>
      </div>
    </dialog>
  );
});

export default Modal;
