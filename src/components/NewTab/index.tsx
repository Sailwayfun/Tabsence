import { useState, useEffect, useRef } from "react";
import { FieldValue } from "firebase/firestore";
import { useLocation, Link } from "react-router-dom";
import Spaces from "./Spaces";
import logo from "../../assets/logo.png";
import TabCard from "./TabCard";

export interface Tab extends chrome.tabs.Tab {
  lastAccessed: FieldValue;
  spaceId?: string;
  tabId: number | undefined;
  isArchived: boolean;
}
export interface Space {
  id: string;
  title: string;
}
interface Response {
  success: boolean;
}
const NewTab = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activePopupId, setActivePopupId] = useState<string | undefined>();
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [showAddSpacePopup, setShowAddSpacePopup] = useState<boolean>(false);
  const [activeSpaceId, setActiveSpaceId] = useState<string>("");
  const [isLoggedin, setIsLoggedin] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  console.log("tabs:", tabs);
  const location = useLocation();
  const newSpaceInputRef = useRef<HTMLInputElement>(null);
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
    function getNewTabs(response: Tab[], tabs: Tab[]) {
      return response.filter(
        (newTab: Tab) =>
          !tabs.some((existingTab) => existingTab.tabId === newTab.tabId),
      );
    }
    const currentPath = location.pathname.split("/")[1];
    chrome.runtime.sendMessage(
      { action: "getTabs", currentPath, userId: currentUserId },
      function (response) {
        if (response) {
          setTabs((t) => getNewTabs(response, t));
          return;
        }
      },
    );
    chrome.runtime.sendMessage(
      { action: "getSpaces", userId: currentUserId },
      function (response: Space[]) {
        if (response) {
          setSpaces(response);
          const currentActiveId = response.find(
            (space) => space.id === currentPath,
          )?.id;
          if (currentPath === "") setActiveSpaceId("");
          if (currentActiveId) setActiveSpaceId(currentActiveId);
          return;
        }
      },
    );
  }, [location.pathname, currentUserId]);
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
    setShowAddSpacePopup(true);
  }
  function closeAddSpacePopup() {
    setShowAddSpacePopup(false);
  }
  function addNewSpace() {
    const newSpaceTitle: string | undefined =
      newSpaceInputRef.current?.value.trim();
    if (!newSpaceTitle || newSpaceTitle.trim().length === 0)
      return alert("Please enter a space name");
    if (
      spaces.some(
        (space) => space.title.toLowerCase() === newSpaceTitle.toLowerCase(),
      )
    )
      return alert("Space name already exists");
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
  return (
    <>
      <Link to="/" className="contents">
        <img src={logo} className="h-16 w-32 rounded-md" />
      </Link>
      <div className="flex w-full gap-5 py-8">
        {isLoggedin && (
          <Spaces
            spaces={spaces}
            onOpenAddSpacePopup={openAddSpacePopup}
            onCloseAddSpacePopup={closeAddSpacePopup}
            isAddSpacePopupOpen={showAddSpacePopup}
            ref={newSpaceInputRef}
            onAddNewSpace={addNewSpace}
            currentSpaceId={activeSpaceId}
          />
        )}
        <div className="flex flex-col">
          <div className="flex gap-3">
            <h1 className="mb-4 text-3xl">Your Tabs</h1>
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
          <ul className="flex flex-col gap-3">
            {isLoggedin &&
              tabs.length > 0 &&
              tabs.map((tab, index) => {
                return (
                  <TabCard
                    key={tab.tabId}
                    tab={tab}
                    spaces={spaces}
                    popupId={activePopupId}
                    onOpenLink={openLink}
                    onOpenSpacesPopup={openSpacesPopup}
                    onSelectSpace={selectSpace}
                    onCloseTab={closeTab}
                    selectedSpace={selectedSpace}
                    isFirstTab={index === 0}
                    isLastTab={tabs.length - 1 === index}
                    onTabOrderChange={handleTabOrderChange}
                  ></TabCard>
                );
              })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default NewTab;
