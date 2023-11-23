import { useState, useEffect, useRef } from "react";
import { FieldValue } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import Spaces from "./Spaces";
import MoveToSpace from "./MoveToSpace";
import CloseBtn from "./CloseBtn";

export interface Tab extends chrome.tabs.Tab {
  lastAccessed: FieldValue;
  spaceId: string;
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
  const [selectedSpace, setSelectedSpace] = useState<string | undefined>();
  const [showAddSpacePopup, setShowAddSpacePopup] = useState<boolean>(false);
  const location = useLocation();
  const newSpaceInputRef = useRef<HTMLInputElement>(null);
  console.log({ spaces });
  useEffect(() => {
    function getNewTabs(response: Tab[], tabs: Tab[]) {
      return response.filter(
        (newTab: Tab) =>
          !tabs.some((existingTab) => existingTab.tabId === newTab.tabId),
      );
    }
    const query = location.pathname.split("/")[1];
    console.log({ query });
    chrome.runtime.sendMessage(
      { action: "getTabs", query },
      function (response) {
        if (response) {
          setTabs((t) => getNewTabs(response, t));
          return;
        }
      },
    );
    setSpaces([
      { title: "Unsaved", id: "OyUOBRt0XlFnQfG5LSdu" },
      { title: "AppWorks School", id: "z3xPL4r4l9N3xPGggrzB" },
      { title: "Family", id: "9fVOHBpO0MKrnI46GnA2" },
    ]);
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
    const id: string | undefined = e.currentTarget.dataset.id;
    if (id) setActivePopupId(id);
  }
  function selectSpace(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedSpace(e.target.value);
    // if (e.target.value === "Unsaved") return;
    const request = {
      action: "moveTab",
      updatedTab: tabs.find((tab) => tab.id?.toString() === activePopupId),
      spaceId: e.target.value,
      spaceName: e.target.selectedOptions[0].text,
    };
    chrome.runtime.sendMessage(request, function (response) {
      const oldTabs = tabs.filter(
        (tab) => tab.id?.toString() !== activePopupId,
      );
      if (response) setTabs(oldTabs);
    });
    setSelectedSpace(undefined);
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
    const newSpaceId: string = "";
    if (!newSpaceTitle || newSpaceTitle.trim().length === 0)
      return alert("Please enter a space name");
    if (
      spaces.some(
        (space) => space.title.toLowerCase() === newSpaceTitle.toLowerCase(),
      )
    )
      return alert("Space name already exists");
    setSpaces((s) => [...s, { title: newSpaceTitle, id: newSpaceId }]);
    if (newSpaceInputRef.current) newSpaceInputRef.current.value = "";
  }
  return (
    <div className="flex w-full gap-5 py-8">
      <Spaces
        spaces={spaces}
        onOpenAddSpacePopup={openAddSpacePopup}
        onCloseAddSpacePopup={closeAddSpacePopup}
        isAddSpacePopupOpen={showAddSpacePopup}
        ref={newSpaceInputRef}
        onAddNewSpace={addNewSpace}
      />
      <div className="flex flex-col">
        <h1 className="mb-4 text-3xl">Your Tabs</h1>
        <ul className="flex flex-col gap-3">
          {tabs.length > 0 &&
            tabs.map((tab) => {
              const uniqueKey: string = `${tab.url}-${tab.title}`;
              return (
                <li
                  key={uniqueKey}
                  className="flex items-center gap-3 rounded-lg border px-4 py-2 text-lg hover:bg-slate-300"
                >
                  <img
                    src={tab.favIconUrl}
                    className="h-4 w-4 border bg-white"
                  />
                  <a
                    onClick={(e) => openLink(e, tab)}
                    className="cursor-pointer hover:text-gray-500 hover:underline"
                  >
                    {tab.title}
                  </a>
                  <MoveToSpace
                    spaces={spaces}
                    id={tab.id?.toString()}
                    onOpenSpacesPopup={openSpacesPopup}
                  />
                  <CloseBtn id={tab.tabId?.toString()} onCloseTab={closeTab} />
                  {tab.id?.toString() === activePopupId && (
                    <div className="ml-5 h-14 w-52 rounded-md border px-3">
                      <label
                        htmlFor={tab.id?.toString() || "spaces"}
                        className="text-xl"
                      >
                        Move to space:
                      </label>
                      <select
                        id={tab.id?.toString() || "spaces"}
                        onChange={selectSpace}
                        value={selectedSpace}
                      >
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
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default NewTab;
