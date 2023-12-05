import { Link } from "react-router-dom";
import KebabMenu from "../KebabMenu";
import SpacePopup from "./SpacePopup";
import RemoveSpaceBtn from "./RemoveSpaceBtn";
interface SpaceTabProps {
  linkClasses: string;
  id: string;
  title: string;
  onOpenPopup: (id: string) => void;
  onArchiveSpace: (id: string) => void;
  onClosePopup: () => void;
  isPopupOpen: boolean;
  isArchived: boolean;
}

const SpaceTab = ({
  linkClasses,
  title,
  id,
  onOpenPopup,
  onClosePopup,
  onArchiveSpace,
  isPopupOpen,
  isArchived,
}: SpaceTabProps) => {
  return (
    !isArchived && (
      <li
        className={`relative p-4 text-xl  ${linkClasses} group/space-tab flex justify-between hover:bg-blue-800`}
      >
        <Link to={`/${id}`}>{title.toLowerCase()}</Link>
        <RemoveSpaceBtn id={id} />
        <KebabMenu id={id} onOpenPopup={onOpenPopup} />
        <SpacePopup
          id={id}
          isOpen={isPopupOpen}
          onArchiveSpace={onArchiveSpace}
          onClose={onClosePopup}
        />
      </li>
    )
  );
};

export default SpaceTab;
