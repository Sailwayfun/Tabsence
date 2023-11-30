import { Link } from "react-router-dom";
import KebabMenu from "./KebabMenu";
import SpacePopup from "./SpacePopup";
interface SpaceTabProps {
  linkClasses: string;
  id: string;
  title: string;
  onLinkClick: (id: string) => void;
  activeLink: string;
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
  activeLink,
  onLinkClick,
  onOpenPopup,
  onClosePopup,
  onArchiveSpace,
  isPopupOpen,
  isArchived,
}: SpaceTabProps) => {
  return (
    !isArchived && (
      <li
        className={`relative border px-2 py-4 text-xl  ${linkClasses} hover:bg-white hover:text-red-800`}
      >
        <Link to={`/${id}`} onClick={() => onLinkClick(id)}>
          {title.toLowerCase()}
        </Link>
        <KebabMenu activeLink={activeLink} id={id} onOpenPopup={onOpenPopup} />
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
