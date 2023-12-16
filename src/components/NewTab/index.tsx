import { useState, useEffect, useRef } from "react";
import { useArchivedSpaceStore } from "../../store";
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
import { validateSpaceTitle } from "../../utils/validate";
import ToggleViewBtn from "./ToggleViewBtn";
import useWindowId from "../../hooks/useWindowId";
import useLogin from "../../hooks/useLogin";
import { Tab } from "../../types/tab";
import { Space, SpaceDoc } from "../../types/space";
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
  const [activeSpaceId, setActiveSpaceId] = useState<string>("");
  const { isLoggedin, currentUserId } = useLogin();
  const [tabOrder, setTabOrder] = useState<number[]>([]);
  const [isTabsGrid, setIsTabsGrid] = useState<boolean>(false);
  const archivedSpaces: string[] = useArchivedSpaceStore(
    (state) => state.archivedSpaces,
  );
  const location = useLocation();
  const newSpaceInputRef = useRef<HTMLInputElement>(null);
  const currentWindowId = useWindowId();

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
          const sortedTabs = sortTabs(currentTabs, tabOrder);
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
          currentSpaces.push({ id: doc.id, isEditing: false, ...space });
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
        message.updatedTab.windowId === currentWindowId
      ) {
        setTabs((t) => {
          const updatedTabs: Tab[] = [...t];
          console.log("updatedTabs", updatedTabs);

          const existingTab: Tab | undefined = updatedTabs.find(
            (tab) => tab.tabId === message.updatedTab.tabId,
          );
          if (existingTab) {
            Object.assign(existingTab, message.updatedTab);
          } else {
            updatedTabs.push(message.updatedTab);
          }
          console.log("updatedTabsupdatedTabs", updatedTabs);
          return updatedTabs;
        });
        setTabOrder((o) => {
          console.log("原有的tabOrder", o);
          if (message.updatedTab.tabId === undefined) return o;
          const updatedOrder = [...o];
          const existingIndex = updatedOrder.findIndex(
            (id) => id === message.updatedTab.tabId,
          );
          console.log("exist!!!", existingIndex);
          if (existingIndex !== -1) {
            // updatedOrder.splice(existingIndex, 1);
            return updatedOrder;
          }
          updatedOrder.push(message.updatedTab.tabId);

          console.log("更新後的tabOrder", updatedOrder);
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
      const message = {
        action: "closeTab",
        tabId: parseInt(id),
        userId: currentUserId,
      };
      chrome.runtime.sendMessage(message, function (response) {
        const oldTabs = tabs.filter((tab) => tab.tabId !== parseInt(id));
        if (!response.sucess) {
          toast.success("Tab Deleted", {
            className: "w-52 text-lg rounded-md shadow",
            id: "tab_deleted",
          });
        }
        setTabs(oldTabs);
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
      const newTabs = tabs.filter(
        (tab) => tab.tabId?.toString() !== activeSpaceSelectId,
      );
      if (response) {
        toast.success("Tab moved to space", {
          className: "w-60 text-lg rounded-md shadow",
          duration: 2000,
        });
        setTabs(newTabs);
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
      "create",
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
          setSpaces((s) => [
            ...s,
            { title: newSpaceTitle, isEditing: false, id: response.id },
          ]);
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
          windowId: currentWindowId,
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

  function handleSpaceTitleChange(
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) {
    const newSpaces = spaces.map((space) => {
      if (space.id === id) {
        if (e.target.value.length > 10) {
          toast.error("test", {
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
      "edit",
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
            currentSpaceId={activeSpaceId}
            onRemoveSpace={handleRemoveSpace}
            onSpaceEditBlur={handleSpaceEditBlur}
            onSpaceTitleChange={handleSpaceTitleChange}
            onEditSpace={handleEditSpace}
            isWebtimePage={isWebTime}
          />
        )}
        <div className={`flex ${isWebTime ? "w-full" : "w-5/6"} flex-col`}>
          <div className="flex items-center gap-8 pb-4">
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
