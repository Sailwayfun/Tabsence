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
  const location = useLocation();
  const newSpaceInputRef = useRef<HTMLInputElement>(null);
  console.log({ selectedSpace });
  useEffect(() => {
    function getNewTabs(response: Tab[], tabs: Tab[]) {
      return response.filter(
        (newTab: Tab) =>
          !tabs.some((existingTab) => existingTab.tabId === newTab.tabId),
      );
    }
    const currentPath = location.pathname.split("/")[1];
    console.log({ currentPath });
    chrome.runtime.sendMessage(
      { action: "getTabs", currentPath },
      function (response) {
        if (response) {
          setTabs((t) => getNewTabs(response, t));
          return;
        }
      },
    );
    chrome.runtime.sendMessage(
      { action: "getSpaces" },
      function (response: Space[]) {
        console.log({ response });
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
  }, [location.pathname]);
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
      console.log({ request });
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
      { action: "addSpace", newSpaceTitle },
      function (response) {
        if (response) {
          setSpaces((s) => [...s, { title: newSpaceTitle, id: response.id }]);
          return;
        }
      },
    );
    if (newSpaceInputRef.current) newSpaceInputRef.current.value = "";
  }
  function handleTabOrderChange(tabId: number, direction: "up" | "down"): void {
    const movedTab = tabs.find((tab) => tab.tabId === tabId);
    if (!movedTab) return;
    const newTabs = [...tabs];
    newTabs.splice(tabs.indexOf(movedTab), 1);
    newTabs.splice(
      tabs.indexOf(movedTab) + (direction === "up" ? -1 : 1),
      0,
      movedTab,
    );
    return setTabs(newTabs);
  }
  return (
    <>
      <Link to="/" className="contents">
        <img src={logo} className="h-16 w-32 rounded-md" />
      </Link>
      <div className="flex w-full gap-5 py-8">
        <Spaces
          spaces={spaces}
          onOpenAddSpacePopup={openAddSpacePopup}
          onCloseAddSpacePopup={closeAddSpacePopup}
          isAddSpacePopupOpen={showAddSpacePopup}
          ref={newSpaceInputRef}
          onAddNewSpace={addNewSpace}
          currentSpaceId={activeSpaceId}
        />
        <div className="flex flex-col">
          <h1 className="mb-4 text-3xl">Your Tabs</h1>
          {/* <a
            href={`mailto:test123@gmail.com?subject=test&body=${tabs.map(
              (tab) => tab.url,
            )}`}
            className="w-10"
          >
            Share Space
          </a> */}
          <ul className="flex flex-col gap-3">
            {tabs.length > 0 &&
              tabs.map((tab, index) => {
                const uniqueKey: string = `${tab.url}-${tab.title}`;
                return (
                  <TabCard
                    key={uniqueKey}
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
