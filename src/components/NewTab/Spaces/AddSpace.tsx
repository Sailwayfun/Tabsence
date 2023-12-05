import { forwardRef, useRef } from "react";
interface AddSpaceProps {
  onAddNewSpace: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ref: React.Ref<HTMLDialogElement>,
  ) => void;
}

const AddSpace = forwardRef(
  ({ onAddNewSpace }: AddSpaceProps, ref: React.Ref<HTMLInputElement>) => {
    const modalRef = useRef<HTMLDialogElement>(null);
    return (
      <dialog id="add_space" className="modal" ref={modalRef}>
        <div className="modal-box h-40 w-1/2 flex-col gap-3 rounded-none border bg-white p-4 shadow">
          <div className="modal-action mt-0">
            <form method="dialog" className="w-full">
              <button className="absolute right-0 top-0 rounded-sm bg-red-500 p-2 text-white">
                X
              </button>
              <div className="flex w-full flex-col gap-3">
                <label className="text-xl">New Space:</label>
                <input
                  className="h-4 w-full rounded-lg border p-5 text-lg"
                  ref={ref}
                />
                <button
                  onClick={(e) => {
                    onAddNewSpace(e, modalRef);
                  }}
                  className="btn btn-sm flex h-8 items-center justify-center rounded-md border px-4 py-2"
                >
                  Add a new space
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    );
  },
);

export default AddSpace;
