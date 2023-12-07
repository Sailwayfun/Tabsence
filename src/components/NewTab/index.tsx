import { useState, useEffect, useRef } from "react";
import { useSpaceStore } from "../../store";
import { FieldValue } from "firebase/firestore";
import { useLocation, Outlet } from "react-router-dom";
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
  const [activePopupId, setActivePopupId] = useState<string | undefined>();
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [activeSpaceId, setActiveSpaceId] = useState<string>("");
  const [isLoggedin, setIsLoggedin] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [tabOrder, setTabOrder] = useState<number[]>([]);
  console.log("current order", tabOrder);
  const archivedSpaces: string[] = useSpaceStore(
    (state) => state.archivedSpaces,
  );
  const location = useLocation();
  const newSpaceInputRef = useRef<HTMLInputElement>(null);
  console.log(
    "spaces",
    spaces.map((space) => space.id),
  );
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
    if (currentUserId) {
      const tabsCollectionRef = collection(db, "users", currentUserId, "tabs");
      const spacesCollectionRef = collection(
        db,
        "users",
        currentUserId,
        "spaces",
      );
      const tabQ =
        currentPath !== ""
          ? query(tabsCollectionRef, where("spaceId", "==", currentPath))
          : query(tabsCollectionRef);
      const unsubscribeTab = onSnapshot(tabQ, (querySnapshot) => {
        const currentTabs: Tab[] = [];
        if (currentPath !== "") {
          querySnapshot.forEach((doc) => {
            const tab = doc.data() as Tab;
            currentTabs.push(tab);
          });
          const sortedTabs = sortTabs(currentTabs, tabOrder);
          setTabs(sortedTabs);
          return;
        }
        querySnapshot.forEach((doc) => {
          const tab = doc.data() as Tab;
          if (tab.spaceId) return;
          currentTabs.push(tab);
        });
        const sortedTabs = sortTabs(currentTabs, tabOrder);
        setTabs(sortedTabs);
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
    // chrome.runtime.sendMessage(
    //   { action: "getTabs", currentPath, userId: currentUserId },
    //   function (response: Tab[]) {
    //     if (response) {
    //       setTabs(() => {
    //         return response;
    //       });
    //       return;
    //     }
    //   },
    // );
    // chrome.runtime.sendMessage(
    //   { action: "getSpaces", userId: currentUserId },
    //   function (response: Space[]) {
    //     // console.log(1, response, spaces);
    //     if (response) {
    //       setSpaces(() => response);
    //       const currentActiveId = response.find(
    //         (space) => space.id === currentPath,
    //       )?.id;
    //       if (currentPath === "") setActiveSpaceId("");
    //       if (currentActiveId) setActiveSpaceId(currentActiveId);
    //       return;
    //     }
    //   },
    // );
  }, [location.pathname, currentUserId, tabOrder]);
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
        if (doc.exists()) {
          const order: number[] = doc.data()?.tabOrder;
          if (order) setTabOrder(order);
        }
      });
      return () => {
        unsubscribeTabOrder();
      };
    }
  }, [currentUserId, location.pathname]);
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
        const deletedTabId = request.tabId;
        setTabs((t) => t.filter((tab) => tab.tabId !== deletedTabId));
        sendResponse({ success: true });
      }
      if (request.action === "tabUpdated") {
        const updatedTab = request.updatedTab;
        setTabs((t) => {
          const tabExists = t.some((tab) => tab.tabId === updatedTab.tabId);
          if (!tabExists) return [...t, updatedTab];
          return t.map((tab) => {
            if (tab.tabId === updatedTab.tabId) return updatedTab;
            return tab;
          });
        });
        sendResponse({ success: true });
      }
      return true;
    };
    chrome.runtime.onMessage.addListener(handleMessagePassing);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessagePassing);
    };
  }, []);
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
    if (id) setActivePopupId(id);
  }
  function selectSpace(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedSpace(e.target.value);
    if (e.target.value === "") return;
    const request = {
      action: "moveTabToSpace",
      updatedTab: tabs.find((tab) => tab.id?.toString() === activePopupId),
      spaceId: e.target.value,
      userId: currentUserId,
    };
    chrome.runtime.sendMessage(request, function (response) {
      const oldTabs = tabs.filter(
        (tab) => tab.id?.toString() !== activePopupId,
      );
      if (response) setTabs(oldTabs);
    });
  }
  function openAddSpacePopup() {
    const targetModal = document.getElementById(
      "add_space",
    ) as HTMLDialogElement | null;
    if (targetModal) targetModal.showModal();
    console.log("open modal", targetModal);
  }
  //TODO:限制spaces數量上限為10個，因為可以不去考慮這個區塊的往下滾動造成popup和overflow-y的衝突
  function addNewSpace() {
    const newSpaceTitle: string | undefined =
      newSpaceInputRef.current?.value.trim();
    if (!newSpaceTitle || newSpaceTitle.trim().length === 0)
      return alert("Please enter a space name");
    if (newSpaceTitle.length > 15)
      return alert("Space name should be less than 15 characters");
    if (
      spaces.some(
        (space) => space.title.toLowerCase() === newSpaceTitle.toLowerCase(),
      )
    )
      return alert("Space name already exists");
    if (spaces.length >= 10)
      return alert("You can only create up to 10 spaces");
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
        { action: "updateTabOrder", newTabs, spaceId, userId: currentUserId },
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
      alert("Link copied!");
    } catch (err) {
      console.error(err);
      alert("Failed to copy link. Please try again.");
    }
  }
  // function signOut() {
  //   chrome.runtime.sendMessage(
  //     { action: "signOut" },
  //     async (response: { success: boolean }) => {
  //       if (response.success) {
  //         await chrome.storage.local.set({
  //           isLoggedin: false,
  //           currentUser: "",
  //         });
  //         setIsLoggedin(false);
  //         return;
  //       }
  //     },
  //   );
  // }
  // function signIn() {
  //   chrome.runtime.sendMessage(
  //     { action: "signIn" },
  //     async (response: { success: boolean; token: string; userId: string }) => {
  //       console.log("response:", { response });
  //       if (response.success && response.token && response.userId) {
  //         await chrome.storage.local.set({
  //           isLoggedin: true,
  //           currentUser: response.userId,
  //         });
  //         setCurrentUserId(response.userId);
  //         setIsLoggedin(true);
  //         return;
  //       }
  //       return;
  //     },
  //   );
  // }

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
  return (
    <>
      <Header />
      <div className="flex w-full max-w-6xl gap-5 overflow-x-hidden py-8 pl-80 xl:ml-2">
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
        <div className="flex flex-col">
          <div className="flex items-center gap-8 pb-4">
            {location.pathname !== "/webtime" && (
              <>
                <h1 className="text-3xl font-bold">Your Tabs</h1>
                <CopyToClipboard onCopySpaceLink={copySpaceLink} />
              </>
            )}
            {location.pathname === "/webtime" && (
              <h1 className="text-3xl">Your Time Spent on Websites</h1>
            )}
            {/* <button
              onClick={() => setShowArchived(!showArchived)}
              className="h-8 w-36 rounded-md bg-gray-500 text-lg
               text-white hover:bg-black"
            >
              {showArchived ? "Hide Archive" : "Show Archive"}
            </button> */}
            {/* {isLoggedin && (
              <button
                onClick={signOut}
                className="h-10 w-40 rounded-md border bg-black text-white"
              >
                Sign Out
              </button>
            )}
            {!isLoggedin && (
              <button
                onClick={signIn}
                className="h-10 w-40 rounded-md border bg-black text-white"
              >
                Sign In
              </button>
            )} */}
            {/* TODO: 新增一個按鈕讓使用者分享當下觀看的space的連結 */}
          </div>
          <Outlet />
          <Tabs
            tabs={tabs}
            spaces={spaces}
            activePopupId={activePopupId}
            selectedSpace={selectedSpace}
            isLoggedin={isLoggedin}
            openLink={openLink}
            openSpacesPopup={openSpacesPopup}
            selectSpace={selectSpace}
            closeTab={closeTab}
            handleTabOrderChange={handleTabOrderChange}
            toggleTabPin={toggleTabPin}
          />
        </div>
      </div>
    </>
  );
};

export default NewTab;
