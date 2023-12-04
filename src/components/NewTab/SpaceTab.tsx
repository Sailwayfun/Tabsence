import { Link } from "react-router-dom";
import KebabMenu from "./KebabMenu";
import SpacePopup from "./SpacePopup";
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
      <li className={`relative p-4 text-xl  ${linkClasses} hover:bg-blue-800`}>
        <Link to={`/${id}`}>{title.toLowerCase()}</Link>
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
