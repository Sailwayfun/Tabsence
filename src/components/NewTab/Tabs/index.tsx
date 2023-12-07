import TabCard from "./TabCard";
import { Tab, Space } from "../index";
import { useLocation } from "react-router-dom";
import { m } from "framer-motion";

interface TabsProps {
  tabs: Tab[];
  spaces: Space[];
  activePopupId?: string;
  selectedSpace: string;
  isLoggedin: boolean;
  isGrid: boolean;
  openLink: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tab: Tab,
  ) => void;
  openSpacesPopup: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  selectSpace: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  closeTab: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleTabOrderChange: (
    tabId: number,
    direction: "up" | "down",
  ) => Promise<void>;
  toggleTabPin: (tabId?: number, isPinned?: boolean) => void;
}

const Tabs = ({
  tabs,
  spaces,
  activePopupId,
  selectedSpace,
  isLoggedin,
  openLink,
  openSpacesPopup,
  selectSpace,
  closeTab,
  handleTabOrderChange,
  toggleTabPin,
  isGrid,
}: TabsProps) => {
  const location = useLocation();
  const listStyles = "flex flex-col gap-5";
  const gridStyles = "grid grid-cols-3 gap-3 xl:gap-5 h-full";
  return (
    <m.ul
      className={isGrid ? gridStyles : listStyles}
      layout
      transition={{
        duration: 0.5,
        delay: 0.5,
        ease: "easeInOut",
      }}
    >
      {isLoggedin &&
        tabs.length > 0 &&
        location.pathname.split("/")[1] !== "webtime" &&
        tabs.map((tab, index) => {
          return (
            <TabCard
              key={tab.tabId}
              tab={tab}
              spaces={spaces}
              popupId={activePopupId}
              onOpenLink={openLink}
              onOpenSpacesPopup={openSpacesPopup}
              onSelectSpace={selectSpace}
              onCloseTab={closeTab}
              selectedSpace={selectedSpace}
              isFirstTab={index === 0}
              isLastTab={tabs.length - 1 === index}
              onTabOrderChange={handleTabOrderChange}
              onToggleTabPin={toggleTabPin}
              isGrid={isGrid}
            ></TabCard>
          );
        })}
    </m.ul>
  );
};

export default Tabs;
