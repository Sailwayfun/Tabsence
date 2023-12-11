import { useState, useEffect, useRef } from "react";
import { useSpaceStore } from "../../store";
import { FieldValue } from "firebase/firestore";
import { useLocation, Outlet } from "react-router-dom";
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
import ToggleViewBtn from "./ToggleViewBtn";

export interface Tab extends chrome.tabs.Tab {
  lastAccessed: FieldValue;
  spaceId?: string;
  tabId: number | undefined;
  isPinned: boolean;
}
interface SpaceDoc {
  title: string;
  isArchived?: boolean;
}

export interface Space extends SpaceDoc {
  id: string;
}
interface Response {
  success: boolean;
}
const NewTab = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  // const [filteredTabs, setFilteredTabs] = useState<Tab[]>([]);
  // const [filteredSpaces, setFilteredSpaces] = useState<Space[]>([]);
  // const [showArchived, setShowArchived] = useState<boolean>(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpaceSelectId, setActiveSpaceSelectId] = useState<
    string | undefined
  >();
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [activeSpaceId, setActiveSpaceId] = useState<string>("");
  const [isLoggedin, setIsLoggedin] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [tabOrder, setTabOrder] = useState<number[]>([]);
  const [isTabsGrid, setIsTabsGrid] = useState<boolean>(false);
  const [currentWindowId, setCurrentWindowId] = useState<number>(0);
  // console.log("current order", tabOrder);
  console.log("current windowId", currentWindowId);
  console.log("current tabs", tabs);
  const archivedSpaces: string[] = useSpaceStore(
    (state) => state.archivedSpaces,
  );
  const location = useLocation();
  const newSpaceInputRef = useRef<HTMLInputElement>(null);
  // console.log(
  //   "spaces",
  //   spaces.map((space) => space.id),
  // );
  const tabOrderRef = useRef<number[]>(tabOrder);
  tabOrderRef.current = tabOrder;
  useEffect(() => {
    let active = true;
    async function getCurrentWindowId(): Promise<number> {
      return new Promise((resolve, reject) => {
        chrome.windows.getCurrent((window) => {
          if (active && window && window.id) {
            resolve(window.id);
            return;
          }
          reject();
        });
      });
    }
    getCurrentWindowId()
      .then((res) => {
        setCurrentWindowId(res);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, []);
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
    function getUserId(): Promise<void> {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(["userId"], function (result) {
          if (result.userId) {
            setCurrentUserId(result.userId);
            setIsLoggedin(true);
            resolve();
            return;
          }
          reject();
        });
      });
    }
    getUserId().catch((err) => console.error(err));
  }, []);
  useEffect(() => {
    const currentPath = location.pathname.split("/")[1];
    if (currentPath === "webtime") return;
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
              where("windowId", "==", currentWindowId),
              where("spaceId", "==", currentPath),
            )
          : query(tabsCollectionRef, where("windowId", "==", currentWindowId));
      const unsubscribeTab = onSnapshot(tabQ, (querySnapshot) => {
        const currentTabs: Tab[] = [];
        if (currentPath !== "") {
          querySnapshot.forEach((doc) => {
            const tab = doc.data() as Tab;
            currentTabs.push(tab);
          });
          // console.log("currentTabs", currentTabs);
          // console.log("tabOrder", tabOrder);
          const sortedTabs = sortTabs(currentTabs, tabOrderRef.current);
          console.log("sortedTabs", sortedTabs);
          setTabs(sortedTabs);
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
        console.log("tabs on snapshot updated");
        return;
      });
      const spaceQ = query(spacesCollectionRef, orderBy("createdAt", "asc"));
      const unsubscribeSpace = onSnapshot(spaceQ, (querySnapshot) => {
        const currentSpaces: Space[] = [];
        querySnapshot.forEach((doc) => {
          const space = doc.data() as SpaceDoc;
          currentSpaces.push({ id: doc.id, ...space });
        });
        setSpaces(currentSpaces);
        const currentActiveId = currentSpaces.find(
          (space) => space.id === currentPath,
        )?.id;
        if (currentPath === "") setActiveSpaceId("");
        if (currentActiveId) setActiveSpaceId(currentActiveId);
      });
      return () => {
        unsubscribeTab();
        unsubscribeSpace();
      };
    }
  }, [location.pathname, currentUserId, currentWindowId, tabOrder]);
  useEffect(() => {
    const currentPath = location.pathname.split("/")[1];
    const spaceId = currentPath !== "" ? currentPath : "global";
    if (currentUserId) {
      const tabOrderDocRef = doc(
        db,
        "users",
        currentUserId,
        "tabOrders",
        spaceId,
      );
      const unsubscribeTabOrder = onSnapshot(tabOrderDocRef, (doc) => {
        if (doc.exists() && doc.data()?.windowId === currentWindowId) {
          const order: number[] = doc.data()?.tabOrder;
          if (order) setTabOrder(order);
        }
      });
      return () => {
        unsubscribeTabOrder();
      };
    }
  }, [currentUserId, location.pathname, currentWindowId]);
  useEffect(() => {
    const handleMessagePassing = (
      request: {
        action: string;
        tabId: number | undefined;
        updatedTab: Tab;
      },
      _: chrome.runtime.MessageSender | undefined,
      sendResponse: <T extends Response>(response: T) => void,
    ) => {
      if (request.action === "tabClosed") {
        setTabs((t) => t.filter((tab) => tab.tabId !== request.tabId));
        sendResponse({ success: true });
      }
      if (
        request.action === "tabUpdated" &&
        request.updatedTab.windowId === currentWindowId
      ) {
        setTabs((t) => {
          const updatedTabs: Tab[] = [...t];
          const existingTab: Tab | undefined = updatedTabs.find(
            (tab) => tab.tabId === request.updatedTab.tabId,
          );
          if (existingTab) {
            Object.assign(existingTab, request.updatedTab);
          } else {
            updatedTabs.push(request.updatedTab);
          }
          return updatedTabs;
        });
        setTabOrder((o) => {
          if (request.updatedTab.tabId === undefined) return o;
          const updatedOrder = [...o];
          const existingIndex = updatedOrder.findIndex(
            (id) => id === request.updatedTab.tabId,
          );
          if (existingIndex !== -1) {
            updatedOrder.splice(existingIndex, 1);
          }
          updatedOrder.push(request.updatedTab.tabId);
          return updatedOrder;
        });
        sendResponse({ success: true });
        console.log("tabupdated");
      }
      return true;
    };
    chrome.runtime.onMessage.addListener(handleMessagePassing);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessagePassing);
    };
  }, [currentWindowId]);
  // useEffect(() => {
  //   chrome.storage.local.get(["isLoggedin", "currentUser"], function (result) {
  //     if (result.isLoggedin && result.currentUser) {
  //       setIsLoggedin(true);
  //       setCurrentUserId(result.currentUser);
  //       return;
  //     }
  //   });
  // }, []);
  function openLink(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tab: Tab,
  ) {
    e.preventDefault();
    if (!tab.url) return;
    const newTabUrl = tab.url;
    chrome.tabs.create({ url: newTabUrl });
  }
  function closeTab(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      const request = {
        action: "closeTab",
        tabId: parseInt(id),
        userId: currentUserId,
      };
      chrome.runtime.sendMessage(request, function (response) {
        const oldTabs = tabs.filter((tab) => tab.tabId !== parseInt(id));
        if (response.success) setTabs(oldTabs);
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
    const request = {
      action: "moveTabToSpace",
      updatedTab: tabs.find(
        (tab) => tab.tabId?.toString() === activeSpaceSelectId,
      ),
      spaceId: e.target.value,
      userId: currentUserId,
    };
    chrome.runtime.sendMessage(request, function (response) {
      const newTabs = tabs.filter(
        (tab) => tab.tabId?.toString() !== activeSpaceSelectId,
      );
      if (response) setTabs(newTabs);
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
    if (!newSpaceTitle || newSpaceTitle.trim().length === 0)
      return toast.error("Please enter a space name", {
        className: "w-60 text-lg rounded-md shadow",
      });
    if (newSpaceTitle.length > 10)
      return toast.error("Space name should be less than 10 characters", {
        className: "w-[400px] text-lg rounded-md shadow",
      });
    if (
      spaces.some(
        (space) => space.title.toLowerCase() === newSpaceTitle.toLowerCase(),
      )
    )
      return toast.error("Space name already exists", {
        className: "w-60 text-lg rounded-md shadow",
      });
    if (spaces.length >= 5)
      return toast.error("You can only create up to 5 spaces", {
        className: "w-72 text-lg rounded-md shadow",
      });
    chrome.runtime.sendMessage(
      { action: "addSpace", newSpaceTitle, userId: currentUserId },
      function (response) {
        if (response) {
          setSpaces((s) => [...s, { title: newSpaceTitle, id: response.id }]);
          return;
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
    await onTabOrderChange(newTabs, activeSpaceId);
  }

  function onTabOrderChange(
    newTabs: Tab[],
    spaceId: string | undefined,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: "updateTabOrder",
          newTabs,
          spaceId,
          userId: currentUserId,
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
      await navigator.clipboard.writeText(link);
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
    return newTabs.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
  }
  function toggleTabPin(tabId?: number, isPinned?: boolean) {
    setTabs((t) => sortTabsByPin(t, tabId));
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: "toggleTabPin",
          tabId,
          isPinned,
          newTabs: sortTabsByPin(tabs, tabId),
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
  return (
    <>
      <Header />
      <div className="flex min-h-screen w-full gap-5 overflow-x-hidden py-8 pl-[400px] pr-10 xl:ml-2">
        {isLoggedin && (
          <Spaces
            spaces={spaces}
            onOpenAddSpacePopup={openAddSpacePopup}
            ref={newSpaceInputRef}
            onAddNewSpace={addNewSpace}
            currentSpaceId={activeSpaceId}
            onRemoveSpace={handleRemoveSpace}
          />
        )}
        <div className="flex w-4/5 flex-col">
          <div className="flex items-center gap-8 pb-4">
            {location.pathname !== "/webtime" && (
              <>
                <h1 className="text-3xl font-bold">Your Tabs</h1>
                <CopyToClipboard onCopySpaceLink={copySpaceLink} />
              </>
            )}
            {location.pathname === "/webtime" && (
              <h1 className="text-3xl font-bold">
                Your Time Spent on Websites
              </h1>
            )}
          </div>
          <Outlet />
          <Toaster />
          <ToggleViewBtn
            onToggleView={toggleTabsLayout}
            className={`mb-5 w-52 rounded-md bg-slate-100 px-2 py-3 text-xl shadow hover:bg-orange-700 hover:bg-opacity-70 hover:text-white ${
              location.pathname === "/webtime" ? "hidden" : ""
            }`}
          />
          <Tabs
            tabs={tabs}
            spaces={spaces}
            activeSpaceSelectId={activeSpaceSelectId}
            selectedSpace={selectedSpace}
            isLoggedin={isLoggedin}
            openLink={openLink}
            openSpacesPopup={openSpacesPopup}
            selectSpace={selectSpace}
            closeTab={closeTab}
            handleTabOrderChange={handleTabOrderChange}
            toggleTabPin={toggleTabPin}
            isGrid={isTabsGrid}
          />
        </div>
      </div>
    </>
  );
};

export default NewTab;
