import { useState, useEffect } from "react";
import {
  useArchivedSpaceStore,
  useSpacesStore,
  useTabsStore,
} from "@/store";
import { useLocation, Outlet, useParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Spaces from "@/components/Spaces";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import MainContainer from "@/components/MainContainer";
import CopyToClipboard from "./CopyToClipboard";
import { firebaseService } from "@/utils/firebaseService";
import { cn } from "@/utils/cn";
import { getToastVariant } from "@/utils/toastConfig";
import ToggleViewBtn from "./ToggleViewBtn";
import useWindowId from "@/hooks/useWindowId";
import useLogin from "@/hooks/useLogin";
import type { Tab, TabOrder, Space, Direction } from "@/types";
import { Loader } from "@/components/UI";

interface Response {
  success: boolean;
}
const Home = () => {
  const { isLoggedin, currentUserId } = useLogin();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTabsGrid, setIsTabsGrid] = useState<boolean>(false);
  const location = useLocation();
  const currentWindowId = useWindowId();
  const { windowId: sharedWindowId, spaceId: currentSpaceId } = useParams<{
    windowId: string;
    spaceId: string;
  }>();

  const archivedSpaces: string[] = useArchivedSpaceStore(
    (state) => state.archivedSpaces,
  );

  const tabs: Tab[] = useTabsStore((state) => state.tabs);
  const tabOrder: number[] = useTabsStore((state) => state.tabOrder);

  const {
    hideArchivedTabs,
    sortTabsByTabOrder,
    closeTab: removeTab,
    updateTab: updateTabInTabs,
    removeTabsFromSpace,
    moveTabOrder,
    sortTabsByPin,
    setTabOrder,
  } = useTabsStore();

  const { spaces, setSpaces, removeSpace } = useSpacesStore();

  useEffect(() => {
    hideArchivedTabs(archivedSpaces);
  }, [archivedSpaces, hideArchivedTabs]);

  useEffect(() => {
    setIsLoading(true);
    const currentPath = location.pathname.split("/")[1];
    if (currentPath.includes("webtime")) return setIsLoading(false);
    if (!currentUserId || !currentWindowId) return setIsLoading(false);
    const tabsCollectionRef = firebaseService.getCollectionRef([
      "users",
      currentUserId,
      "tabs",
    ]);
    const spacesCollectionRef = firebaseService.getCollectionRef([
      "users",
      currentUserId,
      "spaces",
    ]);
    const tabQ = firebaseService.createTabsQuery(
      tabsCollectionRef,
      currentWindowId,
      sharedWindowId,
      currentPath,
    );
    const unsubscribeTab = firebaseService.subscribeToQuery<Tab>(
      tabQ,
      (currentTabs) => {
        sortTabsByTabOrder(currentTabs);
        setIsLoading(false);
        return;
      },
    );
    const spaceQ = firebaseService.createSpacesQuery(
      spacesCollectionRef,
      "createdAt",
      "asc",
    );

    const unsubscribeSpace = firebaseService.subscribeToQuery<Space>(
      spaceQ,
      (currentSpaces) => {
        const spacesWithEditingState = currentSpaces.map((space) => ({
          ...space,
          isEditing: false,
        }));
        setSpaces(spacesWithEditingState);
        setIsLoading(false);
      },
    );

    return () => {
      unsubscribeTab();
      unsubscribeSpace();
    };
  }, [
    location.pathname,
    currentUserId,
    currentWindowId,
    sharedWindowId,
    tabOrder,
    sortTabsByTabOrder,
    setSpaces,
  ]);

  useEffect(() => {
    const spaceId = currentSpaceId || "global";
    const parsedSharedWindowId = sharedWindowId
      ? Number.parseInt(sharedWindowId)
      : "";
    if (location.pathname.includes("webtime")) return setIsLoading(false);
    if (!currentUserId || !currentWindowId) return setIsLoading(false);
    const tabOrderDocRef = firebaseService.getDocRef([
      "users",
      currentUserId,
      "tabOrders",
      spaceId,
    ]);
    const unsubscribeTabOrder = firebaseService.subscribeToDoc<TabOrder>(
      tabOrderDocRef,
      (tabOrderData) => {
        if (
          tabOrderData.windowId !== currentWindowId &&
          tabOrderData.windowId !== parsedSharedWindowId
        ) {
          return;
        }
        setTabOrder(tabOrderData.tabOrder);
      },
    );
    return () => {
      unsubscribeTabOrder();
    };
  }, [
    currentUserId,
    location.pathname,
    currentSpaceId,
    currentWindowId,
    sharedWindowId,
    setTabOrder,
  ]);

  useEffect(() => {
    const parsedSharedWindowId = sharedWindowId
      ? Number.parseInt(sharedWindowId)
      : "";
    const handleMessagePassing = (
      message: {
        action: string;
        tabId: number | undefined;
        updatedTab: Tab;
      },
      _: chrome.runtime.MessageSender | undefined,
      sendResponse: (response: Response) => void,
    ) => {
      if (message.action === "tabClosed" && message.tabId) {
        removeTab(message.tabId);
        sendResponse({ success: true });
      }
      if (
        message.action === "tabUpdated" &&
        (message.updatedTab.windowId === currentWindowId ||
          message.updatedTab.windowId === parsedSharedWindowId)
      ) {
        updateTabInTabs(message.updatedTab);
        sendResponse({ success: true });
      }
      return true;
    };
    chrome.runtime.onMessage.addListener(handleMessagePassing);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessagePassing);
    };
  }, [currentWindowId, sharedWindowId, removeTab, updateTabInTabs]);

  async function closeTab(tabId: number | undefined) {
    if (!tabId) return;
    const message = {
      action: "closeTab",
      tabId,
      userId: currentUserId,
    };
    try {
      const response = await chrome.runtime.sendMessage(message);
      if (!response.success) throw new Error("Failed to close tab");
      toast.success("Tab Closed", getToastVariant("small"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error("This tab is already closed", getToastVariant("larger"));
      }
    }
    return;
  }

  async function removeSpaceFromFirestore(spaceId: string, userId: string) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "removeSpace",
        spaceId,
        userId,
      });
      if (!response.success) {
        throw new Error(
          "Failed to remove space, tabs, or taborder in Firestore",
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  }

  async function handleRemoveSpace(id: string) {
    const removedSpace = spaces.find((space) => space.id === id);
    if (!removedSpace) return;
    removeSpace(id);
    removeTabsFromSpace(id);
    await removeSpaceFromFirestore(id, currentUserId);
  }

  async function handleTabOrderChange(
    tabId: number,
    direction: Direction,
  ): Promise<void> {
    const movedTab = tabs.find((tab) => tab.tabId === tabId);
    if (!movedTab) return;
    moveTabOrder(tabId, direction);
    const newTabs = useTabsStore.getState().tabs;
    await onTabOrderChange(newTabs, currentSpaceId);
  }

  async function onTabOrderChange(
    newTabs: Tab[],
    spaceId: string | undefined,
  ): Promise<void> {
    const parsedSharedWindowId = sharedWindowId
      ? Number.parseInt(sharedWindowId)
      : "";
    try {
      const response = await chrome.runtime.sendMessage({
        action: "updateTabOrder",
        newTabs,
        spaceId,
        userId: currentUserId,
        windowId: parsedSharedWindowId || currentWindowId,
      });
      if (!response.success) throw new Error("Failed to update tab order");
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  }

  async function copySpaceLink() {
    try {
      const link = window.location.href;
      const sharedLink = `${link}/share/${currentWindowId}`;
      await navigator.clipboard.writeText(sharedLink);
      toast.success("Link copied!", getToastVariant("small"));
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to copy link. Please try again.",
        getToastVariant("large"),
      );
    }
  }

  async function toggleTabPin(tabId: number, isPinned: boolean) {
    sortTabsByPin(tabId);
    const newTabs = useTabsStore.getState().tabs;
    try {
      const response = await chrome.runtime.sendMessage({
        action: "toggleTabPin",
        tabId,
        isPinned,
        newTabs,
        spaceId: currentSpaceId || "global",
      });
      if (!response.success) throw new Error("Failed to toggle tab pin");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message, getToastVariant("large"));
      }
    }
  }

  function toggleTabsLayout() {
    setIsTabsGrid((prev) => !prev);
  }

  const isWebTime = location.pathname.includes("/webtime");
  const isRoot = location.pathname === "/";
  const tabsHeaderClasses = cn("flex relative z-10 flex-col", {
    "w-full": isWebTime,
    "w-5/6": !isWebTime,
  });

  return (
    <>
      <Header isWebtimePage={isWebTime} />
      <MainContainer isWebTime={isWebTime}>
        {isLoggedin && (
          <Spaces
            currentSpaceId={currentSpaceId}
            onRemoveSpace={handleRemoveSpace}
            isWebtimePage={isWebTime}
            currentUserId={currentUserId}
          />
        )}
        <div className={tabsHeaderClasses}>
          <div className="flex items-center gap-8 pb-4">
            {!isWebTime && (
              <>
                <h1 className="text-3xl font-bold">Your Tabs</h1>
                {!isRoot && <CopyToClipboard onCopySpaceLink={copySpaceLink} />}
              </>
            )}
          </div>
          <Outlet />
          <Toaster />
          {!isWebTime && (
            <ToggleViewBtn
              onToggleView={toggleTabsLayout}
              className="mb-5 w-52 rounded-md bg-slate-100 px-2 py-3 text-xl shadow hover:bg-orange-700 hover:bg-opacity-70 hover:text-white"
            />
          )}
          {isLoading && tabs.length === 0 && (
            <Loader text="Loading Data..." animateClass="animate-spin" />
          )}
          {!isLoading && (
            <Tabs
              isLoggedin={isLoggedin}
              closeTab={closeTab}
              handleTabOrderChange={handleTabOrderChange}
              toggleTabPin={toggleTabPin}
              isGrid={isTabsGrid}
              currentUserId={currentUserId}
            />
          )}
        </div>
      </MainContainer>
    </>
  );
};

export default Home;
