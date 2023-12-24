import TabCard from "./TabCard";
import { Tab, Space, Direction } from "../../types";
import { useLocation } from "react-router-dom";
import { cn } from "../../utils";

interface TabsProps {
  tabs: Tab[];
  spaces: Space[];
  selectedTabId?: number;
  selectedSpaceId: string;
  isLoggedin: boolean;
  isGrid: boolean;
  openSpacesPopup: (tabId?: number) => void;
  selectSpace: (
    e: React.ChangeEvent<HTMLSelectElement>,
    originalSpaceId: string,
  ) => Promise<void>;
  closeTab: (tabId?: number) => Promise<void>;
  handleTabOrderChange: (tabId: number, direction: Direction) => Promise<void>;
  toggleTabPin: (tabId: number, isPinned: boolean) => void;
}

const Tabs = ({
  tabs,
  spaces,
  selectedTabId,
  selectedSpaceId,
  isLoggedin,
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
    <ul className={cn(listStyles, isGrid && gridStyles)}>
      {isLoggedin &&
        tabs.length > 0 &&
        location.pathname.split("/")[1] !== "webtime" &&
        tabs.map((tab, index) => {
          return (
            <TabCard
              key={tab.tabId}
              tab={tab}
              spaces={spaces}
              selectedTabId={selectedTabId}
              onOpenSpacesPopup={openSpacesPopup}
              onSelectSpace={selectSpace}
              onCloseTab={closeTab}
              selectedSpaceId={selectedSpaceId}
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
