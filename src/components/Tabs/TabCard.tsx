import { Space } from "../../types/space";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Tab, Direction } from "../../types";
import MoveToSpaceBtn from "./MoveToSpaceBtn";
import CloseBtn from "./CloseBtn";
import { Tooltip, Dropdown } from "../UI";
import PinBtn from "./PinBtn";
import KebabBtn from "./KebabBtn";
import { cn } from "../../utils";
import TabOrderBtn from "./TabOrderBtn";
import { directionStrategies } from "../../strategies";
interface TabProps {
  tab: Tab;
  spaces: Space[];
  selectedTabId?: number;
  onOpenSpacesPopup: (tabId?: number) => void;
  onSelectSpace: (
    e: React.ChangeEvent<HTMLSelectElement>,
    originalSpaceId: string,
  ) => Promise<void>;
  onCloseTab: (tabId?: number) => Promise<void>;
  onTabOrderChange: (tabId: number, direction: Direction) => Promise<void>;
  onToggleTabPin: (tabId: number, isPinned: boolean) => void;
  selectedSpaceId: string;
  isLastTab: boolean;
  isFirstTab: boolean;
  isGrid: boolean;
  zIndex?: number;
}

function useToggleIcons() {
  const [showIcons, setShowIcons] = useState(false);
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
  return { showIcons, setShowIcons, iconsRef, btnRef };
}

const TabCard = ({
  tab,
  spaces,
  selectedTabId,
  onOpenSpacesPopup,
  onSelectSpace,
  onCloseTab,
  onTabOrderChange,
  onToggleTabPin,
  selectedSpaceId,
  isFirstTab,
  isLastTab,
  isGrid,
}: TabProps) => {
  const { showIcons, setShowIcons, iconsRef, btnRef } = useToggleIcons();
  const { spaceId: originalSpaceId } = useParams<{ spaceId: string }>();
  console.log("originalSpaceId", originalSpaceId);

  function openLink(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tab: Tab,
  ) {
    e.preventDefault();
    if (!tab.url) return;
    const newTabUrl = tab.url;
    chrome.tabs.create({ url: newTabUrl });
  }

  function getTabMovingDirections(
    isFirstTab: boolean,
    isLastTab: boolean,
    isGrid: boolean,
    strategies = directionStrategies,
  ) {
    const strategy = isGrid ? strategies.grid : strategies.list;
    if (isFirstTab) return strategy.isFirst;
    if (isLastTab) return strategy.isLast;
    return strategy.isMiddle;
  }

  const tabMovingDirections = getTabMovingDirections(
    isFirstTab,
    isLastTab,
    isGrid,
  );

  function getToolTipText(direction: Direction) {
    return `Move ${direction}`;
  }

  function generateTabOrderBtns(directions: Direction[], tabId?: number) {
    if (!tabId) return null;
    return directions.map((direction) => {
      return (
        <Tooltip key={tabId} data-tip={getToolTipText(direction)}>
          <TabOrderBtn
            onMoveUp={onTabOrderChange}
            onMoveDown={onTabOrderChange}
            tabId={tabId}
            direction={direction}
          />
        </Tooltip>
      );
    });
  }

  const tabHoverAnimation =
    "transition duration-200 ease-in-out hover:z-50 hover:-translate-y-1 hover:scale-105 hover:bg-slate-300 hover:shadow-lg";

  return (
    <li
      className={cn(
        "relative grid grid-rows-2 justify-items-center gap-3 rounded-lg border bg-slate-100 px-4 py-2 text-lg shadow-md xl:flex xl:items-center",
        {
          "p-3 xl:flex xl:flex-col xl:items-center xl:justify-center xl:gap-3":
            isGrid,
        },
        tabHoverAnimation,
      )}
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
        className={cn("border bg-white shadow", {
          "h-8 w-8": isGrid,
          "xl:h-4 xl:w-4": !isGrid,
        })}
      />
      <a
        onClick={(e) => openLink(e, tab)}
        className={cn(
          "mt-4 line-clamp-1 max-w-full cursor-pointer flex-wrap hover:text-gray-500 hover:underline xl:mb-0 xl:mt-0",
          { "mt-0": isGrid },
        )}
      >
        {tab.title}
      </a>
      {((showIcons && isGrid) || !isGrid) && (
        <div
          className={cn("mr-3 flex gap-4", !isGrid && "xl:ml-auto", {
            "absolute -right-8 top-0 z-50 flex-col justify-center rounded-lg bg-slate-100 p-2 shadow-md":
              isGrid,
          })}
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
              <MoveToSpaceBtn
                id={tab.tabId}
                onOpenSpacesPopup={onOpenSpacesPopup}
              />
            }
          >
            {tab.tabId === selectedTabId && (
              <div className="ml-5 h-14 w-52 px-3">
                <label
                  htmlFor={tab.id?.toString() || "spaces"}
                  className="text-xl"
                >
                  Move to space:
                </label>
                <select
                  id={tab.tabId?.toString() || "spaces"}
                  onChange={(e) =>
                    onSelectSpace(e, originalSpaceId || "global")
                  }
                  value={selectedSpaceId}
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
          {generateTabOrderBtns(tabMovingDirections, tab.tabId)}
          <Tooltip
            data-tip="Close Tab"
            orderClass={isGrid ? "order-first" : ""}
          >
            <CloseBtn id={tab.tabId} onCloseTab={onCloseTab} />
          </Tooltip>
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
};

export default TabCard;
