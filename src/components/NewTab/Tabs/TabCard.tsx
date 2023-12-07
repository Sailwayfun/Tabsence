import { Tab, Space } from "..";
import { memo } from "react";
import MoveToSpace from "./MoveToSpace";
import CloseBtn from "./CloseBtn";
import ArrowDownBtn from "./ArrowDownBtn";
import ArrowUpBtn from "./ArrowUpBtn";
import StarBtn from "./StarBtn";
import Dropdown from "../../UI/Dropdown";
interface TabProps {
  tab: Tab;
  spaces: Space[];
  popupId: string | undefined;
  onOpenLink: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tab: Tab,
  ) => void;
  onOpenSpacesPopup: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  onSelectSpace: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCloseTab: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onTabOrderChange: (tabId: number, direction: "up" | "down") => Promise<void>;
  onToggleTabPin: (tabId?: number, isPinned?: boolean) => void;
  selectedSpace: string;
  isLastTab: boolean;
  isFirstTab: boolean;
}

const TabCard = memo(function TabCard({
  tab,
  spaces,
  popupId,
  onOpenLink,
  onOpenSpacesPopup,
  onSelectSpace,
  onCloseTab,
  onTabOrderChange,
  onToggleTabPin,
  selectedSpace,
  isFirstTab,
  isLastTab,
}: TabProps) {
  return (
    <li className="group/tab-card grid grid-rows-2 justify-items-center gap-3 rounded-lg border bg-slate-100 px-4 py-2 text-lg shadow-md hover:scale-105 hover:bg-slate-300 xl:flex xl:items-center xl:text-2xl">
      <img
        src={tab.favIconUrl}
        className="h-16 w-16 border bg-white shadow xl:h-4 xl:w-4"
      />
      <a
        onClick={(e) => onOpenLink(e, tab)}
        className="mt-4 line-clamp-2 max-w-full cursor-pointer flex-wrap hover:text-gray-500 hover:underline xl:mb-0 xl:line-clamp-none xl:flex"
      >
        {tab.title}
      </a>
      <div className="mr-3 flex xl:pointer-events-none xl:invisible xl:ml-auto xl:group-hover/tab-card:pointer-events-auto xl:group-hover/tab-card:visible">
        <CloseBtn id={tab.tabId?.toString()} onCloseTab={onCloseTab} />
        <Dropdown
          button={
            <MoveToSpace
              spaces={spaces}
              id={tab.id?.toString()}
              onOpenSpacesPopup={onOpenSpacesPopup}
            />
          }
        >
          {tab.id?.toString() === popupId && (
            <div className="ml-5 h-14 w-52 px-3">
              <label
                htmlFor={tab.id?.toString() || "spaces"}
                className="text-xl"
              >
                Move to space:
              </label>
              <select
                id={tab.id?.toString() || "spaces"}
                onChange={onSelectSpace}
                value={selectedSpace}
              >
                <option value="">Select a space</option>
                {spaces.map(({ id, title }) => {
                  return (
                    <option value={id} key={id}>
                      {title}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </Dropdown>
        {!isFirstTab && tab.tabId && (
          <ArrowUpBtn
            onMoveUp={onTabOrderChange}
            tabId={tab.tabId}
            direction="up"
          />
        )}
        {!isLastTab && tab.tabId && (
          <ArrowDownBtn
            onMoveDown={onTabOrderChange}
            tabId={tab.tabId}
            direction="down"
          />
        )}
        <StarBtn
          onToggleTabPin={onToggleTabPin}
          isPinned={tab.isPinned}
          id={tab.tabId}
        />
      </div>
    </li>
  );
});

export default TabCard;
