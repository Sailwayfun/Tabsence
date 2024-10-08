import { forwardRef, useRef } from "react";
import { Modal } from "../UI/";
interface AddSpaceProps {
  onAddNewSpace: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ref: React.Ref<HTMLDialogElement>,
  ) => void;
  onModalClose: (inputRef: React.Ref<HTMLInputElement>) => void;
}

const AddSpace = forwardRef(
  (
    { onAddNewSpace, onModalClose }: AddSpaceProps,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const modalRef = useRef<HTMLDialogElement>(null);
    return (
      <Modal id="add_space" ref={modalRef} onClose={() => onModalClose(ref)}>
        <div className="flex w-full flex-col gap-3">
          <label className="text-xl">New Space:</label>
          <input
            className="h-4 w-full rounded-lg border p-5 text-lg placeholder:text-base"
            ref={ref}
            placeholder="Enter a space name with 10 or fewer characters."
          />
          <button
            type="button"
            onClick={(e) => {
              onAddNewSpace(e, modalRef);
            }}
            className="btn btn-sm flex h-12 items-center justify-center self-center rounded-md border bg-orange-700 px-4 py-3 text-xl text-white hover:bg-orange-900"
          >
            Add a new space
          </button>
        </div>
      </Modal>
    );
  },
);

export default AddSpace;
