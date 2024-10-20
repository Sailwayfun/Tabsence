import Card from "./Card";
import type { Direction } from "../../types";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import { useTabsStore } from "@/store/tabs";

interface TabsProps {
  selectedTabId?: number;
  isLoggedin: boolean;
  isGrid: boolean;
  closeTab: (tabId?: number) => Promise<void>;
  handleTabOrderChange: (tabId: number, direction: Direction) => Promise<void>;
  toggleTabPin: (tabId: number, isPinned: boolean) => void;
  currentUserId?: string;
}

const Tabs = ({
  isLoggedin,
  closeTab,
  handleTabOrderChange,
  toggleTabPin,
  isGrid,
  currentUserId,
}: TabsProps) => {
  const { tabs } = useTabsStore();
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
            <Card
              key={tab.tabId}
              tab={tab}
              onCloseTab={closeTab}
              isFirstTab={index === 0}
              isLastTab={tabs.length - 1 === index}
              onTabOrderChange={handleTabOrderChange}
              onToggleTabPin={toggleTabPin}
              isGrid={isGrid}
              currentUserId={currentUserId}
            />
          );
        })}
    </ul>
  );
};

export default Tabs;
