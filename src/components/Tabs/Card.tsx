import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import type { Tab, Direction, Space } from "../../types";
import MoveToSpaceBtn from "./MoveToSpaceBtn";
import CloseBtn from "./CloseBtn";
import { Tooltip, Dropdown } from "../UI";
import PinBtn from "./PinBtn";
import KebabBtn from "./KebabBtn";
import { cn } from "@/utils/cn";
import { getToastVariant } from "@/utils/toastConfig";
import TabOrderBtn from "./TabOrderBtn";
import { directionStrategies } from "../../strategies";
import { useSpacesStore } from "@/store/spaces";
import { useTabsStore } from "@/store/tabs";
import { toast } from "react-hot-toast";
interface TabProps {
  tab: Tab;
  onCloseTab: (tabId?: number) => Promise<void>;
  onTabOrderChange: (tabId: number, direction: Direction) => Promise<void>;
  onToggleTabPin: (tabId: number, isPinned: boolean) => void;
  isLastTab: boolean;
  isFirstTab: boolean;
  isGrid: boolean;
  zIndex?: number;
  currentUserId?: string;
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
  onCloseTab,
  onTabOrderChange,
  onToggleTabPin,
  isFirstTab,
  isLastTab,
  isGrid,
  currentUserId,
}: TabProps) => {
  const { showIcons, setShowIcons, iconsRef, btnRef } = useToggleIcons();
  const { spaceId: originalSpaceId } = useParams<{ spaceId: string }>();
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [selectedTabId, setSelectedTabId] = useState<number>(0);
  const spaces = useSpacesStore((state) => state.spaces);
  const { tabs } = useTabsStore();

  function openLink(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
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

  function generateSpaceOptions(spaces: Space[]) {
    return spaces.map(({ id, title }) => {
      return (
        <option value={id} key={id}>
          {title}
        </option>
      );
    });
  }

  async function selectSpace(
    e: React.ChangeEvent<HTMLSelectElement>,
    originalSpaceId: string,
  ) {
    if (!e.target.value) return;
    setSelectedSpaceId(e.target.value);
    const updatedTab = tabs.find((tab) => tab.tabId === selectedTabId);
    if (!updatedTab) return;
    const message = {
      action: "moveTabToSpace",
      updatedTab,
      originalSpaceId: originalSpaceId || "global",
      spaceId: e.target.value,
      userId: currentUserId,
    };
    const response = await chrome.runtime.sendMessage(message);
    if (!response.success) {
      toast.error("Failed to move tab to space", getToastVariant("normal"));
      return;
    }
    toast.success("Tab moved to space", getToastVariant("normal"));
    return;
  }

  function openSpacesPopup(tabId?: number) {
    setSelectedSpaceId("");
    if (tabId) setSelectedTabId(tabId);
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
        alt="favicon"
        src={tab.favIconUrl}
        className={cn("border bg-white shadow", {
          "h-8 w-8": isGrid,
          "xl:h-4 xl:w-4": !isGrid,
        })}
      />
      <button
        type="button"
        onClick={(e) => openLink(e, tab)}
        className={cn(
          "mt-4 line-clamp-1 max-w-full cursor-pointer flex-wrap hover:text-gray-500 hover:underline xl:mb-0 xl:mt-0",
          { "mt-0": isGrid },
        )}
      >
        {tab.title}
      </button>
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
                onOpenSpacesPopup={openSpacesPopup}
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
                  onChange={(e) => selectSpace(e, originalSpaceId || "global")}
                  value={selectedSpaceId}
                >
                  <option value="">Select a space</option>
                  {generateSpaceOptions(spaces)}
                </select>
              </div>
            )}
          </Dropdown>
          {generateTabOrderBtns(tabMovingDirections, tab.tabId)}
          <CloseBtn
            id={tab.tabId}
            onCloseTab={onCloseTab}
            orderClass={cn({ "order-first": isGrid })}
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
};

export default TabCard;
