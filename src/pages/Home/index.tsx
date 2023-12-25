import { useState, useEffect, useRef } from "react";
import { useArchivedSpaceStore } from "../../store/archiveSpace";
import { useSpaceStore } from "../../store/spaces";
import { useTabStore } from "../../store/tabs";
import { useLocation, Outlet, useParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Spaces from "../../components/Spaces";
import Header from "../../components/Header";
import Tabs from "../../components/Tabs";
import MainContainer from "../../components/MainContainer";
import CopyToClipboard from "./CopyToClipboard";
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../firebase-config";
import { cn, validateSpaceTitle, getToastVariant } from "../../utils";
import ToggleViewBtn from "./ToggleViewBtn";
import useWindowId from "../../hooks/useWindowId";
import useLogin from "../../hooks/useLogin";
import { Tab, Space, SpaceDoc, Direction } from "../../types";
import { Loader } from "../../components/UI";

interface Response {
  success: boolean;
}
const Home = () => {
  const [selectedTabId, setSelectedTabId] = useState<number>(0);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const { isLoggedin, currentUserId } = useLogin();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTabsGrid, setIsTabsGrid] = useState<boolean>(false);

  const location = useLocation();
  const newSpaceInputRef = useRef<HTMLInputElement>(null);
  const currentWindowId = useWindowId();
  const { windowId: sharedWindowId, spaceId: currentSpaceId } = useParams<{
    windowId: string;
    spaceId: string;
  }>();

  const archivedSpaces: string[] = useArchivedSpaceStore(
    (state) => state.archivedSpaces,
  );

  const tabs: Tab[] = useTabStore((state) => state.tabs);
  const tabOrder: number[] = useTabStore((state) => state.tabOrder);
  const hideArchivedTabs = useTabStore((state) => state.hideArchivedTabs);
  const sortTabsByTabOrder = useTabStore((state) => state.sortTabsByTabOrder);
  const removeTab = useTabStore((state) => state.closeTab);
  const updateTabInTabs = useTabStore((state) => state.updateTab);
  const removeTabsFromSpace = useTabStore((state) => state.removeTabsFromSpace);
  const moveTabOrder = useTabStore((state) => state.moveTabOrder);
  const moveTabToSpace = useTabStore((state) => state.moveTabToSpace);
  const sortTabsByPin = useTabStore((state) => state.sortTabsByPin);
  const setTabOrder = useTabStore((state) => state.setTabOrder);

  const spaces: Space[] = useSpaceStore((state) => state.spaces);
  const setSpaces = useSpaceStore((state) => state.setSpaces);
  const removeSpace = useSpaceStore((state) => state.removeSpace);
  const startEditingSpaceTitle = useSpaceStore(
    (state) => state.startEditingSpaceTitle,
  );
  const inputSpaceTitle = useSpaceStore((state) => state.inputSpaceTitle);
  const changeSpaceTitle = useSpaceStore((state) => state.changeSpaceTitle);

  useEffect(() => {
    hideArchivedTabs(archivedSpaces);
  }, [archivedSpaces, hideArchivedTabs]);

  useEffect(() => {
    setIsLoading(true);
    const currentPath = location.pathname.split("/")[1];
    if (currentPath.includes("webtime")) return setIsLoading(false);
    if (!currentUserId || !currentWindowId) return setIsLoading(false);
    const tabsCollectionRef = collection(db, "users", currentUserId, "tabs");
    const spacesCollectionRef = collection(
      db,
      "users",
      currentUserId,
      "spaces",
    );
    const tabQ =
      currentPath !== ""
        ? query(
            tabsCollectionRef,
            where("windowId", "in", [
              currentWindowId,
              sharedWindowId ? parseInt(sharedWindowId) : "",
            ]),
            where("spaceId", "==", currentPath),
          )
        : query(
            tabsCollectionRef,
            where("windowId", "in", [
              currentWindowId,
              sharedWindowId ? parseInt(sharedWindowId) : "",
            ]),
          );
    const unsubscribeTab = onSnapshot(tabQ, (querySnapshot) => {
      const currentTabs: Tab[] = [];
      querySnapshot.forEach((doc) => {
        const tab = doc.data() as Tab;
        currentTabs.push(tab);
      });
      sortTabsByTabOrder(currentTabs);
      setIsLoading(false);
      return;
    });
    const spaceQ = query(spacesCollectionRef, orderBy("createdAt", "asc"));
    const unsubscribeSpace = onSnapshot(spaceQ, (querySnapshot) => {
      const currentSpaces: Space[] = [];
      querySnapshot.forEach((doc) => {
        const space = doc.data() as SpaceDoc;
        currentSpaces.push({ id: doc.id, isEditing: false, ...space });
      });
      setSpaces(currentSpaces);
      setIsLoading(false);
    });
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
    const parsedSharedWindowId = sharedWindowId ? parseInt(sharedWindowId) : "";
    if (location.pathname.includes("webtime")) return setIsLoading(false);
    if (!currentUserId || !currentWindowId) return setIsLoading(false);
    const tabOrderDocRef = doc(
      db,
      "users",
      currentUserId,
      "tabOrders",
      spaceId,
    );
    const unsubscribeTabOrder = onSnapshot(tabOrderDocRef, (docSnapshot) => {
      if (!docSnapshot.exists()) return;
      const tabOrderData = docSnapshot.data();
      if (
        tabOrderData.windowId !== currentWindowId &&
        tabOrderData.windowId !== parsedSharedWindowId
      ) {
        return;
      }
      setTabOrder(tabOrderData.tabOrder);
    });
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
    const parsedSharedWindowId = sharedWindowId ? parseInt(sharedWindowId) : "";
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

  function openSpacesPopup(tabId?: number) {
    setSelectedSpaceId("");
    if (tabId) setSelectedTabId(tabId);
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
    moveTabToSpace(updatedTab);
    toast.success("Tab moved to space", getToastVariant("normal"));
    return;
  }

  async function addNewSpace() {
    const newSpaceTitle: string | undefined =
      newSpaceInputRef.current?.value.trim();
    const errorToastId: string | null = validateSpaceTitle(
      spaces,
      undefined,
      newSpaceTitle,
    );
    if (errorToastId && newSpaceInputRef.current) {
      newSpaceInputRef.current.value = "";
      return;
    }
    const response = await chrome.runtime.sendMessage({
      action: "addSpace",
      newSpaceTitle,
      userId: currentUserId,
    });
    if (!response.id || !newSpaceTitle) return;
    toast.success("Space added", getToastVariant("small"));
    if (newSpaceInputRef.current) newSpaceInputRef.current.value = "";
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
    const newTabs = useTabStore.getState().tabs;
    await onTabOrderChange(newTabs, currentSpaceId);
  }

  async function onTabOrderChange(
    newTabs: Tab[],
    spaceId: string | undefined,
  ): Promise<void> {
    const parsedSharedWindowId = sharedWindowId ? parseInt(sharedWindowId) : "";
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
    const newTabs = useTabStore.getState().tabs;
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

  function handleSpaceTitleChange(
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) {
    const newTitle = e.target.value;
    inputSpaceTitle(newTitle, id);
  }

  function handleEditSpace(id: string) {
    startEditingSpaceTitle(id);
  }

  async function handleSpaceEditBlur(
    e: React.FocusEvent<HTMLInputElement, Element>,
    id: string,
  ) {
    const newTitle = e.target.value.trim();
    changeSpaceTitle(newTitle, id);
    await updateSpaceTitleInFirestore(id, newTitle, currentUserId);
  }

  async function updateSpaceTitleInFirestore(
    spaceId: string,
    newSpaceTitle: string | undefined,
    userId: string,
  ) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "updateSpaceTitle",
        spaceId,
        newSpaceTitle,
        userId,
      });
      if (!response.success) {
        throw new Error("Failed to update space title in Firestore");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
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
            spaces={spaces}
            ref={newSpaceInputRef}
            onAddNewSpace={addNewSpace}
            currentSpaceId={currentSpaceId}
            onRemoveSpace={handleRemoveSpace}
            onSpaceEditBlur={handleSpaceEditBlur}
            onSpaceTitleChange={handleSpaceTitleChange}
            onEditSpace={handleEditSpace}
            isWebtimePage={isWebTime}
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
              tabs={tabs}
              spaces={spaces}
              selectedTabId={selectedTabId}
              selectedSpaceId={selectedSpaceId}
              isLoggedin={isLoggedin}
              openSpacesPopup={openSpacesPopup}
              selectSpace={selectSpace}
              closeTab={closeTab}
              handleTabOrderChange={handleTabOrderChange}
              toggleTabPin={toggleTabPin}
              isGrid={isTabsGrid}
            />
          )}
        </div>
      </MainContainer>
    </>
  );
};

export default Home;
