import { useState, useEffect, useRef } from "react";
import { useArchivedSpaceStore } from "../../store";
import { useLocation, Outlet, useParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Spaces from "./Spaces";
import Header from "./Header";
import Tabs from "./Tabs";
import CopyToClipboard from "./CopyToClipboard";
import {
  doc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../firebase-config";
import { sortTabs } from "../../utils/firestore";
import { validateSpaceTitle } from "../../utils/validate";
import ToggleViewBtn from "./ToggleViewBtn";
import useWindowId from "../../hooks/useWindowId";
import useLogin from "../../hooks/useLogin";
import { Tab } from "../../types/tab";
import { Space, SpaceDoc } from "../../types/space";
import Loader from "../UI/Loader";
interface Response {
  success: boolean;
}
const NewTab = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpaceSelectId, setActiveSpaceSelectId] = useState<
    string | undefined
  >();
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const { isLoggedin, currentUserId } = useLogin();
  const [tabOrder, setTabOrder] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTabsGrid, setIsTabsGrid] = useState<boolean>(false);
  const archivedSpaces: string[] = useArchivedSpaceStore(
    (state) => state.archivedSpaces,
  );
  const location = useLocation();
  const newSpaceInputRef = useRef<HTMLInputElement>(null);
  const currentWindowId = useWindowId();
  const { windowId: sharedWindowId, spaceId: currentSpaceId } = useParams<{
    windowId: string;
    spaceId: string;
  }>();

  useEffect(() => {
    setTabOrder([]);
  }, [location.pathname]);

  useEffect(() => {
    function hideArchivedSpacesTabs(
      currentTabs: Tab[],
      archivedSpaces: string[],
    ) {
      return currentTabs.filter(
        (tab) => !archivedSpaces.includes(tab.spaceId || ""),
      );
    }
    setTabs((t) => hideArchivedSpacesTabs(t, archivedSpaces));
  }, [archivedSpaces]);

  useEffect(() => {
    setIsLoading(true);
    const currentPath = location.pathname.split("/")[1];
    if (currentPath.includes("webtime")) return setIsLoading(false);
    if (currentUserId && currentWindowId) {
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
        if (currentPath !== "") {
          querySnapshot.forEach((doc) => {
            const tab = doc.data() as Tab;
            currentTabs.push(tab);
          });
          const sortedTabs = sortTabs(currentTabs, tabOrder);
          console.log("sortedTabs", sortedTabs);
          setTabs(sortedTabs);
          setIsLoading(false);
          console.log("tabs on snapshot updated");
          return;
        }
        querySnapshot.forEach((doc) => {
          const tab = doc.data() as Tab;
          if (tab.spaceId) return;
          currentTabs.push(tab);
        });
        const sortedTabs = sortTabs(currentTabs, tabOrder);
        console.log("sortedTabs", sortedTabs, "tabOrder", tabOrder);
        setTabs(sortedTabs);
        setIsLoading(false);
        console.log("tabs on snapshot updated");
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
    }
  }, [
    location.pathname,
    currentUserId,
    currentWindowId,
    sharedWindowId,
    tabOrder,
  ]);

  useEffect(() => {
    setIsLoading(true);
    const currentPath = location.pathname.split("/")[1];
    const spaceId = currentPath !== "" ? currentPath : "global";
    const parsedSharedWindowId = sharedWindowId ? parseInt(sharedWindowId) : "";
    if (currentPath.includes("webtime")) return setIsLoading(false);
    if (currentUserId) {
      const tabOrderDocRef = doc(
        db,
        "users",
        currentUserId,
        "tabOrders",
        spaceId,
      );
      const unsubscribeTabOrder = onSnapshot(tabOrderDocRef, (doc) => {
        console.log("有sharedWindowId", parsedSharedWindowId);
        console.log("有doc的windowId", doc.data()?.windowId);
        if (
          doc.exists() &&
          (doc.data()?.windowId === currentWindowId ||
            doc.data()?.windowId === parsedSharedWindowId)
        ) {
          const order: number[] = doc.data()?.tabOrder;
          if (order) setTabOrder(order);
          setIsLoading(false);
        }
      });
      return () => {
        unsubscribeTabOrder();
      };
    }
  }, [currentUserId, location.pathname, currentWindowId, sharedWindowId]);

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
      if (message.action === "tabClosed") {
        setTabs((t) => t.filter((tab) => tab.tabId !== message.tabId));
        sendResponse({ success: true });
      }
      if (
        message.action === "tabUpdated" &&
        (message.updatedTab.windowId === currentWindowId ||
          message.updatedTab.windowId === parsedSharedWindowId)
      ) {
        setTabs((t) => {
          const updatedTabs: Tab[] = [...t];
          const existingTab: Tab | undefined = updatedTabs.find(
            (tab) => tab.tabId === message.updatedTab.tabId,
          );
          if (existingTab) {
            Object.assign(existingTab, message.updatedTab);
          } else {
            updatedTabs.push(message.updatedTab);
          }
          return updatedTabs;
        });
        sendResponse({ success: true });
      }
      return true;
    };
    chrome.runtime.onMessage.addListener(handleMessagePassing);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessagePassing);
    };
  }, [currentWindowId, sharedWindowId]);

  function closeTab(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      const message = {
        action: "closeTab",
        tabId: parseInt(id),
        userId: currentUserId,
      };
      chrome.runtime.sendMessage(message, function () {
        toast.success("Tab Deleted", {
          className: "w-52 text-lg rounded-md shadow",
          id: "tab_deleted",
        });
        return true;
      });
    }
  }

  function openSpacesPopup(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setSelectedSpace("");
    const id: string | undefined = e.currentTarget.dataset.id;
    if (id) setActiveSpaceSelectId(id);
  }

  function selectSpace(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedSpace(e.target.value);
    if (e.target.value === "") return;
    const message = {
      action: "moveTabToSpace",
      updatedTab: tabs.find(
        (tab) => tab.tabId?.toString() === activeSpaceSelectId,
      ),
      spaceId: e.target.value,
      userId: currentUserId,
    };
    chrome.runtime.sendMessage(message, function (response) {
      if (response) {
        toast.success("Tab moved to space", {
          className: "w-60 text-lg rounded-md shadow",
          duration: 2000,
        });
      }
    });
  }

  function openAddSpacePopup() {
    const targetModal = document.getElementById(
      "add_space",
    ) as HTMLDialogElement | null;
    if (targetModal) targetModal.showModal();
  }

  function addNewSpace() {
    const newSpaceTitle: string | undefined =
      newSpaceInputRef.current?.value.trim();
    const errorToastId: string | null = validateSpaceTitle(
      spaces,
      undefined,
      newSpaceTitle,
    );
    if (errorToastId) {
      if (newSpaceInputRef.current) newSpaceInputRef.current.value = "";
      return;
    }
    chrome.runtime.sendMessage(
      { action: "addSpace", newSpaceTitle, userId: currentUserId },
      function (response) {
        if (response && newSpaceTitle) {
          toast.success("Space added", {
            className: "w-52 text-lg rounded-md shadow",
            duration: 2000,
          });
        }
      },
    );
    if (newSpaceInputRef.current) newSpaceInputRef.current.value = "";
  }

  function handleRemoveSpace(id: string) {
    const removedSpace = spaces.find((space) => space.id === id);
    if (!removedSpace) return;
    setSpaces(spaces.filter((space) => space.id !== id));
    setTabs(tabs.filter((tab) => tab.spaceId !== id));
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "removeSpace", spaceId: id, userId: currentUserId },
        function (response) {
          if (response) {
            resolve(response);
            return;
          }
          reject();
        },
      );
    });
  }

  async function handleTabOrderChange(
    tabId: number,
    direction: "up" | "down",
  ): Promise<void> {
    const movedTab = tabs.find((tab) => tab.tabId === tabId);
    if (!movedTab) return;
    const movedTabIndex = tabs.indexOf(movedTab);
    const newTabs = [...tabs];
    newTabs.splice(movedTabIndex, 1);
    newTabs.splice(movedTabIndex + (direction === "up" ? -1 : 1), 0, movedTab);
    setTabs(newTabs);
    await onTabOrderChange(newTabs, currentSpaceId);
  }

  function onTabOrderChange(
    newTabs: Tab[],
    spaceId: string | undefined,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const parsedSharedWindowId = sharedWindowId
        ? parseInt(sharedWindowId)
        : "";
      chrome.runtime.sendMessage(
        {
          action: "updateTabOrder",
          newTabs,
          spaceId,
          userId: currentUserId,
          windowId: parsedSharedWindowId || currentWindowId,
        },
        function (response) {
          if (response) {
            resolve(response);
          }
          reject();
        },
      );
    });
  }

  async function copySpaceLink() {
    try {
      const link = window.location.href;
      const sharedLink = `${link}/share/${currentWindowId}`;
      await navigator.clipboard.writeText(sharedLink);
      toast.success("Link copied!", {
        className: "w-52 text-lg rounded-md shadow",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy link. Please try again.", {
        className: "w-72 text-lg rounded-md shadow",
      });
    }
  }

  function sortTabsByPin(tabs: Tab[], tabId?: number) {
    const newTabs = tabs.map((tab) => {
      if (tabId && tab.tabId === tabId) {
        return {
          ...tab,
          isPinned: !tab.isPinned,
        };
      }
      return tab;
    });
    return newTabs.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }

  function toggleTabPin(tabId?: number, isPinned?: boolean) {
    const newTabs = sortTabsByPin(tabs, tabId);
    setTabs(newTabs);
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: "toggleTabPin",
          tabId,
          isPinned,
          newTabs,
          spaceId: location.pathname.split("/")[1] || "global",
        },
        function (response) {
          if (response) {
            resolve(response);
            return;
          }
          reject();
        },
      );
    });
  }

  function toggleTabsLayout() {
    setIsTabsGrid((prev) => !prev);
  }

  function handleSpaceTitleChange(
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) {
    const newSpaces = spaces.map((space) => {
      if (space.id === id) {
        if (e.target.value.length === 11) {
          toast.error("Space name should be less than 10 characters", {
            className: "w-[400px] text-lg rounded-md shadow",
          });
          return space;
        }
        return {
          ...space,
          title: e.target.value,
        };
      }
      return space;
    });
    setSpaces(newSpaces);
  }

  function handleEditSpace(id: string) {
    const newSpaces = spaces.map((space) => {
      if (space.id === id) {
        return {
          ...space,
          isEditing: true,
        };
      }
      return space;
    });
    setSpaces(newSpaces);
  }

  function handleSpaceEditBlur(
    e: React.FocusEvent<HTMLInputElement, Element>,
    id: string,
  ) {
    if (!e.target.value) return;
    const errorToastId: string | null = validateSpaceTitle(
      spaces,
      id,
      e.target.value,
    );
    if (errorToastId) {
      return;
    }
    const newSpaces = spaces.map((space) => {
      if (space.id === id) {
        return {
          ...space,
          isEditing: false,
        };
      }
      return space;
    });
    setSpaces(newSpaces);
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: "updateSpaceTitle",
          spaceId: id,
          newSpaceTitle: newSpaces.find((space) => space.id === id)?.title,
          userId: currentUserId,
        },
        function (response) {
          if (response) {
            resolve(response);
            return;
          }
          reject();
        },
      );
    });
  }

  const isWebTime = location.pathname.includes("/webtime");

  return (
    <>
      <Header isWebtimePage={isWebTime} />
      <div
        className={`flex min-h-screen gap-5 overflow-x-hidden py-8 ${
          isWebTime ? "px-24" : "pl-[400px]"
        } xl:ml-2`}
      >
        {isLoggedin && (
          <Spaces
            spaces={spaces}
            onOpenAddSpacePopup={openAddSpacePopup}
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
        <div
          className={`flex ${
            isWebTime ? "w-full" : "w-5/6"
          } relative z-10 flex-col`}
        >
          <div className="flex items-center gap-8 pb-4 pt-[72px]">
            {!location.pathname.includes("/webtime") && (
              <>
                <h1 className="text-3xl font-bold">Your Tabs</h1>
                {location.pathname !== "/" && (
                  <CopyToClipboard onCopySpaceLink={copySpaceLink} />
                )}
              </>
            )}
          </div>
          <Outlet />
          <Toaster />
          {!location.pathname.includes("/webtime") && (
            <ToggleViewBtn
              onToggleView={toggleTabsLayout}
              className="mb-5 w-52 rounded-md bg-slate-100 px-2 py-3 text-xl shadow hover:bg-orange-700 hover:bg-opacity-70 hover:text-white"
            />
          )}
          {isLoading && (
            <Loader text="Loading Data..." animateClass="animate-spin" />
          )}
          {!isLoading && (
            <Tabs
              tabs={tabs}
              spaces={spaces}
              activeSpaceSelectId={activeSpaceSelectId}
              selectedSpace={selectedSpace}
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
      </div>
    </>
  );
};

export default NewTab;
