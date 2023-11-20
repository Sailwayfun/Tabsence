interface MoveToSpaceProps {
  spaces: string[];
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
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
    </button>
  );
};
export default MoveToSpace;