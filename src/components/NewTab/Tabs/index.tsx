import TabCard from "./TabCard";
import { Space } from "../../../types/space";
import { Tab } from "../../../types/tab";
import { useLocation } from "react-router-dom";

interface TabsProps {
  tabs: Tab[];
  spaces: Space[];
  activeSpaceSelectId?: string;
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
  activeSpaceSelectId,
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
  const listStyles = "flex flex-col gap-5 w-full";
  const gridStyles = "grid grid-cols-3 gap-8 max-h-full w-full";
  return (
    <ul className={isGrid ? gridStyles : listStyles}>
      {isLoggedin &&
        tabs.length > 0 &&
        location.pathname.split("/")[1] !== "webtime" &&
        tabs.map((tab, index) => {
          return (
            <TabCard
              key={tab.tabId}
              tab={tab}
              spaces={spaces}
              selectId={activeSpaceSelectId}
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
    </ul>
  );
};

export default Tabs;
