import { Space } from "../../../types/space";
import { memo, useState, useEffect, useRef } from "react";
import { Tab } from "../../../types/tab";
import MoveToSpace from "./MoveToSpace";
import CloseBtn from "./CloseBtn";
import ArrowDownBtn from "./ArrowDownBtn";
import ArrowUpBtn from "./ArrowUpBtn";
import PinBtn from "./PinBtn";
import Dropdown from "../../UI/Dropdown";
import KebabBtn from "./KebabBtn";
interface TabProps {
  tab: Tab;
  spaces: Space[];
  selectId: string | undefined;
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
  isGrid: boolean;
  zIndex?: number;
}

const TabCard = memo(function TabCard({
  tab,
  spaces,
  selectId,
  onOpenLink,
  onOpenSpacesPopup,
  onSelectSpace,
  onCloseTab,
  onTabOrderChange,
  onToggleTabPin,
  selectedSpace,
  isFirstTab,
  isLastTab,
  isGrid,
}: TabProps) {
  const [showIcons, setShowIcons] = useState(false);
  console.log("icons should be shown?", showIcons);
  const iconsRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        iconsRef.current &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node) &&
        !iconsRef.current.contains(event.target as Node)
      ) {
        setShowIcons(false);
      }
    }
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);
  return (
    <li
      className={`relative grid grid-rows-2 justify-items-center gap-3 rounded-lg border bg-slate-100  text-lg shadow-md ${
        isGrid
          ? "p-3 xl:flex xl:flex-col xl:items-center xl:justify-center xl:gap-3"
          : "px-4 py-2 xl:flex xl:items-center"
      } transition duration-200 ease-in-out hover:z-50 hover:-translate-y-1 hover:scale-105 hover:bg-slate-300 hover:shadow-lg xl:text-2xl`}
    >
      {isGrid && (
        <KebabBtn
          onClick={() => {
            setShowIcons(true);
          }}
          ref={btnRef}
        />
      )}
      <img
        src={tab.favIconUrl}
        className={`${
          isGrid ? "h-8 w-8" : "xl:h-4 xl:w-4"
        } border bg-white shadow`}
      />
      <a
        onClick={(e) => onOpenLink(e, tab)}
        className={`${
          isGrid ? "mt-0" : "mt-4"
        } line-clamp-1 max-w-full cursor-pointer flex-wrap hover:text-gray-500 hover:underline xl:mb-0 xl:mt-0`}
      >
        {tab.title}
      </a>
      {((showIcons && isGrid) || !isGrid) && (
        <div
          className={`flex gap-4 ${
            isGrid
              ? "absolute -right-8 top-0 z-50 flex-col justify-center rounded-lg bg-slate-100 p-2 shadow-md"
              : "mr-3 xl:ml-auto"
          } `}
          ref={iconsRef}
        >
          {!isGrid && (
            <PinBtn
              onToggleTabPin={onToggleTabPin}
              isPinned={tab.isPinned}
              id={tab.tabId}
              isGrid={isGrid}
            />
          )}
          <Dropdown
            button={
              <MoveToSpace
                spaces={spaces}
                id={tab.tabId?.toString()}
                onOpenSpacesPopup={onOpenSpacesPopup}
              />
            }
          >
            {tab.tabId?.toString() === selectId && (
              <div className="ml-5 h-14 w-52 px-3">
                <label
                  htmlFor={tab.id?.toString() || "spaces"}
                  className="text-xl"
                >
                  Move to space:
                </label>
                <select
                  id={tab.tabId?.toString() || "spaces"}
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
              isGrid={isGrid}
            />
          )}
          {!isLastTab && tab.tabId && (
            <ArrowDownBtn
              onMoveDown={onTabOrderChange}
              tabId={tab.tabId}
              direction="down"
              isGrid={isGrid}
            />
          )}
          <CloseBtn
            id={tab.tabId?.toString()}
            onCloseTab={onCloseTab}
            order={isGrid ? "order-first" : ""}
          />
        </div>
      )}
      {isGrid && (
        <PinBtn
          onToggleTabPin={onToggleTabPin}
          isPinned={tab.isPinned}
          id={tab.tabId}
          isGrid={isGrid}
        />
      )}
    </li>
  );
});

export default TabCard;
