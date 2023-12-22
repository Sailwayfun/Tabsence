import TabCard from "./TabCard";
import { Tab, Space, Direction } from "../../types";
import { useLocation } from "react-router-dom";
import { cn } from "../../utils";

interface TabsProps {
  tabs: Tab[];
  spaces: Space[];
  activeSpaceSelectId?: string;
  selectedSpace: string;
  isLoggedin: boolean;
  isGrid: boolean;
  openSpacesPopup: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  selectSpace: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  closeTab: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleTabOrderChange: (tabId: number, direction: Direction) => Promise<void>;
  toggleTabPin: (tabId?: number, isPinned?: boolean) => void;
}

const Tabs = ({
  tabs,
  spaces,
  activeSpaceSelectId,
  selectedSpace,
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
              selectId={activeSpaceSelectId}
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
