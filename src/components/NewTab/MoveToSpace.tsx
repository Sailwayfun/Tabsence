import { Space } from ".";
interface MoveToSpaceProps {
  spaces: Space[];
  id: string | undefined;
  onOpenSpacesPopup: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    tabId: string | undefined,
  ) => void;
}
const MoveToSpace = ({ spaces, id, onOpenSpacesPopup }: MoveToSpaceProps) => {
  return (
    <button
      onClick={(e) => {
        onOpenSpacesPopup(e, id);
        console.log("spaces", spaces);
        console.log("id", id);
      }}
      data-id={id}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="ml-5 block h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
        />
      </svg>
    </button>
  );
};
export default MoveToSpace;
