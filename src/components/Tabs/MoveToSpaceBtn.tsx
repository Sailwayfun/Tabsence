import {Tooltip, IconButton} from "../UI";
import MoveToSpace from "../Icons/MoveToSpace";

interface MoveToSpaceProps {
  id: number | undefined;
  onOpenSpacesPopup: (tabId: number | undefined) => void;
}
const MoveToSpaceBtn = ({ id, onOpenSpacesPopup }: MoveToSpaceProps) => {
  return (
    <Tooltip data-tip="Move to Space">
      <IconButton
        onClick={() => {
          onOpenSpacesPopup(id);
        }}
        icon={<MoveToSpace className="h-full w-full stroke-current" />}
      />
    </Tooltip>
  );
};
export default MoveToSpaceBtn;
