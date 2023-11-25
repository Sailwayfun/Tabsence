import { Tab, Space } from ".";
import { memo } from "react";
import MoveToSpace from "./MoveToSpace";
import CloseBtn from "./CloseBtn";
import ArrowDownBtn from "./ArrowDownBtn";
import ArrowUpBtn from "./ArrowUpBtn";
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
  selectedSpace,
  isFirstTab,
  isLastTab,
}: TabProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg border px-4 py-2 text-lg hover:bg-slate-300">
      <img src={tab.favIconUrl} className="h-4 w-4 border bg-white" />
      <a
        onClick={(e) => onOpenLink(e, tab)}
        className="cursor-pointer hover:text-gray-500 hover:underline"
      >
        {tab.title}
      </a>
      <MoveToSpace
        spaces={spaces}
        id={tab.id?.toString()}
        onOpenSpacesPopup={onOpenSpacesPopup}
      />
      <CloseBtn id={tab.tabId?.toString()} onCloseTab={onCloseTab} />
      {tab.id?.toString() === popupId && (
        <div className="ml-5 h-14 w-52 rounded-md border px-3">
          <label htmlFor={tab.id?.toString() || "spaces"} className="text-xl">
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
    </li>
  );
});

export default TabCard;
